package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AgentBuilderService {
    
    private final Map<String, Agent> agents = new ConcurrentHashMap<>();
    private final Map<String, Tool> tools = new ConcurrentHashMap<>();
    private final Map<String, MemoryConfig> memoryConfigs = new ConcurrentHashMap<>();
    private final Map<String, BotDeployment> botDeployments = new ConcurrentHashMap<>();
    
    // 初始化智能体构建器服务
    public void init() {
        // 初始化默认工具
        initDefaultTools();
    }
    
    // 初始化默认工具
    private void initDefaultTools() {
        createTool("google_search", "Google Search", "Search the web using Google", "https://api.google.com/search");
        createTool("calculator", "Calculator", "Perform mathematical calculations", "https://api.calculator.com/calculate");
        createTool("database_query", "Database Query", "Query a database", "https://api.database.com/query");
        createTool("weather", "Weather", "Get current weather information", "https://api.weather.com/current");
        createTool("translate", "Translate", "Translate text between languages", "https://api.translate.com/translate");
    }
    
    // 创建工具
    public Tool createTool(String toolId, String name, String description, String endpoint) {
        Tool tool = new Tool(
            toolId,
            name,
            description,
            endpoint,
            System.currentTimeMillis()
        );
        tools.put(toolId, tool);
        return tool;
    }
    
    // 创建智能体
    public Agent createAgent(String agentId, String name, String description, String promptId) {
        Agent agent = new Agent(
            agentId,
            name,
            description,
            promptId,
            new ArrayList<>(),
            null,
            System.currentTimeMillis()
        );
        agents.put(agentId, agent);
        return agent;
    }
    
    // 为智能体添加工具
    public void addToolToAgent(String agentId, String toolId) {
        Agent agent = agents.get(agentId);
        Tool tool = tools.get(toolId);
        
        if (agent != null && tool != null) {
            if (!agent.getToolIds().contains(toolId)) {
                agent.getToolIds().add(toolId);
            }
        }
    }
    
    // 从智能体移除工具
    public void removeToolFromAgent(String agentId, String toolId) {
        Agent agent = agents.get(agentId);
        if (agent != null) {
            agent.getToolIds().remove(toolId);
        }
    }
    
    // 配置智能体记忆
    public MemoryConfig configureAgentMemory(String agentId, String memoryType, Map<String, Object> memoryParams) {
        Agent agent = agents.get(agentId);
        if (agent == null) {
            throw new IllegalArgumentException("Agent not found: " + agentId);
        }
        
        String memoryId = agentId + "_memory";
        MemoryConfig memoryConfig = new MemoryConfig(
            memoryId,
            agentId,
            memoryType, // window, vector_db
            memoryParams,
            System.currentTimeMillis()
        );
        memoryConfigs.put(memoryId, memoryConfig);
        agent.setMemoryConfigId(memoryId);
        
        return memoryConfig;
    }
    
    // 发布智能体为Bot
    public BotDeployment deployAgentAsBot(String agentId, String platform, Map<String, Object> deploymentParams) {
        Agent agent = agents.get(agentId);
        if (agent == null) {
            throw new IllegalArgumentException("Agent not found: " + agentId);
        }
        
        String deploymentId = agentId + "_bot_" + platform;
        BotDeployment deployment = new BotDeployment(
            deploymentId,
            agentId,
            platform, // telegram, discord, slack, web
            deploymentParams,
            "deploying",
            System.currentTimeMillis()
        );
        botDeployments.put(deploymentId, deployment);
        
        // 模拟部署过程
        deployBot(deployment);
        
        return deployment;
    }
    
    // 部署Bot
    private void deployBot(BotDeployment deployment) {
        new Thread(() -> {
            try {
                // 模拟部署延迟
                Thread.sleep(2000);
                
                // 更新部署状态
                deployment.setStatus("deployed");
                deployment.setDeployedAt(System.currentTimeMillis());
                
                // 生成部署URL或令牌
                String accessUrl = generateDeploymentAccessUrl(deployment);
                deployment.setAccessUrl(accessUrl);
            } catch (Exception e) {
                deployment.setStatus("failed");
                deployment.setError(e.getMessage());
            }
        }).start();
    }
    
    // 生成部署访问URL
    private String generateDeploymentAccessUrl(BotDeployment deployment) {
        switch (deployment.getPlatform()) {
            case "telegram":
                return "https://t.me/" + deployment.getDeploymentParams().getOrDefault("botName", "prompt_genie_bot");
            case "discord":
                return "https://discord.com/oauth2/authorize?client_id=" + deployment.getDeploymentParams().getOrDefault("clientId", "123456789");
            case "slack":
                return "https://slack.com/oauth/v2/authorize?client_id=" + deployment.getDeploymentParams().getOrDefault("clientId", "123456789");
            case "web":
                return "https://promptgenie.com/embed/bot/" + deployment.getAgentId();
            default:
                return "https://promptgenie.com/bots/" + deployment.getAgentId();
        }
    }
    
    // 停止Bot部署
    public void stopBotDeployment(String deploymentId) {
        BotDeployment deployment = botDeployments.get(deploymentId);
        if (deployment != null) {
            deployment.setStatus("stopped");
            deployment.setStoppedAt(System.currentTimeMillis());
        }
    }
    
    // 获取智能体
    public Agent getAgent(String agentId) {
        return agents.get(agentId);
    }
    
    // 获取智能体列表
    public List<Agent> getAgents() {
        return new ArrayList<>(agents.values());
    }
    
    // 获取工具列表
    public List<Tool> getTools() {
        return new ArrayList<>(tools.values());
    }
    
    // 获取智能体的工具
    public List<Tool> getAgentTools(String agentId) {
        Agent agent = agents.get(agentId);
        if (agent == null) {
            return new ArrayList<>();
        }
        
        List<Tool> agentTools = new ArrayList<>();
        for (String toolId : agent.getToolIds()) {
            Tool tool = tools.get(toolId);
            if (tool != null) {
                agentTools.add(tool);
            }
        }
        return agentTools;
    }
    
    // 获取智能体的记忆配置
    public MemoryConfig getAgentMemoryConfig(String agentId) {
        Agent agent = agents.get(agentId);
        if (agent == null || agent.getMemoryConfigId() == null) {
            return null;
        }
        return memoryConfigs.get(agent.getMemoryConfigId());
    }
    
    // 获取智能体的Bot部署
    public List<BotDeployment> getAgentBotDeployments(String agentId) {
        List<BotDeployment> deployments = new ArrayList<>();
        for (BotDeployment deployment : botDeployments.values()) {
            if (agentId.equals(deployment.getAgentId())) {
                deployments.add(deployment);
            }
        }
        return deployments;
    }
    
    // 智能体类
    public static class Agent {
        private String id;
        private String name;
        private String description;
        private String promptId;
        private List<String> toolIds;
        private String memoryConfigId;
        private long createdAt;
        
        public Agent(String id, String name, String description, String promptId, List<String> toolIds, String memoryConfigId, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.promptId = promptId;
            this.toolIds = toolIds;
            this.memoryConfigId = memoryConfigId;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getPromptId() { return promptId; }
        public void setPromptId(String promptId) { this.promptId = promptId; }
        public List<String> getToolIds() { return toolIds; }
        public void setToolIds(List<String> toolIds) { this.toolIds = toolIds; }
        public String getMemoryConfigId() { return memoryConfigId; }
        public void setMemoryConfigId(String memoryConfigId) { this.memoryConfigId = memoryConfigId; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 工具类
    public static class Tool {
        private String id;
        private String name;
        private String description;
        private String endpoint;
        private long createdAt;
        
        public Tool(String id, String name, String description, String endpoint, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.endpoint = endpoint;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 记忆配置类
    public static class MemoryConfig {
        private String id;
        private String agentId;
        private String memoryType; // window, vector_db
        private Map<String, Object> memoryParams;
        private long createdAt;
        
        public MemoryConfig(String id, String agentId, String memoryType, Map<String, Object> memoryParams, long createdAt) {
            this.id = id;
            this.agentId = agentId;
            this.memoryType = memoryType;
            this.memoryParams = memoryParams;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAgentId() { return agentId; }
        public void setAgentId(String agentId) { this.agentId = agentId; }
        public String getMemoryType() { return memoryType; }
        public void setMemoryType(String memoryType) { this.memoryType = memoryType; }
        public Map<String, Object> getMemoryParams() { return memoryParams; }
        public void setMemoryParams(Map<String, Object> memoryParams) { this.memoryParams = memoryParams; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // Bot部署类
    public static class BotDeployment {
        private String id;
        private String agentId;
        private String platform; // telegram, discord, slack, web
        private Map<String, Object> deploymentParams;
        private String status; // deploying, deployed, failed, stopped
        private String accessUrl;
        private String error;
        private long createdAt;
        private long deployedAt;
        private long stoppedAt;
        
        public BotDeployment(String id, String agentId, String platform, Map<String, Object> deploymentParams, String status, long createdAt) {
            this.id = id;
            this.agentId = agentId;
            this.platform = platform;
            this.deploymentParams = deploymentParams;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAgentId() { return agentId; }
        public void setAgentId(String agentId) { this.agentId = agentId; }
        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }
        public Map<String, Object> getDeploymentParams() { return deploymentParams; }
        public void setDeploymentParams(Map<String, Object> deploymentParams) { this.deploymentParams = deploymentParams; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAccessUrl() { return accessUrl; }
        public void setAccessUrl(String accessUrl) { this.accessUrl = accessUrl; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getDeployedAt() { return deployedAt; }
        public void setDeployedAt(long deployedAt) { this.deployedAt = deployedAt; }
        public long getStoppedAt() { return stoppedAt; }
        public void setStoppedAt(long stoppedAt) { this.stoppedAt = stoppedAt; }
    }
}