package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BusinessIntelligenceService {
    
    private final Map<String, List<BusinessDataPoint>> businessData = new HashMap<>();
    
    // 初始化业务智能服务
    public void init() {
        // 初始化默认数据集
        // 实际应用中，这里应该从数据库或其他数据源加载数据
        initSampleData();
    }
    
    // 初始化示例数据
    private void initSampleData() {
        // 生成示例用户数据
        List<BusinessDataPoint> userData = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            userData.add(new BusinessDataPoint(
                "user",
                "active_users",
                1000 + (int)(Math.random() * 500),
                System.currentTimeMillis() - (i * 24 * 60 * 60 * 1000)
            ));
        }
        businessData.put("user", userData);
        
        // 生成示例模型使用数据
        List<BusinessDataPoint> modelData = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            modelData.add(new BusinessDataPoint(
                "model",
                "usage_count",
                500 + (int)(Math.random() * 300),
                System.currentTimeMillis() - (i * 24 * 60 * 60 * 1000)
            ));
        }
        businessData.put("model", modelData);
        
        // 生成示例请求数据
        List<BusinessDataPoint> requestData = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            requestData.add(new BusinessDataPoint(
                "request",
                "total_requests",
                2000 + (int)(Math.random() * 1000),
                System.currentTimeMillis() - (i * 24 * 60 * 60 * 1000)
            ));
        }
        businessData.put("request", requestData);
    }
    
    // 收集业务数据
    public void collectBusinessData(String category, String metric, double value, long timestamp) {
        BusinessDataPoint dataPoint = new BusinessDataPoint(category, metric, value, timestamp);
        List<BusinessDataPoint> dataPoints = businessData.computeIfAbsent(category, k -> new ArrayList<>());
        dataPoints.add(dataPoint);
        
        // 限制数据点数量，只保留最近的1000个数据点
        if (dataPoints.size() > 1000) {
            dataPoints.subList(0, dataPoints.size() - 1000).clear();
        }
    }
    
    // 生成业务智能报表
    public BusinessIntelligenceReport generateReport(String reportType, long startTime, long endTime) {
        switch (reportType) {
            case "user_analytics":
                return generateUserAnalyticsReport(startTime, endTime);
            case "model_performance":
                return generateModelPerformanceReport(startTime, endTime);
            case "request_analytics":
                return generateRequestAnalyticsReport(startTime, endTime);
            case "system_health":
                return generateSystemHealthReport(startTime, endTime);
            default:
                return new BusinessIntelligenceReport("unknown", "Unknown report type", new HashMap<>(), System.currentTimeMillis());
        }
    }
    
    // 生成用户分析报表
    private BusinessIntelligenceReport generateUserAnalyticsReport(long startTime, long endTime) {
        List<BusinessDataPoint> userData = businessData.getOrDefault("user", Collections.emptyList());
        List<BusinessDataPoint> filteredData = filterDataByTimeRange(userData, startTime, endTime);
        
        Map<String, Object> metrics = new HashMap<>();
        
        // 计算活跃用户指标
        List<Double> activeUserValues = filteredData.stream()
            .filter(d -> "active_users".equals(d.getMetric()))
            .map(BusinessDataPoint::getValue)
            .collect(Collectors.toList());
        
        if (!activeUserValues.isEmpty()) {
            metrics.put("total_active_users", activeUserValues.stream().mapToDouble(Double::doubleValue).sum());
            metrics.put("average_active_users", activeUserValues.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
            metrics.put("max_active_users", activeUserValues.stream().mapToDouble(Double::doubleValue).max().orElse(0.0));
            metrics.put("min_active_users", activeUserValues.stream().mapToDouble(Double::doubleValue).min().orElse(0.0));
            metrics.put("active_users_trend", calculateTrend(activeUserValues));
        }
        
        return new BusinessIntelligenceReport(
            "user_analytics",
            "用户分析报表",
            metrics,
            System.currentTimeMillis()
        );
    }
    
    // 生成模型性能报表
    private BusinessIntelligenceReport generateModelPerformanceReport(long startTime, long endTime) {
        List<BusinessDataPoint> modelData = businessData.getOrDefault("model", Collections.emptyList());
        List<BusinessDataPoint> filteredData = filterDataByTimeRange(modelData, startTime, endTime);
        
        Map<String, Object> metrics = new HashMap<>();
        
        // 计算模型使用指标
        List<Double> usageValues = filteredData.stream()
            .filter(d -> "usage_count".equals(d.getMetric()))
            .map(BusinessDataPoint::getValue)
            .collect(Collectors.toList());
        
        if (!usageValues.isEmpty()) {
            metrics.put("total_usage", usageValues.stream().mapToDouble(Double::doubleValue).sum());
            metrics.put("average_usage", usageValues.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
            metrics.put("max_usage", usageValues.stream().mapToDouble(Double::doubleValue).max().orElse(0.0));
            metrics.put("min_usage", usageValues.stream().mapToDouble(Double::doubleValue).min().orElse(0.0));
            metrics.put("usage_trend", calculateTrend(usageValues));
        }
        
        return new BusinessIntelligenceReport(
            "model_performance",
            "模型性能报表",
            metrics,
            System.currentTimeMillis()
        );
    }
    
    // 生成请求分析报表
    private BusinessIntelligenceReport generateRequestAnalyticsReport(long startTime, long endTime) {
        List<BusinessDataPoint> requestData = businessData.getOrDefault("request", Collections.emptyList());
        List<BusinessDataPoint> filteredData = filterDataByTimeRange(requestData, startTime, endTime);
        
        Map<String, Object> metrics = new HashMap<>();
        
        // 计算请求指标
        List<Double> requestValues = filteredData.stream()
            .filter(d -> "total_requests".equals(d.getMetric()))
            .map(BusinessDataPoint::getValue)
            .collect(Collectors.toList());
        
        if (!requestValues.isEmpty()) {
            metrics.put("total_requests", requestValues.stream().mapToDouble(Double::doubleValue).sum());
            metrics.put("average_requests", requestValues.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
            metrics.put("max_requests", requestValues.stream().mapToDouble(Double::doubleValue).max().orElse(0.0));
            metrics.put("min_requests", requestValues.stream().mapToDouble(Double::doubleValue).min().orElse(0.0));
            metrics.put("request_trend", calculateTrend(requestValues));
        }
        
        return new BusinessIntelligenceReport(
            "request_analytics",
            "请求分析报表",
            metrics,
            System.currentTimeMillis()
        );
    }
    
    // 生成系统健康报表
    private BusinessIntelligenceReport generateSystemHealthReport(long startTime, long endTime) {
        Map<String, Object> metrics = new HashMap<>();
        
        // 计算系统健康指标
        metrics.put("system_uptime", 99.9); // 模拟系统 uptime
        metrics.put("error_rate", 0.5); // 模拟错误率
        metrics.put("average_response_time", 120); // 模拟平均响应时间（毫秒）
        metrics.put("resource_usage", 75); // 模拟资源使用率（%）
        
        return new BusinessIntelligenceReport(
            "system_health",
            "系统健康报表",
            metrics,
            System.currentTimeMillis()
        );
    }
    
    // 按时间范围过滤数据
    private List<BusinessDataPoint> filterDataByTimeRange(List<BusinessDataPoint> data, long startTime, long endTime) {
        return data.stream()
            .filter(d -> d.getTimestamp() >= startTime && d.getTimestamp() <= endTime)
            .collect(Collectors.toList());
    }
    
    // 计算趋势
    private String calculateTrend(List<Double> values) {
        if (values.size() < 2) {
            return "stable";
        }
        
        double firstValue = values.get(0);
        double lastValue = values.get(values.size() - 1);
        double change = (lastValue - firstValue) / firstValue * 100;
        
        if (change > 5) {
            return "increasing";
        } else if (change < -5) {
            return "decreasing";
        } else {
            return "stable";
        }
    }
    
    // 生成数据可视化数据
    public Map<String, Object> generateVisualizationData(String chartType, String category, String metric, long startTime, long endTime) {
        List<BusinessDataPoint> data = businessData.getOrDefault(category, Collections.emptyList());
        List<BusinessDataPoint> filteredData = filterDataByTimeRange(data, startTime, endTime);
        
        Map<String, Object> visualizationData = new HashMap<>();
        List<Double> values = new ArrayList<>();
        List<Long> timestamps = new ArrayList<>();
        
        for (BusinessDataPoint dataPoint : filteredData) {
            if (metric.equals(dataPoint.getMetric())) {
                values.add(dataPoint.getValue());
                timestamps.add(dataPoint.getTimestamp());
            }
        }
        
        visualizationData.put("values", values);
        visualizationData.put("timestamps", timestamps);
        visualizationData.put("chartType", chartType);
        visualizationData.put("title", metric + " over time");
        
        return visualizationData;
    }
    
    // 检测异常
    public List<Anomaly> detectAnomalies(String category, String metric, long startTime, long endTime) {
        List<BusinessDataPoint> data = businessData.getOrDefault(category, Collections.emptyList());
        List<BusinessDataPoint> filteredData = filterDataByTimeRange(data, startTime, endTime);
        
        List<Anomaly> anomalies = new ArrayList<>();
        
        // 计算平均值和标准差
        List<Double> values = filteredData.stream()
            .filter(d -> metric.equals(d.getMetric()))
            .map(BusinessDataPoint::getValue)
            .collect(Collectors.toList());
        
        if (values.size() < 5) {
            return anomalies; // 数据点不足，无法检测异常
        }
        
        double mean = values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = values.stream().mapToDouble(v -> Math.pow(v - mean, 2)).average().orElse(0.0);
        double stdDev = Math.sqrt(variance);
        
        // 检测异常（超过2个标准差）
        for (BusinessDataPoint dataPoint : filteredData) {
            if (metric.equals(dataPoint.getMetric())) {
                double value = dataPoint.getValue();
                if (Math.abs(value - mean) > 2 * stdDev) {
                    anomalies.add(new Anomaly(
                        category,
                        metric,
                        value,
                        dataPoint.getTimestamp(),
                        "Value is " + Math.abs(value - mean) / stdDev + " standard deviations from the mean"
                    ));
                }
            }
        }
        
        return anomalies;
    }
    
    // 业务数据点类
    public static class BusinessDataPoint {
        private String category;
        private String metric;
        private double value;
        private long timestamp;
        
        public BusinessDataPoint(String category, String metric, double value, long timestamp) {
            this.category = category;
            this.metric = metric;
            this.value = value;
            this.timestamp = timestamp;
        }
        
        // Getters
        public String getCategory() { return category; }
        public String getMetric() { return metric; }
        public double getValue() { return value; }
        public long getTimestamp() { return timestamp; }
    }
    
    // 业务智能报表类
    public static class BusinessIntelligenceReport {
        private String reportType;
        private String reportName;
        private Map<String, Object> metrics;
        private long generatedAt;
        
        public BusinessIntelligenceReport(String reportType, String reportName, Map<String, Object> metrics, long generatedAt) {
            this.reportType = reportType;
            this.reportName = reportName;
            this.metrics = metrics;
            this.generatedAt = generatedAt;
        }
        
        // Getters
        public String getReportType() { return reportType; }
        public String getReportName() { return reportName; }
        public Map<String, Object> getMetrics() { return metrics; }
        public long getGeneratedAt() { return generatedAt; }
    }
    
    // 异常类
    public static class Anomaly {
        private String category;
        private String metric;
        private double value;
        private long timestamp;
        private String description;
        
        public Anomaly(String category, String metric, double value, long timestamp, String description) {
            this.category = category;
            this.metric = metric;
            this.value = value;
            this.timestamp = timestamp;
            this.description = description;
        }
        
        // Getters
        public String getCategory() { return category; }
        public String getMetric() { return metric; }
        public double getValue() { return value; }
        public long getTimestamp() { return timestamp; }
        public String getDescription() { return description; }
    }
}