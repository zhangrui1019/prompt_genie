package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AnomalyDetectionService {
    
    private final Map<String, AnomalyDetector> detectors = new ConcurrentHashMap<>();
    private final Map<String, AnomalyEvent> anomalyEvents = new ConcurrentHashMap<>();
    private final Map<String, RootCauseAnalysis> rootCauseAnalyses = new ConcurrentHashMap<>();
    private final Map<String, Alert> alerts = new ConcurrentHashMap<>();
    
    // 初始化异常检测服务
    public void init() {
        // 初始化默认检测器
        initDefaultDetectors();
    }
    
    // 初始化默认检测器
    private void initDefaultDetectors() {
        // 响应时间检测器
        createDetector(
            "response_time",
            "响应时间异常检测器",
            "RESPONSE_TIME",
            Map.of(
                "threshold", 2000.0, // 2秒
                "window_size", 10,
                "sensitivity", 0.8
            ),
            System.currentTimeMillis()
        );
        
        // 错误率检测器
        createDetector(
            "error_rate",
            "错误率异常检测器",
            "ERROR_RATE",
            Map.of(
                "threshold", 0.1, // 10%
                "window_size", 100,
                "sensitivity", 0.7
            ),
            System.currentTimeMillis()
        );
        
        // 令牌消耗检测器
        createDetector(
            "token_usage",
            "令牌消耗异常检测器",
            "TOKEN_USAGE",
            Map.of(
                "threshold", 1000.0, // 1000 tokens
                "window_size", 10,
                "sensitivity", 0.9
            ),
            System.currentTimeMillis()
        );
    }
    
    // 创建检测器
    public AnomalyDetector createDetector(String detectorId, String name, String type, Map<String, Object> config, long createdAt) {
        AnomalyDetector detector = new AnomalyDetector(
            detectorId,
            name,
            type,
            config,
            true,
            createdAt
        );
        detectors.put(detectorId, detector);
        return detector;
    }
    
    // 检测异常
    public List<AnomalyEvent> detectAnomalies(String detectorId, List<MetricData> metricData) {
        AnomalyDetector detector = detectors.get(detectorId);
        if (detector == null || !detector.isEnabled()) {
            return Collections.emptyList();
        }
        
        List<AnomalyEvent> detectedAnomalies = new ArrayList<>();
        
        // 根据检测器类型执行不同的检测逻辑
        switch (detector.getType()) {
            case "RESPONSE_TIME":
                detectedAnomalies = detectResponseTimeAnomalies(detector, metricData);
                break;
            case "ERROR_RATE":
                detectedAnomalies = detectErrorRateAnomalies(detector, metricData);
                break;
            case "TOKEN_USAGE":
                detectedAnomalies = detectTokenUsageAnomalies(detector, metricData);
                break;
            default:
                break;
        }
        
        // 记录检测到的异常
        for (AnomalyEvent anomaly : detectedAnomalies) {
            anomalyEvents.put(anomaly.getEventId(), anomaly);
            
            // 生成告警
            generateAlert(anomaly);
            
            // 执行根因分析
            performRootCauseAnalysis(anomaly);
        }
        
        return detectedAnomalies;
    }
    
    // 检测响应时间异常
    private List<AnomalyEvent> detectResponseTimeAnomalies(AnomalyDetector detector, List<MetricData> metricData) {
        List<AnomalyEvent> anomalies = new ArrayList<>();
        double threshold = (double) detector.getConfig().getOrDefault("threshold", 2000.0);
        int windowSize = (int) detector.getConfig().getOrDefault("window_size", 10);
        
        // 滑动窗口检测
        for (int i = windowSize - 1; i < metricData.size(); i++) {
            List<MetricData> window = metricData.subList(i - windowSize + 1, i + 1);
            double average = window.stream().mapToDouble(MetricData::getValue).average().orElse(0);
            
            if (average > threshold) {
                AnomalyEvent anomaly = new AnomalyEvent(
                    "anomaly_" + System.currentTimeMillis(),
                    detector.getDetectorId(),
                    "RESPONSE_TIME",
                    "响应时间异常",
                    Map.of(
                        "average_response_time", average,
                        "threshold", threshold,
                        "window_size", windowSize
                    ),
                    System.currentTimeMillis(),
                    "DETECTED"
                );
                anomalies.add(anomaly);
            }
        }
        
        return anomalies;
    }
    
    // 检测错误率异常
    private List<AnomalyEvent> detectErrorRateAnomalies(AnomalyDetector detector, List<MetricData> metricData) {
        List<AnomalyEvent> anomalies = new ArrayList<>();
        double threshold = (double) detector.getConfig().getOrDefault("threshold", 0.1);
        int windowSize = (int) detector.getConfig().getOrDefault("window_size", 100);
        
        // 计算错误率
        int errorCount = 0;
        for (int i = 0; i < metricData.size(); i++) {
            if ((boolean) metricData.get(i).getTags().getOrDefault("error", false)) {
                errorCount++;
            }
            
            if (i >= windowSize - 1) {
                double errorRate = (double) errorCount / windowSize;
                
                if (errorRate > threshold) {
                    AnomalyEvent anomaly = new AnomalyEvent(
                        "anomaly_" + System.currentTimeMillis(),
                        detector.getDetectorId(),
                        "ERROR_RATE",
                        "错误率异常",
                        Map.of(
                            "error_rate", errorRate,
                            "threshold", threshold,
                            "window_size", windowSize,
                            "error_count", errorCount
                        ),
                        System.currentTimeMillis(),
                        "DETECTED"
                    );
                    anomalies.add(anomaly);
                }
                
                // 滑动窗口
                if ((boolean) metricData.get(i - windowSize + 1).getTags().getOrDefault("error", false)) {
                    errorCount--;
                }
            }
        }
        
        return anomalies;
    }
    
    // 检测令牌消耗异常
    private List<AnomalyEvent> detectTokenUsageAnomalies(AnomalyDetector detector, List<MetricData> metricData) {
        List<AnomalyEvent> anomalies = new ArrayList<>();
        double threshold = (double) detector.getConfig().getOrDefault("threshold", 1000.0);
        int windowSize = (int) detector.getConfig().getOrDefault("window_size", 10);
        
        // 滑动窗口检测
        for (int i = windowSize - 1; i < metricData.size(); i++) {
            List<MetricData> window = metricData.subList(i - windowSize + 1, i + 1);
            double average = window.stream().mapToDouble(MetricData::getValue).average().orElse(0);
            
            if (average > threshold) {
                AnomalyEvent anomaly = new AnomalyEvent(
                    "anomaly_" + System.currentTimeMillis(),
                    detector.getDetectorId(),
                    "TOKEN_USAGE",
                    "令牌消耗异常",
                    Map.of(
                        "average_token_usage", average,
                        "threshold", threshold,
                        "window_size", windowSize
                    ),
                    System.currentTimeMillis(),
                    "DETECTED"
                );
                anomalies.add(anomaly);
            }
        }
        
        return anomalies;
    }
    
    // 执行根因分析
    private void performRootCauseAnalysis(AnomalyEvent anomaly) {
        String analysisId = "analysis_" + System.currentTimeMillis();
        
        // 模拟根因分析过程
        List<String> possibleCauses = new ArrayList<>();
        Map<String, Double> causeProbabilities = new HashMap<>();
        
        switch (anomaly.getType()) {
            case "RESPONSE_TIME":
                possibleCauses.add("模型服务响应缓慢");
                possibleCauses.add("网络延迟增加");
                possibleCauses.add("系统负载过高");
                causeProbabilities.put("模型服务响应缓慢", 0.7);
                causeProbabilities.put("网络延迟增加", 0.2);
                causeProbabilities.put("系统负载过高", 0.1);
                break;
            case "ERROR_RATE":
                possibleCauses.add("模型API错误");
                possibleCauses.add("输入数据格式错误");
                possibleCauses.add("系统配置问题");
                causeProbabilities.put("模型API错误", 0.6);
                causeProbabilities.put("输入数据格式错误", 0.3);
                causeProbabilities.put("系统配置问题", 0.1);
                break;
            case "TOKEN_USAGE":
                possibleCauses.add("提示词过长");
                possibleCauses.add("模型参数配置不当");
                possibleCauses.add("异常输入数据");
                causeProbabilities.put("提示词过长", 0.5);
                causeProbabilities.put("模型参数配置不当", 0.3);
                causeProbabilities.put("异常输入数据", 0.2);
                break;
            default:
                break;
        }
        
        RootCauseAnalysis analysis = new RootCauseAnalysis(
            analysisId,
            anomaly.getEventId(),
            possibleCauses,
            causeProbabilities,
            "COMPLETED",
            System.currentTimeMillis()
        );
        
        rootCauseAnalyses.put(analysisId, analysis);
        
        // 更新异常事件的根因分析ID
        anomaly.setRootCauseAnalysisId(analysisId);
    }
    
    // 生成告警
    private void generateAlert(AnomalyEvent anomaly) {
        String alertId = "alert_" + System.currentTimeMillis();
        
        // 确定告警级别
        String severity = "INFO";
        switch (anomaly.getType()) {
            case "RESPONSE_TIME":
                double responseTime = (double) anomaly.getAttributes().getOrDefault("average_response_time", 0.0);
                if (responseTime > 5000) {
                    severity = "CRITICAL";
                } else if (responseTime > 3000) {
                    severity = "WARNING";
                } else {
                    severity = "INFO";
                }
                break;
            case "ERROR_RATE":
                double errorRate = (double) anomaly.getAttributes().getOrDefault("error_rate", 0.0);
                if (errorRate > 0.3) {
                    severity = "CRITICAL";
                } else if (errorRate > 0.15) {
                    severity = "WARNING";
                } else {
                    severity = "INFO";
                }
                break;
            case "TOKEN_USAGE":
                double tokenUsage = (double) anomaly.getAttributes().getOrDefault("average_token_usage", 0.0);
                if (tokenUsage > 3000) {
                    severity = "CRITICAL";
                } else if (tokenUsage > 1500) {
                    severity = "WARNING";
                } else {
                    severity = "INFO";
                }
                break;
            default:
                break;
        }
        
        Alert alert = new Alert(
            alertId,
            anomaly.getEventId(),
            anomaly.getDescription(),
            severity,
            "OPEN",
            System.currentTimeMillis(),
            null
        );
        
        alerts.put(alertId, alert);
    }
    
    // 预测故障
    public List<FailurePrediction> predictFailures(long timeWindow) {
        List<FailurePrediction> predictions = new ArrayList<>();
        
        // 分析历史异常数据
        List<AnomalyEvent> recentAnomalies = anomalyEvents.values().stream()
            .filter(event -> System.currentTimeMillis() - event.getCreatedAt() < timeWindow)
            .collect(Collectors.toList());
        
        // 按类型分组
        Map<String, List<AnomalyEvent>> anomaliesByType = recentAnomalies.stream()
            .collect(Collectors.groupingBy(AnomalyEvent::getType));
        
        // 对每种类型进行预测
        for (Map.Entry<String, List<AnomalyEvent>> entry : anomaliesByType.entrySet()) {
            String type = entry.getKey();
            List<AnomalyEvent> events = entry.getValue();
            
            if (events.size() >= 3) { // 至少3个异常事件才进行预测
                double failureProbability = calculateFailureProbability(events);
                
                if (failureProbability > 0.5) {
                    FailurePrediction prediction = new FailurePrediction(
                        "prediction_" + System.currentTimeMillis(),
                        type,
                        "可能发生" + getFailureDescription(type),
                        failureProbability,
                        System.currentTimeMillis() + timeWindow,
                        "HIGH"
                    );
                    predictions.add(prediction);
                }
            }
        }
        
        return predictions;
    }
    
    // 计算故障概率
    private double calculateFailureProbability(List<AnomalyEvent> events) {
        // 简单的概率计算：基于异常频率和严重程度
        int eventCount = events.size();
        double severityScore = events.stream()
            .mapToDouble(event -> {
                switch (event.getType()) {
                    case "RESPONSE_TIME":
                        return (double) event.getAttributes().getOrDefault("average_response_time", 0.0) / 10000;
                    case "ERROR_RATE":
                        return (double) event.getAttributes().getOrDefault("error_rate", 0.0) * 5;
                    case "TOKEN_USAGE":
                        return (double) event.getAttributes().getOrDefault("average_token_usage", 0.0) / 5000;
                    default:
                        return 0.0;
                }
            })
            .average()
            .orElse(0.0);
        
        return Math.min(1.0, (eventCount / 10.0) + severityScore);
    }
    
    // 获取故障描述
    private String getFailureDescription(String type) {
        switch (type) {
            case "RESPONSE_TIME":
                return "服务响应超时";
            case "ERROR_RATE":
                return "系统错误率过高";
            case "TOKEN_USAGE":
                return "令牌消耗异常";
            default:
                return "系统故障";
        }
    }
    
    // 获取检测器
    public AnomalyDetector getDetector(String detectorId) {
        return detectors.get(detectorId);
    }
    
    // 获取异常事件
    public AnomalyEvent getAnomalyEvent(String eventId) {
        return anomalyEvents.get(eventId);
    }
    
    // 获取根因分析
    public RootCauseAnalysis getRootCauseAnalysis(String analysisId) {
        return rootCauseAnalyses.get(analysisId);
    }
    
    // 获取告警
    public Alert getAlert(String alertId) {
        return alerts.get(alertId);
    }
    
    // 检测器类
    public static class AnomalyDetector {
        private String detectorId;
        private String name;
        private String type;
        private Map<String, Object> config;
        private boolean enabled;
        private long createdAt;
        
        public AnomalyDetector(String detectorId, String name, String type, Map<String, Object> config, boolean enabled, long createdAt) {
            this.detectorId = detectorId;
            this.name = name;
            this.type = type;
            this.config = config;
            this.enabled = enabled;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getDetectorId() { return detectorId; }
        public void setDetectorId(String detectorId) { this.detectorId = detectorId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Map<String, Object> getConfig() { return config; }
        public void setConfig(Map<String, Object> config) { this.config = config; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 异常事件类
    public static class AnomalyEvent {
        private String eventId;
        private String detectorId;
        private String type;
        private String description;
        private Map<String, Object> attributes;
        private long createdAt;
        private String status;
        private String rootCauseAnalysisId;
        
        public AnomalyEvent(String eventId, String detectorId, String type, String description, Map<String, Object> attributes, long createdAt, String status) {
            this.eventId = eventId;
            this.detectorId = detectorId;
            this.type = type;
            this.description = description;
            this.attributes = attributes;
            this.createdAt = createdAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public String getDetectorId() { return detectorId; }
        public void setDetectorId(String detectorId) { this.detectorId = detectorId; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Map<String, Object> getAttributes() { return attributes; }
        public void setAttributes(Map<String, Object> attributes) { this.attributes = attributes; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRootCauseAnalysisId() { return rootCauseAnalysisId; }
        public void setRootCauseAnalysisId(String rootCauseAnalysisId) { this.rootCauseAnalysisId = rootCauseAnalysisId; }
    }
    
    // 根因分析类
    public static class RootCauseAnalysis {
        private String analysisId;
        private String eventId;
        private List<String> possibleCauses;
        private Map<String, Double> causeProbabilities;
        private String status;
        private long createdAt;
        
        public RootCauseAnalysis(String analysisId, String eventId, List<String> possibleCauses, Map<String, Double> causeProbabilities, String status, long createdAt) {
            this.analysisId = analysisId;
            this.eventId = eventId;
            this.possibleCauses = possibleCauses;
            this.causeProbabilities = causeProbabilities;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getAnalysisId() { return analysisId; }
        public void setAnalysisId(String analysisId) { this.analysisId = analysisId; }
        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public List<String> getPossibleCauses() { return possibleCauses; }
        public void setPossibleCauses(List<String> possibleCauses) { this.possibleCauses = possibleCauses; }
        public Map<String, Double> getCauseProbabilities() { return causeProbabilities; }
        public void setCauseProbabilities(Map<String, Double> causeProbabilities) { this.causeProbabilities = causeProbabilities; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 告警类
    public static class Alert {
        private String alertId;
        private String eventId;
        private String description;
        private String severity;
        private String status;
        private long createdAt;
        private Long resolvedAt;
        
        public Alert(String alertId, String eventId, String description, String severity, String status, long createdAt, Long resolvedAt) {
            this.alertId = alertId;
            this.eventId = eventId;
            this.description = description;
            this.severity = severity;
            this.status = status;
            this.createdAt = createdAt;
            this.resolvedAt = resolvedAt;
        }
        
        // Getters and setters
        public String getAlertId() { return alertId; }
        public void setAlertId(String alertId) { this.alertId = alertId; }
        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public Long getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(Long resolvedAt) { this.resolvedAt = resolvedAt; }
    }
    
    // 故障预测类
    public static class FailurePrediction {
        private String predictionId;
        private String type;
        private String description;
        private double probability;
        private long predictedTime;
        private String riskLevel;
        
        public FailurePrediction(String predictionId, String type, String description, double probability, long predictedTime, String riskLevel) {
            this.predictionId = predictionId;
            this.type = type;
            this.description = description;
            this.probability = probability;
            this.predictedTime = predictedTime;
            this.riskLevel = riskLevel;
        }
        
        // Getters and setters
        public String getPredictionId() { return predictionId; }
        public void setPredictionId(String predictionId) { this.predictionId = predictionId; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public double getProbability() { return probability; }
        public void setProbability(double probability) { this.probability = probability; }
        public long getPredictedTime() { return predictedTime; }
        public void setPredictedTime(long predictedTime) { this.predictedTime = predictedTime; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    }
    
    // 指标数据类
    public static class MetricData {
        private double value;
        private Map<String, Object> tags;
        private long timestamp;
        
        public MetricData(double value, Map<String, Object> tags, long timestamp) {
            this.value = value;
            this.tags = tags;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public double getValue() { return value; }
        public void setValue(double value) { this.value = value; }
        public Map<String, Object> getTags() { return tags; }
        public void setTags(Map<String, Object> tags) { this.tags = tags; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}