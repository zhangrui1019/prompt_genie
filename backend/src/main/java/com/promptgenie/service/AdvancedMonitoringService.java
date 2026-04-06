package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdvancedMonitoringService {
    
    private final Map<String, List<MonitoringData>> monitoringData = new ConcurrentHashMap<>();
    private final Map<String, Alert> alerts = new ConcurrentHashMap<>();
    private final Map<String, AlertRule> alertRules = new ConcurrentHashMap<>();
    
    // 初始化高级监控服务
    public void init() {
        // 初始化默认告警规则
        initDefaultAlertRules();
    }
    
    // 初始化默认告警规则
    private void initDefaultAlertRules() {
        // 创建CPU使用率告警规则
        AlertRule cpuRule = new AlertRule(
            "cpu-usage",
            "CPU Usage",
            "cpu",
            "usage",
            ">",
            80.0,
            "CPU usage exceeds 80%",
            "high",
            System.currentTimeMillis()
        );
        alertRules.put(cpuRule.getId(), cpuRule);
        
        // 创建内存使用率告警规则
        AlertRule memoryRule = new AlertRule(
            "memory-usage",
            "Memory Usage",
            "memory",
            "usage",
            ">",
            90.0,
            "Memory usage exceeds 90%",
            "high",
            System.currentTimeMillis()
        );
        alertRules.put(memoryRule.getId(), memoryRule);
        
        // 创建响应时间告警规则
        AlertRule responseTimeRule = new AlertRule(
            "response-time",
            "Response Time",
            "api",
            "response_time",
            ">",
            500.0,
            "API response time exceeds 500ms",
            "medium",
            System.currentTimeMillis()
        );
        alertRules.put(responseTimeRule.getId(), responseTimeRule);
        
        // 创建错误率告警规则
        AlertRule errorRateRule = new AlertRule(
            "error-rate",
            "Error Rate",
            "api",
            "error_rate",
            ">",
            5.0,
            "API error rate exceeds 5%",
            "medium",
            System.currentTimeMillis()
        );
        alertRules.put(errorRateRule.getId(), errorRateRule);
    }
    
    // 收集监控数据
    public void collectMonitoringData(String category, String metric, double value, long timestamp) {
        MonitoringData data = new MonitoringData(
            category,
            metric,
            value,
            timestamp
        );
        
        List<MonitoringData> dataList = monitoringData.computeIfAbsent(category, k -> new ArrayList<>());
        dataList.add(data);
        
        // 限制数据数量，只保留最近的1000条
        if (dataList.size() > 1000) {
            dataList.subList(0, dataList.size() - 1000).clear();
        }
        
        // 检查告警规则
        checkAlertRules(category, metric, value, timestamp);
    }
    
    // 检查告警规则
    private void checkAlertRules(String category, String metric, double value, long timestamp) {
        for (AlertRule rule : alertRules.values()) {
            if (rule.getCategory().equals(category) && rule.getMetric().equals(metric)) {
                boolean triggered = false;
                switch (rule.getOperator()) {
                    case ">":
                        triggered = value > rule.getThreshold();
                        break;
                    case "<":
                        triggered = value < rule.getThreshold();
                        break;
                    case "=":
                        triggered = value == rule.getThreshold();
                        break;
                }
                
                if (triggered) {
                    String alertId = rule.getId() + "_" + timestamp;
                    Alert alert = new Alert(
                        alertId,
                        rule.getId(),
                        rule.getName(),
                        rule.getDescription(),
                        category,
                        metric,
                        value,
                        rule.getThreshold(),
                        rule.getSeverity(),
                        timestamp,
                        "active"
                    );
                    alerts.put(alertId, alert);
                }
            }
        }
    }
    
    // 获取监控数据
    public List<MonitoringData> getMonitoringData(String category, String metric, long startTime, long endTime) {
        List<MonitoringData> dataList = monitoringData.getOrDefault(category, Collections.emptyList());
        return dataList.stream()
            .filter(data -> data.getMetric().equals(metric))
            .filter(data -> data.getTimestamp() >= startTime && data.getTimestamp() <= endTime)
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 获取告警
    public List<Alert> getAlerts(String status) {
        return alerts.values().stream()
            .filter(alert -> status == null || alert.getStatus().equals(status))
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 解决告警
    public void resolveAlert(String alertId) {
        Alert alert = alerts.get(alertId);
        if (alert != null) {
            alert.setStatus("resolved");
            alert.setResolvedAt(System.currentTimeMillis());
        }
    }
    
    // 创建告警规则
    public AlertRule createAlertRule(String id, String name, String category, String metric, String operator, double threshold, String description, String severity) {
        AlertRule rule = new AlertRule(
            id,
            name,
            category,
            metric,
            operator,
            threshold,
            description,
            severity,
            System.currentTimeMillis()
        );
        alertRules.put(id, rule);
        return rule;
    }
    
    // 更新告警规则
    public AlertRule updateAlertRule(String id, String name, String category, String metric, String operator, Double threshold, String description, String severity) {
        AlertRule rule = alertRules.get(id);
        if (rule != null) {
            if (name != null) rule.setName(name);
            if (category != null) rule.setCategory(category);
            if (metric != null) rule.setMetric(metric);
            if (operator != null) rule.setOperator(operator);
            if (threshold != null) rule.setThreshold(threshold);
            if (description != null) rule.setDescription(description);
            if (severity != null) rule.setSeverity(severity);
            rule.setLastUpdatedAt(System.currentTimeMillis());
        }
        return rule;
    }
    
    // 删除告警规则
    public void deleteAlertRule(String id) {
        alertRules.remove(id);
    }
    
    // 获取告警规则
    public List<AlertRule> getAlertRules() {
        return new ArrayList<>(alertRules.values());
    }
    
    // 生成监控报告
    public MonitoringReport generateMonitoringReport(long startTime, long endTime) {
        Map<String, Map<String, List<MonitoringData>>> reportData = new HashMap<>();
        
        // 按类别和指标组织数据
        for (Map.Entry<String, List<MonitoringData>> entry : monitoringData.entrySet()) {
            String category = entry.getKey();
            List<MonitoringData> dataList = entry.getValue();
            
            Map<String, List<MonitoringData>> metricData = reportData.computeIfAbsent(category, k -> new HashMap<>());
            for (MonitoringData data : dataList) {
                if (data.getTimestamp() >= startTime && data.getTimestamp() <= endTime) {
                    List<MonitoringData> metricList = metricData.computeIfAbsent(data.getMetric(), k -> new ArrayList<>());
                    metricList.add(data);
                }
            }
        }
        
        // 计算统计数据
        Map<String, Map<String, MonitoringStats>> stats = new HashMap<>();
        for (Map.Entry<String, Map<String, List<MonitoringData>>> categoryEntry : reportData.entrySet()) {
            String category = categoryEntry.getKey();
            Map<String, List<MonitoringData>> metricData = categoryEntry.getValue();
            
            Map<String, MonitoringStats> categoryStats = stats.computeIfAbsent(category, k -> new HashMap<>());
            for (Map.Entry<String, List<MonitoringData>> metricEntry : metricData.entrySet()) {
                String metric = metricEntry.getKey();
                List<MonitoringData> dataList = metricEntry.getValue();
                
                if (!dataList.isEmpty()) {
                    double min = dataList.stream().mapToDouble(MonitoringData::getValue).min().orElse(0);
                    double max = dataList.stream().mapToDouble(MonitoringData::getValue).max().orElse(0);
                    double average = dataList.stream().mapToDouble(MonitoringData::getValue).average().orElse(0);
                    
                    categoryStats.put(metric, new MonitoringStats(min, max, average, dataList.size()));
                }
            }
        }
        
        // 获取报告期间的告警
        List<Alert> reportAlerts = alerts.values().stream()
            .filter(alert -> alert.getTimestamp() >= startTime && alert.getTimestamp() <= endTime)
            .collect(java.util.stream.Collectors.toList());
        
        return new MonitoringReport(
            startTime,
            endTime,
            stats,
            reportAlerts
        );
    }
    
    // 监控数据类
    public static class MonitoringData {
        private String category;
        private String metric;
        private double value;
        private long timestamp;
        
        public MonitoringData(String category, String metric, double value, long timestamp) {
            this.category = category;
            this.metric = metric;
            this.value = value;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getMetric() { return metric; }
        public void setMetric(String metric) { this.metric = metric; }
        public double getValue() { return value; }
        public void setValue(double value) { this.value = value; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    // 告警类
    public static class Alert {
        private String id;
        private String ruleId;
        private String name;
        private String description;
        private String category;
        private String metric;
        private double value;
        private double threshold;
        private String severity; // low, medium, high, critical
        private long timestamp;
        private long resolvedAt;
        private String status; // active, resolved
        
        public Alert(String id, String ruleId, String name, String description, String category, String metric, double value, double threshold, String severity, long timestamp, String status) {
            this.id = id;
            this.ruleId = ruleId;
            this.name = name;
            this.description = description;
            this.category = category;
            this.metric = metric;
            this.value = value;
            this.threshold = threshold;
            this.severity = severity;
            this.timestamp = timestamp;
            this.status = status;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getRuleId() { return ruleId; }
        public void setRuleId(String ruleId) { this.ruleId = ruleId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getMetric() { return metric; }
        public void setMetric(String metric) { this.metric = metric; }
        public double getValue() { return value; }
        public void setValue(double value) { this.value = value; }
        public double getThreshold() { return threshold; }
        public void setThreshold(double threshold) { this.threshold = threshold; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
        public long getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(long resolvedAt) { this.resolvedAt = resolvedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // 告警规则类
    public static class AlertRule {
        private String id;
        private String name;
        private String category;
        private String metric;
        private String operator; // >, <, =
        private double threshold;
        private String description;
        private String severity; // low, medium, high, critical
        private long createdAt;
        private long lastUpdatedAt;
        
        public AlertRule(String id, String name, String category, String metric, String operator, double threshold, String description, String severity, long createdAt) {
            this.id = id;
            this.name = name;
            this.category = category;
            this.metric = metric;
            this.operator = operator;
            this.threshold = threshold;
            this.description = description;
            this.severity = severity;
            this.createdAt = createdAt;
            this.lastUpdatedAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getMetric() { return metric; }
        public void setMetric(String metric) { this.metric = metric; }
        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }
        public double getThreshold() { return threshold; }
        public void setThreshold(double threshold) { this.threshold = threshold; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getLastUpdatedAt() { return lastUpdatedAt; }
        public void setLastUpdatedAt(long lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
    }
    
    // 监控统计类
    public static class MonitoringStats {
        private double min;
        private double max;
        private double average;
        private int count;
        
        public MonitoringStats(double min, double max, double average, int count) {
            this.min = min;
            this.max = max;
            this.average = average;
            this.count = count;
        }
        
        // Getters and setters
        public double getMin() { return min; }
        public void setMin(double min) { this.min = min; }
        public double getMax() { return max; }
        public void setMax(double max) { this.max = max; }
        public double getAverage() { return average; }
        public void setAverage(double average) { this.average = average; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }
    
    // 监控报告类
    public static class MonitoringReport {
        private long startTime;
        private long endTime;
        private Map<String, Map<String, MonitoringStats>> stats;
        private List<Alert> alerts;
        
        public MonitoringReport(long startTime, long endTime, Map<String, Map<String, MonitoringStats>> stats, List<Alert> alerts) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.stats = stats;
            this.alerts = alerts;
        }
        
        // Getters and setters
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public long getEndTime() { return endTime; }
        public void setEndTime(long endTime) { this.endTime = endTime; }
        public Map<String, Map<String, MonitoringStats>> getStats() { return stats; }
        public void setStats(Map<String, Map<String, MonitoringStats>> stats) { this.stats = stats; }
        public List<Alert> getAlerts() { return alerts; }
        public void setAlerts(List<Alert> alerts) { this.alerts = alerts; }
    }
}