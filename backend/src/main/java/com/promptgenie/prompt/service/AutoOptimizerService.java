package com.promptgenie.prompt.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class AutoOptimizerService {
    
    private final Map<String, OptimizationTask> optimizationTasks = new ConcurrentHashMap<>();
    private final Map<String, ABTest> abTests = new ConcurrentHashMap<>();
    private final Map<String, PromptVersion> promptVersions = new ConcurrentHashMap<>();
    private final Map<String, OptimizationMetric> metrics = new ConcurrentHashMap<>();
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);
    
    // 启动自动优化任务
    public OptimizationTask startOptimizationTask(String taskId, String promptId, Map<String, Object> config) {
        OptimizationTask task = new OptimizationTask(
            taskId,
            promptId,
            config,
            "RUNNING",
            System.currentTimeMillis(),
            null
        );
        
        optimizationTasks.put(taskId, task);
        
        // 异步执行优化任务
        executorService.submit(() -> {
            try {
                executeOptimization(task);
            } catch (Exception e) {
                task.setStatus("FAILED");
                task.setCompletedAt(System.currentTimeMillis());
            }
        });
        
        return task;
    }
    
    // 执行优化任务
    private void executeOptimization(OptimizationTask task) {
        try {
            // 1. 生成多个提示词变体
            List<PromptVersion> variants = generatePromptVariants(task.getPromptId(), task.getConfig());
            
            // 2. 运行A/B测试
            String testId = "test_" + task.getTaskId();
            ABTest abTest = createABTest(testId, variants, task.getConfig());
            
            // 3. 收集和分析结果
            analyzeTestResults(abTest);
            
            // 4. 选择最佳版本
            PromptVersion bestVersion = selectBestVersion(variants);
            
            // 5. 更新任务状态
            task.setStatus("COMPLETED");
            task.setCompletedAt(System.currentTimeMillis());
            task.setBestVersionId(bestVersion != null ? bestVersion.getVersionId() : null);
            
        } catch (Exception e) {
            task.setStatus("FAILED");
            task.setCompletedAt(System.currentTimeMillis());
        }
    }
    
    // 生成提示词变体
    private List<PromptVersion> generatePromptVariants(String promptId, Map<String, Object> config) {
        List<PromptVersion> variants = new ArrayList<>();
        
        // 从配置中获取优化参数
        int variantCount = (int) config.getOrDefault("variant_count", 5);
        Map<String, List<Object>> parameters = (Map<String, List<Object>>) config.getOrDefault("parameters", new HashMap<>());
        
        // 生成变体
        for (int i = 1; i <= variantCount; i++) {
            String versionId = promptId + "_v" + i;
            Map<String, Object> versionParams = generateVariantParams(parameters);
            
            PromptVersion variant = new PromptVersion(
                versionId,
                promptId,
                "Variant " + i,
                versionParams,
                System.currentTimeMillis()
            );
            
            promptVersions.put(versionId, variant);
            variants.add(variant);
        }
        
        return variants;
    }
    
    // 生成变体参数
    private Map<String, Object> generateVariantParams(Map<String, List<Object>> parameters) {
        Map<String, Object> params = new HashMap<>();
        
        for (Map.Entry<String, List<Object>> entry : parameters.entrySet()) {
            String paramName = entry.getKey();
            List<Object> options = entry.getValue();
            
            if (!options.isEmpty()) {
                int randomIndex = new Random().nextInt(options.size());
                params.put(paramName, options.get(randomIndex));
            }
        }
        
        return params;
    }
    
    // 创建A/B测试
    private ABTest createABTest(String testId, List<PromptVersion> variants, Map<String, Object> config) {
        ABTest abTest = new ABTest(
            testId,
            "Auto Optimization Test",
            variants.stream().map(PromptVersion::getVersionId).toList(),
            (int) config.getOrDefault("sample_size", 100),
            "RUNNING",
            System.currentTimeMillis(),
            null
        );
        
        abTests.put(testId, abTest);
        
        // 模拟测试运行
        runABTest(abTest, variants);
        
        return abTest;
    }
    
    // 运行A/B测试
    private void runABTest(ABTest abTest, List<PromptVersion> variants) {
        // 模拟测试数据收集
        for (String versionId : abTest.getVersionIds()) {
            // 模拟收集100个样本的结果
            for (int i = 0; i < abTest.getSampleSize(); i++) {
                recordMetric(versionId, "success_rate", Math.random() * 0.5 + 0.5); // 50-100%
                recordMetric(versionId, "response_time", Math.random() * 2000 + 500); // 500-2500ms
                recordMetric(versionId, "cost", Math.random() * 0.01 + 0.001); // $0.001-$0.011
            }
        }
        
        abTest.setStatus("COMPLETED");
        abTest.setCompletedAt(System.currentTimeMillis());
    }
    
    // 记录指标
    private void recordMetric(String versionId, String metricName, double value) {
        String key = versionId + "_" + metricName;
        OptimizationMetric metric = metrics.get(key);
        
        if (metric == null) {
            metric = new OptimizationMetric(
                key,
                versionId,
                metricName,
                new ArrayList<>(),
                System.currentTimeMillis()
            );
            metrics.put(key, metric);
        }
        
        metric.getValues().add(value);
    }
    
    // 分析测试结果
    private void analyzeTestResults(ABTest abTest) {
        // 计算每个版本的指标
        for (String versionId : abTest.getVersionIds()) {
            calculateVersionMetrics(versionId);
        }
    }
    
    // 计算版本指标
    private void calculateVersionMetrics(String versionId) {
        // 计算成功率
        OptimizationMetric successRateMetric = metrics.get(versionId + "_success_rate");
        if (successRateMetric != null) {
            double avgSuccessRate = successRateMetric.getValues().stream().mapToDouble(Double::doubleValue).average().orElse(0);
            PromptVersion version = promptVersions.get(versionId);
            if (version != null) {
                version.getMetrics().put("avg_success_rate", avgSuccessRate);
            }
        }
        
        // 计算平均响应时间
        OptimizationMetric responseTimeMetric = metrics.get(versionId + "_response_time");
        if (responseTimeMetric != null) {
            double avgResponseTime = responseTimeMetric.getValues().stream().mapToDouble(Double::doubleValue).average().orElse(0);
            PromptVersion version = promptVersions.get(versionId);
            if (version != null) {
                version.getMetrics().put("avg_response_time", avgResponseTime);
            }
        }
        
        // 计算平均成本
        OptimizationMetric costMetric = metrics.get(versionId + "_cost");
        if (costMetric != null) {
            double avgCost = costMetric.getValues().stream().mapToDouble(Double::doubleValue).average().orElse(0);
            PromptVersion version = promptVersions.get(versionId);
            if (version != null) {
                version.getMetrics().put("avg_cost", avgCost);
            }
        }
    }
    
    // 选择最佳版本
    private PromptVersion selectBestVersion(List<PromptVersion> variants) {
        if (variants.isEmpty()) {
            return null;
        }
        
        // 计算每个版本的综合得分
        for (PromptVersion version : variants) {
            double score = calculateVersionScore(version);
            version.setScore(score);
        }
        
        // 按得分排序，选择最高的
        variants.sort(Comparator.comparingDouble(PromptVersion::getScore).reversed());
        return variants.get(0);
    }
    
    // 计算版本得分
    private double calculateVersionScore(PromptVersion version) {
        Map<String, Double> metrics = version.getMetrics();
        
        double successRate = metrics.getOrDefault("avg_success_rate", 0.0);
        double responseTime = metrics.getOrDefault("avg_response_time", 2000.0);
        double cost = metrics.getOrDefault("avg_cost", 0.01);
        
        // 计算综合得分（成功率权重最高，响应时间和成本次之）
        double score = (successRate * 0.6) + 
                      (1.0 / (responseTime / 1000) * 0.2) + 
                      (1.0 / (cost * 100) * 0.2);
        
        return score;
    }
    
    // 停止优化任务
    public void stopOptimizationTask(String taskId) {
        OptimizationTask task = optimizationTasks.get(taskId);
        if (task != null) {
            task.setStatus("STOPPED");
            task.setCompletedAt(System.currentTimeMillis());
        }
    }
    
    // 获取优化任务
    public OptimizationTask getOptimizationTask(String taskId) {
        return optimizationTasks.get(taskId);
    }
    
    // 获取所有优化任务
    public List<OptimizationTask> getOptimizationTasks() {
        return new ArrayList<>(optimizationTasks.values());
    }
    
    // 获取A/B测试
    public ABTest getABTest(String testId) {
        return abTests.get(testId);
    }
    
    // 获取提示词版本
    public PromptVersion getPromptVersion(String versionId) {
        return promptVersions.get(versionId);
    }
    
    // 优化任务类
    public static class OptimizationTask {
        private String taskId;
        private String promptId;
        private Map<String, Object> config;
        private String status;
        private long createdAt;
        private Long completedAt;
        private String bestVersionId;
        
        public OptimizationTask(String taskId, String promptId, Map<String, Object> config, String status, long createdAt, Long completedAt) {
            this.taskId = taskId;
            this.promptId = promptId;
            this.config = config;
            this.status = status;
            this.createdAt = createdAt;
            this.completedAt = completedAt;
        }
        
        // Getters and setters
        public String getTaskId() { return taskId; }
        public void setTaskId(String taskId) { this.taskId = taskId; }
        public String getPromptId() { return promptId; }
        public void setPromptId(String promptId) { this.promptId = promptId; }
        public Map<String, Object> getConfig() { return config; }
        public void setConfig(Map<String, Object> config) { this.config = config; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public Long getCompletedAt() { return completedAt; }
        public void setCompletedAt(Long completedAt) { this.completedAt = completedAt; }
        public String getBestVersionId() { return bestVersionId; }
        public void setBestVersionId(String bestVersionId) { this.bestVersionId = bestVersionId; }
    }
    
    // A/B测试类
    public static class ABTest {
        private String testId;
        private String name;
        private List<String> versionIds;
        private int sampleSize;
        private String status;
        private long createdAt;
        private Long completedAt;
        
        public ABTest(String testId, String name, List<String> versionIds, int sampleSize, String status, long createdAt, Long completedAt) {
            this.testId = testId;
            this.name = name;
            this.versionIds = versionIds;
            this.sampleSize = sampleSize;
            this.status = status;
            this.createdAt = createdAt;
            this.completedAt = completedAt;
        }
        
        // Getters and setters
        public String getTestId() { return testId; }
        public void setTestId(String testId) { this.testId = testId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<String> getVersionIds() { return versionIds; }
        public void setVersionIds(List<String> versionIds) { this.versionIds = versionIds; }
        public int getSampleSize() { return sampleSize; }
        public void setSampleSize(int sampleSize) { this.sampleSize = sampleSize; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public Long getCompletedAt() { return completedAt; }
        public void setCompletedAt(Long completedAt) { this.completedAt = completedAt; }
    }
    
    // 提示词版本类
    public static class PromptVersion {
        private String versionId;
        private String promptId;
        private String name;
        private Map<String, Object> parameters;
        private Map<String, Double> metrics;
        private double score;
        private long createdAt;
        
        public PromptVersion(String versionId, String promptId, String name, Map<String, Object> parameters, long createdAt) {
            this.versionId = versionId;
            this.promptId = promptId;
            this.name = name;
            this.parameters = parameters;
            this.metrics = new HashMap<>();
            this.score = 0.0;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getVersionId() { return versionId; }
        public void setVersionId(String versionId) { this.versionId = versionId; }
        public String getPromptId() { return promptId; }
        public void setPromptId(String promptId) { this.promptId = promptId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Map<String, Object> getParameters() { return parameters; }
        public void setParameters(Map<String, Object> parameters) { this.parameters = parameters; }
        public Map<String, Double> getMetrics() { return metrics; }
        public void setMetrics(Map<String, Double> metrics) { this.metrics = metrics; }
        public double getScore() { return score; }
        public void setScore(double score) { this.score = score; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 优化指标类
    public static class OptimizationMetric {
        private String metricId;
        private String versionId;
        private String metricName;
        private List<Double> values;
        private long createdAt;
        
        public OptimizationMetric(String metricId, String versionId, String metricName, List<Double> values, long createdAt) {
            this.metricId = metricId;
            this.versionId = versionId;
            this.metricName = metricName;
            this.values = values;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getMetricId() { return metricId; }
        public void setMetricId(String metricId) { this.metricId = metricId; }
        public String getVersionId() { return versionId; }
        public void setVersionId(String versionId) { this.versionId = versionId; }
        public String getMetricName() { return metricName; }
        public void setMetricName(String metricName) { this.metricName = metricName; }
        public List<Double> getValues() { return values; }
        public void setValues(List<Double> values) { this.values = values; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
}