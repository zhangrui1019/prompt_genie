package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class HybridComputeService {
    
    private final Map<String, EdgeDevice> edgeDevices = new ConcurrentHashMap<>();
    private final Map<String, CloudService> cloudServices = new ConcurrentHashMap<>();
    private final Map<String, ComputeTask> computeTasks = new ConcurrentHashMap<>();
    private final Map<String, TaskRoutingRule> routingRules = new ConcurrentHashMap<>();
    
    // 初始化混合算力调度服务
    public void init() {
        // 初始化默认云服务
        initDefaultCloudServices();
        
        // 初始化默认路由规则
        initDefaultRoutingRules();
    }
    
    // 初始化默认云服务
    private void initDefaultCloudServices() {
        // 创建默认云服务配置
        CloudService openaiService = new CloudService(
            "openai",
            "OpenAI API",
            "https://api.openai.com/v1",
            "gpt-4",
            1000, // QPS limit
            0.002, // $ per token
            System.currentTimeMillis()
        );
        cloudServices.put(openaiService.getId(), openaiService);
        
        CloudService azureService = new CloudService(
            "azure",
            "Azure OpenAI",
            "https://azure.openai.com/v1",
            "gpt-4",
            800, // QPS limit
            0.0025, // $ per token
            System.currentTimeMillis()
        );
        cloudServices.put(azureService.getId(), azureService);
    }
    
    // 初始化默认路由规则
    private void initDefaultRoutingRules() {
        // 创建简单指令路由规则
        TaskRoutingRule simpleRule = new TaskRoutingRule(
            "simple",
            "Simple Commands",
            "Route simple commands to edge devices",
            "edge",
            Arrays.asList("open", "close", "turn on", "turn off", "set", "get"),
            0.0, // priority
            System.currentTimeMillis()
        );
        routingRules.put(simpleRule.getId(), simpleRule);
        
        // 创建复杂指令路由规则
        TaskRoutingRule complexRule = new TaskRoutingRule(
            "complex",
            "Complex Commands",
            "Route complex commands to cloud",
            "cloud",
            Arrays.asList("analyze", "generate", "create", "summarize", "translate"),
            1.0, // priority
            System.currentTimeMillis()
        );
        routingRules.put(complexRule.getId(), complexRule);
    }
    
    // 注册端侧设备
    public EdgeDevice registerEdgeDevice(String deviceId, String deviceType, String deviceName, Map<String, Object> capabilities) {
        EdgeDevice device = new EdgeDevice(
            deviceId,
            deviceType, // android, ios, raspberrypi
            deviceName,
            capabilities,
            "online",
            System.currentTimeMillis()
        );
        edgeDevices.put(deviceId, device);
        return device;
    }
    
    // 提交计算任务
    public ComputeTask submitTask(String taskId, String taskType, String input, Map<String, Object> parameters) {
        // 确定任务路由
        String target = determineTaskRouting(taskType, input);
        
        ComputeTask task = new ComputeTask(
            taskId,
            taskType,
            input,
            parameters,
            target, // edge or cloud
            "pending",
            System.currentTimeMillis()
        );
        computeTasks.put(taskId, task);
        
        // 执行任务
        executeTask(task);
        
        return task;
    }
    
    // 确定任务路由
    private String determineTaskRouting(String taskType, String input) {
        // 应用路由规则
        for (TaskRoutingRule rule : routingRules.values()) {
            for (String keyword : rule.getKeywords()) {
                if (input.toLowerCase().contains(keyword.toLowerCase())) {
                    return rule.getTarget();
                }
            }
        }
        
        // 默认路由到云
        return "cloud";
    }
    
    // 执行任务
    private void executeTask(ComputeTask task) {
        // 异步执行任务
        new Thread(() -> {
            try {
                task.setStatus("running");
                task.setStartedAt(System.currentTimeMillis());
                
                if ("edge".equals(task.getTarget())) {
                    // 在端侧执行
                    executeEdgeTask(task);
                } else {
                    // 在云端执行
                    executeCloudTask(task);
                }
                
                task.setStatus("completed");
                task.setCompletedAt(System.currentTimeMillis());
            } catch (Exception e) {
                task.setStatus("failed");
                task.setError(e.getMessage());
            }
        }).start();
    }
    
    // 在端侧执行任务
    private void executeEdgeTask(ComputeTask task) {
        // 选择合适的端侧设备
        EdgeDevice device = selectEdgeDevice();
        if (device == null) {
            // 没有可用的端侧设备，切换到云端
            executeCloudTask(task);
            return;
        }
        
        // 模拟端侧执行
        try {
            Thread.sleep(1000); // 模拟执行时间
            task.setOutput("Edge device " + device.getDeviceName() + " executed: " + task.getInput());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    // 在云端执行任务
    private void executeCloudTask(ComputeTask task) {
        // 选择合适的云服务
        CloudService service = selectCloudService();
        if (service == null) {
            throw new RuntimeException("No available cloud services");
        }
        
        // 模拟云端执行
        try {
            Thread.sleep(2000); // 模拟执行时间
            task.setOutput("Cloud service " + service.getName() + " executed: " + task.getInput());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    // 选择端侧设备
    private EdgeDevice selectEdgeDevice() {
        // 选择在线的设备
        for (EdgeDevice device : edgeDevices.values()) {
            if ("online".equals(device.getStatus())) {
                return device;
            }
        }
        return null;
    }
    
    // 选择云服务
    private CloudService selectCloudService() {
        // 简单选择第一个可用的云服务
        return cloudServices.values().iterator().next();
    }
    
    // 获取任务状态
    public ComputeTask getTaskStatus(String taskId) {
        return computeTasks.get(taskId);
    }
    
    // 获取设备列表
    public List<EdgeDevice> getEdgeDevices() {
        return new ArrayList<>(edgeDevices.values());
    }
    
    // 获取云服务列表
    public List<CloudService> getCloudServices() {
        return new ArrayList<>(cloudServices.values());
    }
    
    // 更新设备状态
    public void updateDeviceStatus(String deviceId, String status) {
        EdgeDevice device = edgeDevices.get(deviceId);
        if (device != null) {
            device.setStatus(status);
            device.setLastUpdatedAt(System.currentTimeMillis());
        }
    }
    
    // 创建路由规则
    public TaskRoutingRule createRoutingRule(String id, String name, String description, String target, List<String> keywords, double priority) {
        TaskRoutingRule rule = new TaskRoutingRule(
            id,
            name,
            description,
            target,
            keywords,
            priority,
            System.currentTimeMillis()
        );
        routingRules.put(id, rule);
        return rule;
    }
    
    // 端侧设备类
    public static class EdgeDevice {
        private String id;
        private String deviceType; // android, ios, raspberrypi
        private String deviceName;
        private Map<String, Object> capabilities;
        private String status; // online, offline, busy
        private long createdAt;
        private long lastUpdatedAt;
        
        public EdgeDevice(String id, String deviceType, String deviceName, Map<String, Object> capabilities, String status, long createdAt) {
            this.id = id;
            this.deviceType = deviceType;
            this.deviceName = deviceName;
            this.capabilities = capabilities;
            this.status = status;
            this.createdAt = createdAt;
            this.lastUpdatedAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDeviceType() { return deviceType; }
        public void setDeviceType(String deviceType) { this.deviceType = deviceType; }
        public String getDeviceName() { return deviceName; }
        public void setDeviceName(String deviceName) { this.deviceName = deviceName; }
        public Map<String, Object> getCapabilities() { return capabilities; }
        public void setCapabilities(Map<String, Object> capabilities) { this.capabilities = capabilities; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getLastUpdatedAt() { return lastUpdatedAt; }
        public void setLastUpdatedAt(long lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
    }
    
    // 云服务类
    public static class CloudService {
        private String id;
        private String name;
        private String endpoint;
        private String model;
        private int qpsLimit;
        private double costPerToken;
        private long createdAt;
        
        public CloudService(String id, String name, String endpoint, String model, int qpsLimit, double costPerToken, long createdAt) {
            this.id = id;
            this.name = name;
            this.endpoint = endpoint;
            this.model = model;
            this.qpsLimit = qpsLimit;
            this.costPerToken = costPerToken;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        public int getQpsLimit() { return qpsLimit; }
        public void setQpsLimit(int qpsLimit) { this.qpsLimit = qpsLimit; }
        public double getCostPerToken() { return costPerToken; }
        public void setCostPerToken(double costPerToken) { this.costPerToken = costPerToken; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 计算任务类
    public static class ComputeTask {
        private String id;
        private String taskType;
        private String input;
        private Map<String, Object> parameters;
        private String target; // edge, cloud
        private String status; // pending, running, completed, failed
        private String output;
        private String error;
        private long createdAt;
        private long startedAt;
        private long completedAt;
        
        public ComputeTask(String id, String taskType, String input, Map<String, Object> parameters, String target, String status, long createdAt) {
            this.id = id;
            this.taskType = taskType;
            this.input = input;
            this.parameters = parameters;
            this.target = target;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTaskType() { return taskType; }
        public void setTaskType(String taskType) { this.taskType = taskType; }
        public String getInput() { return input; }
        public void setInput(String input) { this.input = input; }
        public Map<String, Object> getParameters() { return parameters; }
        public void setParameters(Map<String, Object> parameters) { this.parameters = parameters; }
        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getOutput() { return output; }
        public void setOutput(String output) { this.output = output; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getStartedAt() { return startedAt; }
        public void setStartedAt(long startedAt) { this.startedAt = startedAt; }
        public long getCompletedAt() { return completedAt; }
        public void setCompletedAt(long completedAt) { this.completedAt = completedAt; }
    }
    
    // 任务路由规则类
    public static class TaskRoutingRule {
        private String id;
        private String name;
        private String description;
        private String target; // edge, cloud
        private List<String> keywords;
        private double priority;
        private long createdAt;
        
        public TaskRoutingRule(String id, String name, String description, String target, List<String> keywords, double priority, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.target = target;
            this.keywords = keywords;
            this.priority = priority;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }
        public List<String> getKeywords() { return keywords; }
        public void setKeywords(List<String> keywords) { this.keywords = keywords; }
        public double getPriority() { return priority; }
        public void setPriority(double priority) { this.priority = priority; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
}