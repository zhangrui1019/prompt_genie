package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class SmartRouterService {
    
    private final Map<String, Model> models = new ConcurrentHashMap<>();
    private final Map<String, RouterConfig> routerConfigs = new ConcurrentHashMap<>();
    private final Map<String, ModelPerformance> modelPerformances = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> modelRequestCounts = new ConcurrentHashMap<>();
    
    // 初始化智能路由网关服务
    public void init() {
        // 初始化默认模型
        initDefaultModels();
        
        // 初始化默认路由配置
        initDefaultRouterConfigs();
    }
    
    // 初始化默认模型
    private void initDefaultModels() {
        // 添加默认模型
        addModel("gpt4", "GPT-4", "OpenAI", 0.03, 0.06, 95, true);
        addModel("gpt35", "GPT-3.5 Turbo", "OpenAI", 0.0015, 0.002, 85, true);
        addModel("qwen-turbo", "Qwen Turbo", "Alibaba", 0.0005, 0.001, 80, true);
        addModel("llama3", "Llama 3", "Meta", 0.0008, 0.0012, 82, true);
        addModel("gemini", "Gemini Pro", "Google", 0.001, 0.002, 88, true);
    }
    
    // 初始化默认路由配置
    private void initDefaultRouterConfigs() {
        // 省钱模式
        createRouterConfig("cost_saving", "省钱模式", Map.of(
            "strategy", "cost",
            "max_cost_per_request", 0.01,
            "min_quality_score", 75
        ));
        
        // 性能模式
        createRouterConfig("performance", "性能模式", Map.of(
            "strategy", "quality",
            "max_cost_per_request", 0.1,
            "min_quality_score", 90
        ));
        
        // 平衡模式
        createRouterConfig("balanced", "平衡模式", Map.of(
            "strategy", "balanced",
            "max_cost_per_request", 0.05,
            "min_quality_score", 85
        ));
    }
    
    // 添加模型
    public Model addModel(String modelId, String name, String provider, double inputCost, double outputCost, int qualityScore, boolean enabled) {
        Model model = new Model(
            modelId,
            name,
            provider,
            inputCost, // 每1000 tokens的输入成本
            outputCost, // 每1000 tokens的输出成本
            qualityScore, // 质量评分
            enabled,
            System.currentTimeMillis()
        );
        models.put(modelId, model);
        modelRequestCounts.put(modelId, new AtomicInteger(0));
        return model;
    }
    
    // 创建路由配置
    public RouterConfig createRouterConfig(String configId, String name, Map<String, Object> config) {
        RouterConfig routerConfig = new RouterConfig(
            configId,
            name,
            config,
            System.currentTimeMillis()
        );
        routerConfigs.put(configId, routerConfig);
        return routerConfig;
    }
    
    // 智能路由请求
    public RouterResult routeRequest(String requestId, String prompt, String configId, Map<String, Object> params) {
        RouterConfig config = routerConfigs.get(configId);
        if (config == null) {
            config = routerConfigs.get("balanced"); // 默认使用平衡模式
        }
        
        // 分析请求复杂度
        int complexity = analyzeRequestComplexity(prompt);
        
        // 选择合适的模型
        String selectedModelId = selectModel(config, complexity);
        Model selectedModel = models.get(selectedModelId);
        
        // 执行请求
        Object result = executeModelRequest(selectedModelId, prompt, params);
        
        // 记录性能数据
        recordModelPerformance(selectedModelId, result);
        
        // 增加模型请求计数
        modelRequestCounts.get(selectedModelId).incrementAndGet();
        
        return new RouterResult(
            requestId,
            selectedModelId,
            selectedModel.getName(),
            complexity,
            result,
            System.currentTimeMillis()
        );
    }
    
    // 分析请求复杂度
    private int analyzeRequestComplexity(String prompt) {
        // 基于提示词长度和内容分析复杂度
        int length = prompt.length();
        if (length < 100) {
            return 1; // 简单
        } else if (length < 500) {
            return 2; // 中等
        } else if (length < 1000) {
            return 3; // 复杂
        } else {
            return 4; // 非常复杂
        }
    }
    
    // 选择模型
    private String selectModel(RouterConfig config, int complexity) {
        List<Model> availableModels = new ArrayList<>();
        for (Model model : models.values()) {
            if (model.isEnabled() && model.getQualityScore() >= (int) config.getConfig().getOrDefault("min_quality_score", 75)) {
                availableModels.add(model);
            }
        }
        
        if (availableModels.isEmpty()) {
            throw new IllegalStateException("No available models");
        }
        
        String strategy = (String) config.getConfig().getOrDefault("strategy", "balanced");
        double maxCost = (double) config.getConfig().getOrDefault("max_cost_per_request", 0.05);
        
        switch (strategy) {
            case "cost":
                // 按成本排序
                availableModels.sort(Comparator.comparingDouble(model -> model.getInputCost() + model.getOutputCost()));
                break;
            case "quality":
                // 按质量排序
                availableModels.sort(Comparator.comparingInt(Model::getQualityScore).reversed());
                break;
            case "balanced":
            default:
                // 按性价比排序
                availableModels.sort((a, b) -> {
                    double valueA = (double) a.getQualityScore() / (a.getInputCost() + a.getOutputCost());
                    double valueB = (double) b.getQualityScore() / (b.getInputCost() + b.getOutputCost());
                    return Double.compare(valueB, valueA);
                });
                break;
        }
        
        // 选择第一个符合成本限制的模型
        for (Model model : availableModels) {
            double estimatedCost = estimateCost(model, complexity);
            if (estimatedCost <= maxCost) {
                return model.getId();
            }
        }
        
        // 如果没有符合成本限制的模型，返回第一个模型
        return availableModels.get(0).getId();
    }
    
    // 估算成本
    private double estimateCost(Model model, int complexity) {
        // 基于复杂度估算token数
        int inputTokens = 100 * complexity;
        int outputTokens = 200 * complexity;
        
        return (model.getInputCost() * inputTokens / 1000) + (model.getOutputCost() * outputTokens / 1000);
    }
    
    // 执行模型请求
    private Object executeModelRequest(String modelId, String prompt, Map<String, Object> params) {
        // 这里简化处理，实际应该调用真实的模型API
        return Map.of(
            "model", modelId,
            "prompt", prompt,
            "params", params,
            "response", "This is a response from " + modelId
        );
    }
    
    // 记录模型性能
    private void recordModelPerformance(String modelId, Object result) {
        ModelPerformance performance = modelPerformances.get(modelId);
        if (performance == null) {
            performance = new ModelPerformance(
                modelId,
                0,
                0,
                0,
                System.currentTimeMillis()
            );
            modelPerformances.put(modelId, performance);
        }
        
        performance.setTotalRequests(performance.getTotalRequests() + 1);
        performance.setSuccessfulRequests(performance.getSuccessfulRequests() + 1);
        performance.setLastRequestTime(System.currentTimeMillis());
    }
    
    // 标记模型为不可用
    public void markModelAsUnavailable(String modelId) {
        Model model = models.get(modelId);
        if (model != null) {
            model.setEnabled(false);
        }
    }
    
    // 标记模型为可用
    public void markModelAsAvailable(String modelId) {
        Model model = models.get(modelId);
        if (model != null) {
            model.setEnabled(true);
        }
    }
    
    // 获取模型性能统计
    public ModelPerformance getModelPerformance(String modelId) {
        return modelPerformances.get(modelId);
    }
    
    // 获取所有模型
    public List<Model> getModels() {
        return new ArrayList<>(models.values());
    }
    
    // 获取路由配置
    public List<RouterConfig> getRouterConfigs() {
        return new ArrayList<>(routerConfigs.values());
    }
    
    // 模型类
    public static class Model {
        private String id;
        private String name;
        private String provider;
        private double inputCost; // 每1000 tokens的输入成本
        private double outputCost; // 每1000 tokens的输出成本
        private int qualityScore; // 质量评分
        private boolean enabled;
        private long createdAt;
        
        public Model(String id, String name, String provider, double inputCost, double outputCost, int qualityScore, boolean enabled, long createdAt) {
            this.id = id;
            this.name = name;
            this.provider = provider;
            this.inputCost = inputCost;
            this.outputCost = outputCost;
            this.qualityScore = qualityScore;
            this.enabled = enabled;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getProvider() { return provider; }
        public void setProvider(String provider) { this.provider = provider; }
        public double getInputCost() { return inputCost; }
        public void setInputCost(double inputCost) { this.inputCost = inputCost; }
        public double getOutputCost() { return outputCost; }
        public void setOutputCost(double outputCost) { this.outputCost = outputCost; }
        public int getQualityScore() { return qualityScore; }
        public void setQualityScore(int qualityScore) { this.qualityScore = qualityScore; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 路由配置类
    public static class RouterConfig {
        private String id;
        private String name;
        private Map<String, Object> config;
        private long createdAt;
        
        public RouterConfig(String id, String name, Map<String, Object> config, long createdAt) {
            this.id = id;
            this.name = name;
            this.config = config;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Map<String, Object> getConfig() { return config; }
        public void setConfig(Map<String, Object> config) { this.config = config; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 模型性能类
    public static class ModelPerformance {
        private String modelId;
        private int totalRequests;
        private int successfulRequests;
        private long lastRequestTime;
        private long createdAt;
        
        public ModelPerformance(String modelId, int totalRequests, int successfulRequests, long lastRequestTime, long createdAt) {
            this.modelId = modelId;
            this.totalRequests = totalRequests;
            this.successfulRequests = successfulRequests;
            this.lastRequestTime = lastRequestTime;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getModelId() { return modelId; }
        public void setModelId(String modelId) { this.modelId = modelId; }
        public int getTotalRequests() { return totalRequests; }
        public void setTotalRequests(int totalRequests) { this.totalRequests = totalRequests; }
        public int getSuccessfulRequests() { return successfulRequests; }
        public void setSuccessfulRequests(int successfulRequests) { this.successfulRequests = successfulRequests; }
        public long getLastRequestTime() { return lastRequestTime; }
        public void setLastRequestTime(long lastRequestTime) { this.lastRequestTime = lastRequestTime; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        
        // 计算成功率
        public double getSuccessRate() {
            return totalRequests > 0 ? (double) successfulRequests / totalRequests : 0;
        }
    }
    
    // 路由结果类
    public static class RouterResult {
        private String requestId;
        private String modelId;
        private String modelName;
        private int complexity;
        private Object result;
        private long timestamp;
        
        public RouterResult(String requestId, String modelId, String modelName, int complexity, Object result, long timestamp) {
            this.requestId = requestId;
            this.modelId = modelId;
            this.modelName = modelName;
            this.complexity = complexity;
            this.result = result;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getRequestId() { return requestId; }
        public void setRequestId(String requestId) { this.requestId = requestId; }
        public String getModelId() { return modelId; }
        public void setModelId(String modelId) { this.modelId = modelId; }
        public String getModelName() { return modelName; }
        public void setModelName(String modelName) { this.modelName = modelName; }
        public int getComplexity() { return complexity; }
        public void setComplexity(int complexity) { this.complexity = complexity; }
        public Object getResult() { return result; }
        public void setResult(Object result) { this.result = result; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}