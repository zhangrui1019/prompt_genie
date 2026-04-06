package com.promptgenie.service.edge;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promptgenie.core.enums.AgentNodeType;
import com.promptgenie.core.exception.PendingApprovalException;
import com.promptgenie.dto.AgentState;
import com.promptgenie.entity.Agent;
import com.promptgenie.entity.AgentConfig;
import com.promptgenie.entity.Tool;
import com.promptgenie.service.ToolService;
import com.promptgenie.service.PlaygroundService;
import com.promptgenie.service.AgentConfigService;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class EdgeAgentExecutorImpl implements EdgeAgentExecutor {

    private final Map<String, AgentState> stateCache = new ConcurrentHashMap<>();
    private final Map<Long, AgentConfig> configCache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private ToolService toolService;
    private PlaygroundService playgroundService;
    private AgentConfigService agentConfigService;

    // 设备资源信息
    private final int availableMemoryMb;
    private final int cpuCores;

    public EdgeAgentExecutorImpl(int availableMemoryMb, int cpuCores) {
        this.availableMemoryMb = availableMemoryMb;
        this.cpuCores = cpuCores;
    }

    public void setToolService(ToolService toolService) {
        this.toolService = toolService;
    }

    public void setPlaygroundService(PlaygroundService playgroundService) {
        this.playgroundService = playgroundService;
    }

    public void setAgentConfigService(AgentConfigService agentConfigService) {
        this.agentConfigService = agentConfigService;
    }

    @Override
    public void initialize() {
        // 初始化本地存储
        // 加载缓存的配置
        // 启动定期清理任务
        System.out.println("EdgeAgentExecutor initialized");
    }

    @Override
    public AgentState runAgent(Long agentId, Long userId, Map<String, Object> variables) throws PendingApprovalException {
        // 评估任务复杂度
        TaskComplexity complexity = evaluateTaskComplexity(agentId, variables);
        if (!complexity.isCanRunLocally()) {
            // 任务太复杂，需要上传到中心执行
            throw new EdgeTaskOffloadException("Task too complex for edge execution");
        }

        // 加载智能体配置
        AgentConfig config = loadAgentConfig(agentId);
        if (config == null) {
            throw new RuntimeException("Agent config not found");
        }

        // 初始化状态
        AgentState state = new AgentState();
        state.setId(UUID.randomUUID().toString());
        state.setAgentId(agentId);
        state.setUserId(userId);
        state.setMessages(new ArrayList<>());
        state.setVariables(variables != null ? variables : new HashMap<>());
        state.setIntermediateResults(new HashMap<>());
        state.setCurrentNodeId("start");
        state.setStatus("RUNNING");
        state.setCreatedAt(System.currentTimeMillis());
        state.setUpdatedAt(System.currentTimeMillis());

        // 执行状态机
        return executeStateMachine(state, config);
    }

    @Override
    public AgentState resumeAgent(String stateId, Map<String, Object> approvalData) throws PendingApprovalException {
        AgentState state = loadState(stateId);
        if (state == null) {
            throw new RuntimeException("State not found");
        }

        // 更新状态
        state.setStatus("RUNNING");
        state.setVariables(approvalData);
        state.setUpdatedAt(System.currentTimeMillis());

        // 加载智能体配置
        AgentConfig config = loadAgentConfig(state.getAgentId());
        if (config == null) {
            throw new RuntimeException("Agent config not found");
        }

        // 继续执行状态机
        return executeStateMachine(state, config);
    }

    @Override
    public TaskComplexity evaluateTaskComplexity(Long agentId, Map<String, Object> variables) {
        // 加载智能体配置
        AgentConfig config = loadAgentConfig(agentId);
        if (config == null) {
            return new TaskComplexity(false, 0, 0);
        }

        try {
            // 解析配置
            JsonNode configJson = objectMapper.readTree(config.getConfigJson());
            JsonNode nodes = configJson.get("nodes");

            // 评估节点数量和类型
            int nodeCount = 0;
            int estimatedTimeMs = 0;
            int requiredMemoryMb = 0;

            if (nodes != null && nodes.isArray()) {
                for (JsonNode node : nodes) {
                    nodeCount++;
                    String type = node.get("type").asText();

                    // 根据节点类型估算资源需求
                    switch (type) {
                        case "llmNode":
                            estimatedTimeMs += 5000; // 5秒
                            requiredMemoryMb += 256; // 256MB
                            break;
                        case "toolNode":
                            estimatedTimeMs += 2000; // 2秒
                            requiredMemoryMb += 128; // 128MB
                            break;
                        case "conditionNode":
                        case "loopNode":
                            estimatedTimeMs += 500; // 0.5秒
                            requiredMemoryMb += 32; // 32MB
                            break;
                        default:
                            estimatedTimeMs += 1000; // 1秒
                            requiredMemoryMb += 64; // 64MB
                    }
                }
            }

            // 考虑变量大小
            if (variables != null) {
                int variableSize = objectMapper.writeValueAsString(variables).length();
                requiredMemoryMb += variableSize / (1024 * 1024) + 1; // 每MB计算
            }

            // 检查是否可以在本地运行
            boolean canRunLocally = requiredMemoryMb < availableMemoryMb * 0.8 && estimatedTimeMs < 30000; // 80%内存，30秒内

            return new TaskComplexity(canRunLocally, estimatedTimeMs, requiredMemoryMb);
        } catch (Exception e) {
            // 解析失败，默认不能本地运行
            return new TaskComplexity(false, 0, 0);
        }
    }

    @Override
    public AgentConfig loadAgentConfig(Long agentId) {
        // 先从缓存获取
        AgentConfig config = configCache.get(agentId);
        if (config != null) {
            return config;
        }

        // 从服务获取
        if (agentConfigService != null) {
            config = agentConfigService.getLatestConfig(agentId);
            if (config != null) {
                configCache.put(agentId, config);
            }
        }

        return config;
    }

    @Override
    public void saveState(AgentState state) {
        stateCache.put(state.getId(), state);
        // 可以考虑持久化到本地存储
    }

    @Override
    public AgentState loadState(String stateId) {
        return stateCache.get(stateId);
    }

    @Override
    public void cleanupExpiredStates() {
        long now = System.currentTimeMillis();
        stateCache.entrySet().removeIf(entry -> {
            AgentState state = entry.getValue();
            // 清理30分钟前的状态
            return now - state.getUpdatedAt() > 30 * 60 * 1000;
        });
    }

    @Override
    public void shutdown() {
        stateCache.clear();
        configCache.clear();
        System.out.println("EdgeAgentExecutor shutdown");
    }

    private AgentState executeStateMachine(AgentState state, AgentConfig config) throws PendingApprovalException {
        try {
            while ("RUNNING".equals(state.getStatus())) {
                String currentNodeId = state.getCurrentNodeId();
                AgentNodeType nodeType = getNodeType(currentNodeId, config);

                switch (nodeType) {
                    case LLM_NODE:
                        executeLLMNode(state, config, currentNodeId);
                        break;
                    case TOOL_NODE:
                        executeToolNode(state, config, currentNodeId);
                        break;
                    case HUMAN_APPROVAL_NODE:
                        executeHumanApprovalNode(state, config, currentNodeId);
                        break;
                    case CONDITION_NODE:
                        executeConditionNode(state, config, currentNodeId);
                        break;
                    case LOOP_NODE:
                        executeLoopNode(state, config, currentNodeId);
                        break;
                    case ERROR_RETRY_NODE:
                        executeErrorRetryNode(state, config, currentNodeId);
                        break;
                    default:
                        throw new RuntimeException("Unknown node type: " + nodeType);
                }

                // 更新当前节点
                state.setCurrentNodeId(getNextNodeId(currentNodeId, state, config));
                state.setUpdatedAt(System.currentTimeMillis());

                // 检查是否完成
                if ("end".equals(state.getCurrentNodeId())) {
                    state.setStatus("COMPLETED");
                }

                // 保存状态
                saveState(state);
            }

            return state;
        } catch (PendingApprovalException e) {
            // 遇到人工审核节点，抛出异常
            saveState(state);
            throw e;
        } catch (Exception e) {
            // 其他错误
            state.setStatus("FAILED");
            state.setErrorMessage(e.getMessage());
            saveState(state);
            return state;
        }
    }

    private AgentNodeType getNodeType(String nodeId, AgentConfig config) {
        try {
            JsonNode configJson = objectMapper.readTree(config.getConfigJson());
            JsonNode nodes = configJson.get("nodes");
            if (nodes != null && nodes.isArray()) {
                for (JsonNode node : nodes) {
                    if (node.get("id").asText().equals(nodeId)) {
                        String type = node.get("type").asText();
                        return AgentNodeType.fromValue(type);
                    }
                }
            }
        } catch (Exception e) {
            // 解析失败，使用默认逻辑
        }

        // 默认逻辑
        if ("start".equals(nodeId)) {
            return AgentNodeType.LLM_NODE;
        } else if ("tool".equals(nodeId)) {
            return AgentNodeType.TOOL_NODE;
        } else if ("human".equals(nodeId)) {
            return AgentNodeType.HUMAN_APPROVAL_NODE;
        } else if ("condition".equals(nodeId)) {
            return AgentNodeType.CONDITION_NODE;
        } else if ("loop".equals(nodeId)) {
            return AgentNodeType.LOOP_NODE;
        } else if ("error".equals(nodeId)) {
            return AgentNodeType.ERROR_RETRY_NODE;
        } else {
            return AgentNodeType.LLM_NODE;
        }
    }

    private String getNextNodeId(String currentNodeId, AgentState state, AgentConfig config) {
        try {
            JsonNode configJson = objectMapper.readTree(config.getConfigJson());
            JsonNode edges = configJson.get("edges");
            if (edges != null && edges.isArray()) {
                for (JsonNode edge : edges) {
                    if (edge.get("source").asText().equals(currentNodeId)) {
                        // 对于条件节点，根据条件结果决定下一个节点
                        if ("condition".equals(currentNodeId)) {
                            boolean conditionResult = (boolean) state.getIntermediateResults().getOrDefault("conditionResult", true);
                            String condition = edge.get("condition").asText();
                            if (("true".equals(condition) && conditionResult) || ("false".equals(condition) && !conditionResult)) {
                                return edge.get("target").asText();
                            }
                        } else if ("loop".equals(currentNodeId)) {
                            // 对于循环节点，根据循环条件决定是否继续循环
                            boolean continueLoop = (boolean) state.getIntermediateResults().getOrDefault("continueLoop", false);
                            String condition = edge.get("condition").asText();
                            if (("continue".equals(condition) && continueLoop) || ("break".equals(condition) && !continueLoop)) {
                                return edge.get("target").asText();
                            }
                        } else {
                            // 其他节点直接返回目标节点
                            return edge.get("target").asText();
                        }
                    }
                }
            }
        } catch (Exception e) {
            // 解析失败，使用默认逻辑
        }

        // 默认逻辑
        if ("start".equals(currentNodeId)) {
            return "tool";
        } else if ("tool".equals(currentNodeId)) {
            return "human";
        } else if ("human".equals(currentNodeId)) {
            return "condition";
        } else if ("condition".equals(currentNodeId)) {
            boolean conditionResult = (boolean) state.getIntermediateResults().getOrDefault("conditionResult", true);
            return conditionResult ? "loop" : "end";
        } else if ("loop".equals(currentNodeId)) {
            boolean continueLoop = (boolean) state.getIntermediateResults().getOrDefault("continueLoop", false);
            return continueLoop ? "tool" : "end";
        } else if ("error".equals(currentNodeId)) {
            return "end";
        } else {
            return "end";
        }
    }

    private void executeLLMNode(AgentState state, AgentConfig config, String nodeId) {
        try {
            // 从配置中获取节点配置
            Map<String, Object> nodeConfig = getNodeConfig(nodeId, config);

            // 构建提示词
            String systemPrompt = nodeConfig.getOrDefault("systemPrompt", "You are a helpful assistant").toString();

            StringBuilder prompt = new StringBuilder(systemPrompt);

            // 添加对话历史
            for (AgentState.Message message : state.getMessages()) {
                prompt.append("\n").append(message.getRole()).append(": " ).append(message.getContent());
            }

            // 添加当前变量
            prompt.append("\nVariables: " ).append(state.getVariables().toString());

            // 构建参数
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("temperature", nodeConfig.getOrDefault("temperature", 0.7));
            parameters.put("max_tokens", nodeConfig.getOrDefault("maxTokens", 1024)); // 端侧使用较小的token限制

            // 获取模型名称
            String modelName = nodeConfig.getOrDefault("model", "Qwen Turbo").toString();

            // 调用大模型
            if (playgroundService != null) {
                String result = playgroundService.runPrompt(prompt.toString(), state.getVariables(), "text", modelName, parameters);

                // 保存结果
                state.getMessages().add(new AgentState.Message("assistant", result));
                state.getIntermediateResults().put("llmResult", result);
            } else {
                // 本地没有playground服务，模拟结果
                String result = "This is a simulated response from LLM node";
                state.getMessages().add(new AgentState.Message("assistant", result));
                state.getIntermediateResults().put("llmResult", result);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to execute LLM node", e);
        }
    }

    private void executeToolNode(AgentState state, AgentConfig config, String nodeId) {
        try {
            // 从配置中获取节点配置
            Map<String, Object> nodeConfig = getNodeConfig(nodeId, config);

            // 获取工具ID
            Long toolId = Long.valueOf(nodeConfig.get("toolId").toString());

            // 执行工具
            if (toolService != null) {
                Object toolResult = toolService.executeTool(toolId, state.getVariables());

                // 保存结果
                state.getIntermediateResults().put("toolResult", toolResult);
                state.getMessages().add(new AgentState.Message("tool", toolResult.toString()));
            } else {
                // 本地没有tool服务，模拟结果
                String result = "This is a simulated response from tool node";
                state.getIntermediateResults().put("toolResult", result);
                state.getMessages().add(new AgentState.Message("tool", result));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to execute tool node", e);
        }
    }

    private void executeHumanApprovalNode(AgentState state, AgentConfig config, String nodeId) throws PendingApprovalException {
        // 从配置中获取节点配置
        Map<String, Object> nodeConfig = getNodeConfig(nodeId, config);

        // 设置状态为暂停
        state.setStatus("PAUSED");

        // 保存审批配置
        state.getIntermediateResults().put("approvalConfig", nodeConfig);

        // 抛出异常，触发人工审核
        throw new PendingApprovalException(nodeConfig.getOrDefault("approvalMessage", "Human approval required").toString(), state);
    }

    private void executeConditionNode(AgentState state, AgentConfig config, String nodeId) {
        // 从配置中获取节点配置
        Map<String, Object> nodeConfig = getNodeConfig(nodeId, config);

        // 获取条件表达式
        String conditionExpression = nodeConfig.getOrDefault("condition", "toolResult != null && toolResult.toString().contains('success')").toString();

        // 执行条件表达式
        boolean conditionResult = evaluateCondition(conditionExpression, state);

        state.getIntermediateResults().put("conditionResult", conditionResult);
    }

    private void executeLoopNode(AgentState state, AgentConfig config, String nodeId) {
        // 从配置中获取节点配置
        Map<String, Object> nodeConfig = getNodeConfig(nodeId, config);

        // 获取循环条件
        String loopCondition = nodeConfig.getOrDefault("loopCondition", "loopCount < 3").toString();

        // 更新循环计数
        Integer loopCount = (Integer) state.getIntermediateResults().getOrDefault("loopCount", 0);
        loopCount++;
        state.getIntermediateResults().put("loopCount", loopCount);

        // 执行循环条件
        boolean continueLoop = evaluateCondition(loopCondition, state);
        state.getIntermediateResults().put("continueLoop", continueLoop);
    }

    private void executeErrorRetryNode(AgentState state, AgentConfig config, String nodeId) {
        // 从配置中获取节点配置
        Map<String, Object> nodeConfig = getNodeConfig(nodeId, config);

        // 获取最大重试次数
        int maxRetries = Integer.parseInt(nodeConfig.getOrDefault("maxRetries", "3").toString());

        // 更新重试计数
        Integer retryCount = (Integer) state.getIntermediateResults().getOrDefault("retryCount", 0);
        retryCount++;
        state.getIntermediateResults().put("retryCount", retryCount);

        // 如果重试次数超过限制，标记为失败
        if (retryCount > maxRetries) {
            throw new RuntimeException("Max retry attempts reached");
        }
    }

    private Map<String, Object> getNodeConfig(String nodeId, AgentConfig config) {
        Map<String, Object> nodeConfig = new HashMap<>();
        try {
            JsonNode configJson = objectMapper.readTree(config.getConfigJson());
            JsonNode nodes = configJson.get("nodes");
            if (nodes != null && nodes.isArray()) {
                for (JsonNode node : nodes) {
                    if (node.get("id").asText().equals(nodeId)) {
                        JsonNode data = node.get("data");
                        if (data != null) {
                            nodeConfig = objectMapper.treeToValue(data, Map.class);
                        }
                        break;
                    }
                }
            }
        } catch (Exception e) {
            // 解析失败，返回空配置
        }
        return nodeConfig;
    }

    private boolean evaluateCondition(String expression, AgentState state) {
        try {
            // 简化的条件表达式评估
            Map<String, Object> variables = new HashMap<>();
            variables.putAll(state.getVariables());
            variables.putAll(state.getIntermediateResults());

            // 简单的条件评估
            if (expression.contains("toolResult != null && toolResult.toString().contains('success')")) {
                Object toolResult = state.getIntermediateResults().get("toolResult");
                return toolResult != null && toolResult.toString().contains("success");
            } else if (expression.contains("loopCount < 3")) {
                Integer loopCount = (Integer) state.getIntermediateResults().getOrDefault("loopCount", 0);
                return loopCount < 3;
            } else {
                // 默认返回 true
                return true;
            }
        } catch (Exception e) {
            // 如果评估失败，默认返回 true
            return true;
        }
    }

    /**
     * 边缘任务卸载异常，当任务太复杂需要上传到中心执行时抛出
     */
    public static class EdgeTaskOffloadException extends RuntimeException {
        public EdgeTaskOffloadException(String message) {
            super(message);
        }
    }
}