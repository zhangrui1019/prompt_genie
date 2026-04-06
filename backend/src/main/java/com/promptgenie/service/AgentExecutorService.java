package com.promptgenie.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promptgenie.core.enums.AgentNodeType;
import com.promptgenie.core.exception.PendingApprovalException;
import com.promptgenie.dto.AgentState;
import com.promptgenie.entity.Agent;
import com.promptgenie.entity.AgentConfig;
import com.promptgenie.entity.Tool;
import com.promptgenie.mapper.AgentMapper;
import com.promptgenie.mapper.AgentToolMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AgentExecutorService {
    
    @Autowired
    private AgentMapper agentMapper;
    
    @Autowired
    private AgentToolMapper agentToolMapper;
    
    @Autowired
    private ToolService toolService;
    
    @Autowired
    private PlaygroundService playgroundService;
    
    @Autowired
    private AgentConfigService agentConfigService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public AgentState runAgent(Long agentId, Long userId, Map<String, Object> variables) {
        // 获取智能体信息
        Agent agent = agentMapper.selectById(agentId);
        if (agent == null) {
            throw new RuntimeException("Agent not found");
        }
        
        // 初始化状态
        AgentState state = new AgentState();
        state.setId(UUID.randomUUID().toString());
        state.setAgentId(agentId);
        state.setUserId(userId);
        state.setMessages(new ArrayList<>());
        state.setVariables(variables != null ? variables : new HashMap<>());
        state.setIntermediateResults(new HashMap<>());
        state.setCurrentNodeId("start"); // 假设从 start 节点开始
        state.setStatus("RUNNING");
        state.setCreatedAt(System.currentTimeMillis());
        state.setUpdatedAt(System.currentTimeMillis());
        
        // 执行状态机
        return executeStateMachine(state, agent);
    }
    
    public AgentState resumeAgent(String stateId, Map<String, Object> approvalData) {
        // 这里应该从数据库或Redis中获取保存的状态
        // 简化实现，假设状态可以直接通过ID获取
        AgentState state = new AgentState();
        // 加载状态...
        
        // 更新状态
        state.setStatus("RUNNING");
        state.setVariables(approvalData);
        state.setUpdatedAt(System.currentTimeMillis());
        
        // 继续执行状态机
        Agent agent = agentMapper.selectById(state.getAgentId());
        return executeStateMachine(state, agent);
    }
    
    private AgentState executeStateMachine(AgentState state, Agent agent) {
        try {
            // 循环执行直到完成或需要人工审核
            while ("RUNNING".equals(state.getStatus())) {
                // 根据当前节点类型执行不同的逻辑
                String currentNodeId = state.getCurrentNodeId();
                
                // 从配置中获取节点类型
                AgentNodeType nodeType = getNodeType(currentNodeId, agent);
                
                switch (nodeType) {
                    case LLM_NODE:
                        executeLLMNode(state, agent, currentNodeId);
                        break;
                    case TOOL_NODE:
                        executeToolNode(state, agent, currentNodeId);
                        break;
                    case HUMAN_APPROVAL_NODE:
                        executeHumanApprovalNode(state, agent, currentNodeId);
                        break;
                    case CONDITION_NODE:
                        executeConditionNode(state, agent, currentNodeId);
                        break;
                    case LOOP_NODE:
                        executeLoopNode(state, agent, currentNodeId);
                        break;
                    case ERROR_RETRY_NODE:
                        executeErrorRetryNode(state, agent, currentNodeId);
                        break;
                    default:
                        throw new RuntimeException("Unknown node type: " + nodeType);
                }
                
                // 更新当前节点
                state.setCurrentNodeId(getNextNodeId(currentNodeId, state, agent));
                state.setUpdatedAt(System.currentTimeMillis());
                
                // 检查是否完成
                if ("end".equals(state.getCurrentNodeId())) {
                    state.setStatus("COMPLETED");
                }
            }
            
            return state;
        } catch (PendingApprovalException e) {
            // 遇到人工审核节点，抛出异常
            throw e;
        } catch (Exception e) {
            // 其他错误
            state.setStatus("FAILED");
            state.setErrorMessage(e.getMessage());
            return state;
        }
    }
    
    private AgentNodeType getNodeType(String nodeId, Agent agent) {
        try {
            // 从智能体配置中获取节点类型
            AgentConfig config = agentConfigService.getLatestConfig(agent.getId());
            if (config != null) {
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
            }
        } catch (Exception e) {
            // 如果配置解析失败，使用默认逻辑
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
    
    private String getNextNodeId(String currentNodeId, AgentState state, Agent agent) {
        try {
            // 从智能体配置中获取下一个节点
            AgentConfig config = agentConfigService.getLatestConfig(agent.getId());
            if (config != null) {
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
            }
        } catch (Exception e) {
            // 如果配置解析失败，使用默认逻辑
        }
        
        // 默认逻辑
        if ("start".equals(currentNodeId)) {
            return "tool";
        } else if ("tool".equals(currentNodeId)) {
            return "human";
        } else if ("human".equals(currentNodeId)) {
            return "condition";
        } else if ("condition".equals(currentNodeId)) {
            // 根据条件结果决定下一个节点
            boolean conditionResult = (boolean) state.getIntermediateResults().getOrDefault("conditionResult", true);
            return conditionResult ? "loop" : "end";
        } else if ("loop".equals(currentNodeId)) {
            // 根据循环条件决定是否继续循环
            boolean continueLoop = (boolean) state.getIntermediateResults().getOrDefault("continueLoop", false);
            return continueLoop ? "tool" : "end";
        } else if ("error".equals(currentNodeId)) {
            return "end";
        } else {
            return "end";
        }
    }
    
    private void executeLLMNode(AgentState state, Agent agent, String nodeId) {
        try {
            // 从配置中获取节点配置
            Map<String, Object> nodeConfig = getNodeConfig(nodeId, agent);
            
            // 构建提示词
            String systemPrompt = agent.getSystemPrompt();
            if (nodeConfig.containsKey("systemPrompt")) {
                systemPrompt = nodeConfig.get("systemPrompt").toString();
            }
            
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
            parameters.put("max_tokens", nodeConfig.getOrDefault("maxTokens", 2048));
            
            // 获取模型名称
            String modelName = nodeConfig.getOrDefault("model", "Qwen Turbo").toString();
            
            // 调用大模型
            String result = playgroundService.runPrompt(prompt.toString(), state.getVariables(), "text", modelName, parameters);
            
            // 保存结果
            state.getMessages().add(new AgentState.Message("assistant", result));
            state.getIntermediateResults().put("llmResult", result);
        } catch (Exception e) {
            throw new RuntimeException("Failed to execute LLM node", e);
        }
    }
    
    private void executeToolNode(AgentState state, Agent agent, String nodeId) {
        try {
            // 从配置中获取节点配置
            Map<String, Object> nodeConfig = getNodeConfig(nodeId, agent);
            
            // 获取工具ID
            Long toolId = Long.valueOf(nodeConfig.get("toolId").toString());
            
            // 执行工具
            Object toolResult = toolService.executeTool(toolId, state.getVariables());
            
            // 保存结果
            state.getIntermediateResults().put("toolResult", toolResult);
            state.getMessages().add(new AgentState.Message("tool", toolResult.toString()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to execute tool node", e);
        }
    }
    
    private void executeHumanApprovalNode(AgentState state, Agent agent, String nodeId) {
        // 从配置中获取节点配置
        Map<String, Object> nodeConfig = getNodeConfig(nodeId, agent);
        
        // 设置状态为暂停
        state.setStatus("PAUSED");
        
        // 保存审批配置
        state.getIntermediateResults().put("approvalConfig", nodeConfig);
        
        // 抛出异常，触发人工审核
        throw new PendingApprovalException(nodeConfig.getOrDefault("approvalMessage", "Human approval required").toString(), state);
    }
    
    private void executeConditionNode(AgentState state, Agent agent, String nodeId) {
        // 从配置中获取节点配置
        Map<String, Object> nodeConfig = getNodeConfig(nodeId, agent);
        
        // 获取条件表达式
        String conditionExpression = nodeConfig.getOrDefault("condition", "toolResult != null && toolResult.toString().contains('success')").toString();
        
        // 执行条件表达式
        boolean conditionResult = evaluateCondition(conditionExpression, state);
        
        state.getIntermediateResults().put("conditionResult", conditionResult);
    }
    
    private void executeLoopNode(AgentState state, Agent agent, String nodeId) {
        // 从配置中获取节点配置
        Map<String, Object> nodeConfig = getNodeConfig(nodeId, agent);
        
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
    
    private void executeErrorRetryNode(AgentState state, Agent agent, String nodeId) {
        // 从配置中获取节点配置
        Map<String, Object> nodeConfig = getNodeConfig(nodeId, agent);
        
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
    
    private Map<String, Object> getNodeConfig(String nodeId, Agent agent) {
        Map<String, Object> config = new HashMap<>();
        try {
            AgentConfig agentConfig = agentConfigService.getLatestConfig(agent.getId());
            if (agentConfig != null) {
                JsonNode configJson = objectMapper.readTree(agentConfig.getConfigJson());
                JsonNode nodes = configJson.get("nodes");
                if (nodes != null && nodes.isArray()) {
                    for (JsonNode node : nodes) {
                        if (node.get("id").asText().equals(nodeId)) {
                            JsonNode data = node.get("data");
                            if (data != null) {
                                // 将 JsonNode 转换为 Map
                                config = objectMapper.treeToValue(data, Map.class);
                            }
                            break;
                        }
                    }
                }
            }
        } catch (Exception e) {
            // 如果配置解析失败，返回空配置
        }
        return config;
    }
    
    private boolean evaluateCondition(String expression, AgentState state) {
        try {
            // 简化的条件表达式评估
            // 这里可以使用更复杂的表达式引擎，如 SpEL 或 JEXL
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
}