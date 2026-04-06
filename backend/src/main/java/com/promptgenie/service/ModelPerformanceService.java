package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class ModelPerformanceService {
    
    private final Map<Long, List<PerformanceMetric>> performanceMetrics = new HashMap<>();
    private final Map<Long, PerformanceThreshold> performanceThresholds = new HashMap<>();
    private final List<PerformanceAlert> performanceAlerts = new ArrayList<>();
    
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    // 初始化模型性能监控服务
    public void init() {
        // 启动定时任务，定期分析性能数据
        scheduler.scheduleAtFixedRate(this::analyzePerformanceData, 0, 10, TimeUnit.MINUTES);
    }
    
    // 记录模型性能指标
    public void recordPerformanceMetric(Long modelId, String metricType, double value, long timestamp) {
        PerformanceMetric metric = new PerformanceMetric(modelId, metricType, value, timestamp);
        List<PerformanceMetric> metrics = performanceMetrics.computeIfAbsent(modelId, k -> new ArrayList<>());
        metrics.add(metric);
        
        // 限制指标数量，只保留最近的1000个指标
        if (metrics.size() > 1000) {
            metrics.subList(0, metrics.size() - 1000).clear();
        }
        
        // 检查是否超过阈值
        checkPerformanceThreshold(modelId, metricType, value);
    }
    
    // 检查性能阈值
    private void checkPerformanceThreshold(Long modelId, String metricType, double value) {
        PerformanceThreshold threshold = performanceThresholds.get(modelId);
        if (threshold != null) {
            double thresholdValue = getThresholdValue(threshold, metricType);
            if (isThresholdExceeded(metricType, value, thresholdValue)) {
                // 生成告警
                PerformanceAlert alert = new PerformanceAlert(
                    modelId,
                    metricType,
                    value,
                    thresholdValue,
                    System.currentTimeMillis(),
                    "active"
                );
                performanceAlerts.add(alert);
            }
        }
    }
    
    // 获取阈值
    private double getThresholdValue(PerformanceThreshold threshold, String metricType) {
        switch (metricType) {
            case "response_time":
                return threshold.getMaxResponseTime();
            case "error_rate":
                return threshold.getMaxErrorRate();
            case "accuracy":
                return threshold.getMinAccuracy();
            case "recall":
                return threshold.getMinRecall();
            case "precision":
                return threshold.getMinPrecision();
            default:
                return 0.0;
        }
    }
    
    // 检查是否超过阈值
    private boolean isThresholdExceeded(String metricType, double value, double threshold) {
        switch (metricType) {
            case "response_time":
            case "error_rate":
                return value > threshold;
            case "accuracy":
            case "recall":
            case "precision":
                return value < threshold;
            default:
                return false;
        }
    }
    
    // 设置性能阈值
    public void setPerformanceThreshold(Long modelId, PerformanceThreshold threshold) {
        performanceThresholds.put(modelId, threshold);
    }
    
    // 获取模型的性能指标
    public List<PerformanceMetric> getModelPerformanceMetrics(Long modelId) {
        return performanceMetrics.getOrDefault(modelId, Collections.emptyList());
    }
    
    // 获取模型的性能阈值
    public PerformanceThreshold getModelPerformanceThreshold(Long modelId) {
        return performanceThresholds.get(modelId);
    }
    
    // 分析性能数据
    private void analyzePerformanceData() {
        for (Long modelId : performanceMetrics.keySet()) {
            List<PerformanceMetric> metrics = performanceMetrics.get(modelId);
            if (metrics.isEmpty()) {
                continue;
            }
            
            // 分析性能趋势
            Map<String, List<Double>> metricValues = new HashMap<>();
            for (PerformanceMetric metric : metrics) {
                List<Double> values = metricValues.computeIfAbsent(metric.getMetricType(), k -> new ArrayList<>());
                values.add(metric.getValue());
            }
            
            // 计算平均值、最大值、最小值
            for (Map.Entry<String, List<Double>> entry : metricValues.entrySet()) {
                String metricType = entry.getKey();
                List<Double> values = entry.getValue();
                
                double average = values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                double max = values.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
                double min = values.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
                
                System.out.println("Model " + modelId + " - " + metricType + ": average=" + average + ", max=" + max + ", min=" + min);
            }
        }
    }
    
    // 获取性能告警
    public List<PerformanceAlert> getPerformanceAlerts() {
        return performanceAlerts;
    }
    
    // 解决性能告警
    public void resolvePerformanceAlert(long alertId) {
        PerformanceAlert alert = performanceAlerts.stream()
            .filter(a -> a.getId() == alertId)
            .findFirst()
            .orElse(null);
        
        if (alert != null) {
            alert.setStatus("resolved");
            alert.setResolvedAt(System.currentTimeMillis());
        }
    }
    
    // 获取模型性能报告
    public PerformanceReport getModelPerformanceReport(Long modelId) {
        List<PerformanceMetric> metrics = performanceMetrics.getOrDefault(modelId, Collections.emptyList());
        Map<String, PerformanceStats> stats = new HashMap<>();
        
        // 计算各项指标的统计数据
        Map<String, List<Double>> metricValues = new HashMap<>();
        for (PerformanceMetric metric : metrics) {
            List<Double> values = metricValues.computeIfAbsent(metric.getMetricType(), k -> new ArrayList<>());
            values.add(metric.getValue());
        }
        
        for (Map.Entry<String, List<Double>> entry : metricValues.entrySet()) {
            String metricType = entry.getKey();
            List<Double> values = entry.getValue();
            
            double average = values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            double max = values.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
            double min = values.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
            double variance = calculateVariance(values, average);
            double standardDeviation = Math.sqrt(variance);
            
            stats.put(metricType, new PerformanceStats(average, max, min, variance, standardDeviation));
        }
        
        return new PerformanceReport(modelId, stats, System.currentTimeMillis());
    }
    
    // 计算方差
    private double calculateVariance(List<Double> values, double mean) {
        double sum = 0.0;
        for (double value : values) {
            sum += Math.pow(value - mean, 2);
        }
        return sum / values.size();
    }
    
    // 关闭性能监控服务
    public void shutdown() {
        scheduler.shutdown();
    }
    
    // 性能指标类
    public static class PerformanceMetric {
        private Long modelId;
        private String metricType; // response_time, error_rate, accuracy, recall, precision
        private double value;
        private long timestamp;
        
        public PerformanceMetric(Long modelId, String metricType, double value, long timestamp) {
            this.modelId = modelId;
            this.metricType = metricType;
            this.value = value;
            this.timestamp = timestamp;
        }
        
        // Getters
        public Long getModelId() { return modelId; }
        public String getMetricType() { return metricType; }
        public double getValue() { return value; }
        public long getTimestamp() { return timestamp; }
    }
    
    // 性能阈值类
    public static class PerformanceThreshold {
        private double maxResponseTime;
        private double maxErrorRate;
        private double minAccuracy;
        private double minRecall;
        private double minPrecision;
        
        public PerformanceThreshold(double maxResponseTime, double maxErrorRate, double minAccuracy, double minRecall, double minPrecision) {
            this.maxResponseTime = maxResponseTime;
            this.maxErrorRate = maxErrorRate;
            this.minAccuracy = minAccuracy;
            this.minRecall = minRecall;
            this.minPrecision = minPrecision;
        }
        
        // Getters and setters
        public double getMaxResponseTime() { return maxResponseTime; }
        public void setMaxResponseTime(double maxResponseTime) { this.maxResponseTime = maxResponseTime; }
        public double getMaxErrorRate() { return maxErrorRate; }
        public void setMaxErrorRate(double maxErrorRate) { this.maxErrorRate = maxErrorRate; }
        public double getMinAccuracy() { return minAccuracy; }
        public void setMinAccuracy(double minAccuracy) { this.minAccuracy = minAccuracy; }
        public double getMinRecall() { return minRecall; }
        public void setMinRecall(double minRecall) { this.minRecall = minRecall; }
        public double getMinPrecision() { return minPrecision; }
        public void setMinPrecision(double minPrecision) { this.minPrecision = minPrecision; }
    }
    
    // 性能告警类
    public static class PerformanceAlert {
        private static long nextId = 1;
        private long id;
        private Long modelId;
        private String metricType;
        private double value;
        private double threshold;
        private long createdAt;
        private long resolvedAt;
        private String status; // active, resolved
        
        public PerformanceAlert(Long modelId, String metricType, double value, double threshold, long createdAt, String status) {
            this.id = nextId++;
            this.modelId = modelId;
            this.metricType = metricType;
            this.value = value;
            this.threshold = threshold;
            this.createdAt = createdAt;
            this.status = status;
        }
        
        // Getters and setters
        public long getId() { return id; }
        public Long getModelId() { return modelId; }
        public String getMetricType() { return metricType; }
        public double getValue() { return value; }
        public double getThreshold() { return threshold; }
        public long getCreatedAt() { return createdAt; }
        public long getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(long resolvedAt) { this.resolvedAt = resolvedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // 性能统计类
    public static class PerformanceStats {
        private double average;
        private double max;
        private double min;
        private double variance;
        private double standardDeviation;
        
        public PerformanceStats(double average, double max, double min, double variance, double standardDeviation) {
            this.average = average;
            this.max = max;
            this.min = min;
            this.variance = variance;
            this.standardDeviation = standardDeviation;
        }
        
        // Getters
        public double getAverage() { return average; }
        public double getMax() { return max; }
        public double getMin() { return min; }
        public double getVariance() { return variance; }
        public double getStandardDeviation() { return standardDeviation; }
    }
    
    // 性能报告类
    public static class PerformanceReport {
        private Long modelId;
        private Map<String, PerformanceStats> stats;
        private long generatedAt;
        
        public PerformanceReport(Long modelId, Map<String, PerformanceStats> stats, long generatedAt) {
            this.modelId = modelId;
            this.stats = stats;
            this.generatedAt = generatedAt;
        }
        
        // Getters
        public Long getModelId() { return modelId; }
        public Map<String, PerformanceStats> getStats() { return stats; }
        public long getGeneratedAt() { return generatedAt; }
    }
}