package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LLMTracingService {
    
    private final Map<String, TraceSpan> traceSpans = new ConcurrentHashMap<>();
    private final Map<String, TraceContext> traceContexts = new ConcurrentHashMap<>();
    private final Map<String, TraceMetrics> traceMetrics = new ConcurrentHashMap<>();
    
    // 开始追踪
    public TraceContext startTrace(String traceId, String operationName, Map<String, Object> tags) {
        TraceContext context = new TraceContext(
            traceId,
            operationName,
            tags,
            System.currentTimeMillis(),
            null
        );
        traceContexts.put(traceId, context);
        return context;
    }
    
    // 创建Span
    public TraceSpan createSpan(String spanId, String traceId, String parentSpanId, String operationName, Map<String, Object> tags) {
        TraceSpan span = new TraceSpan(
            spanId,
            traceId,
            parentSpanId,
            operationName,
            tags,
            System.currentTimeMillis(),
            null,
            new ArrayList<>()
        );
        traceSpans.put(spanId, span);
        return span;
    }
    
    // 结束Span
    public void endSpan(String spanId) {
        TraceSpan span = traceSpans.get(spanId);
        if (span != null) {
            span.setEndTime(System.currentTimeMillis());
            
            // 计算耗时
            long duration = span.getEndTime() - span.getStartTime();
            span.getTags().put("duration_ms", duration);
            
            // 更新指标
            updateTraceMetrics(span.getTraceId(), span);
        }
    }
    
    // 记录事件
    public void addEvent(String spanId, String eventName, Map<String, Object> attributes) {
        TraceSpan span = traceSpans.get(spanId);
        if (span != null) {
            TraceEvent event = new TraceEvent(
                eventName,
                attributes,
                System.currentTimeMillis()
            );
            span.getEvents().add(event);
        }
    }
    
    // 记录错误
    public void recordError(String spanId, String errorMessage, Exception e) {
        TraceSpan span = traceSpans.get(spanId);
        if (span != null) {
            Map<String, Object> errorAttributes = new HashMap<>();
            errorAttributes.put("error.message", errorMessage);
            errorAttributes.put("error.type", e != null ? e.getClass().getName() : "Unknown");
            errorAttributes.put("error.stack", e != null ? e.toString() : "No stack trace");
            
            TraceEvent errorEvent = new TraceEvent(
                "error",
                errorAttributes,
                System.currentTimeMillis()
            );
            span.getEvents().add(errorEvent);
            span.getTags().put("error", true);
        }
    }
    
    // 更新指标
    private void updateTraceMetrics(String traceId, TraceSpan span) {
        TraceMetrics metrics = traceMetrics.get(traceId);
        if (metrics == null) {
            metrics = new TraceMetrics(
                traceId,
                0,
                0,
                0,
                0,
                0,
                System.currentTimeMillis()
            );
            traceMetrics.put(traceId, metrics);
        }
        
        metrics.setTotalSpans(metrics.getTotalSpans() + 1);
        
        long duration = (Long) span.getTags().getOrDefault("duration_ms", 0L);
        metrics.setTotalDuration(metrics.getTotalDuration() + duration);
        
        if (span.getTags().containsKey("error")) {
            metrics.setErrorCount(metrics.getErrorCount() + 1);
        }
        
        // 更新最大和最小耗时
        if (duration > metrics.getMaxDuration()) {
            metrics.setMaxDuration(duration);
        }
        if (duration < metrics.getMinDuration() || metrics.getMinDuration() == 0) {
            metrics.setMinDuration(duration);
        }
    }
    
    // 获取Trace
    public Trace getTrace(String traceId) {
        TraceContext context = traceContexts.get(traceId);
        if (context == null) {
            return null;
        }
        
        // 收集所有相关的Span
        List<TraceSpan> spans = new ArrayList<>();
        for (TraceSpan span : traceSpans.values()) {
            if (span.getTraceId().equals(traceId)) {
                spans.add(span);
            }
        }
        
        // 构建Trace
        Trace trace = new Trace(
            traceId,
            context.getOperationName(),
            context.getTags(),
            spans,
            context.getStartTime(),
            getTraceEndTime(spans),
            traceMetrics.get(traceId)
        );
        
        return trace;
    }
    
    // 获取Trace结束时间
    private Long getTraceEndTime(List<TraceSpan> spans) {
        if (spans.isEmpty()) {
            return null;
        }
        
        long maxEndTime = 0;
        for (TraceSpan span : spans) {
            if (span.getEndTime() != null && span.getEndTime() > maxEndTime) {
                maxEndTime = span.getEndTime();
            }
        }
        
        return maxEndTime > 0 ? maxEndTime : null;
    }
    
    // 获取Span
    public TraceSpan getSpan(String spanId) {
        return traceSpans.get(spanId);
    }
    
    // 获取Trace指标
    public TraceMetrics getTraceMetrics(String traceId) {
        return traceMetrics.get(traceId);
    }
    
    // 清理过期的Trace数据
    public void cleanupOldTraces(long cutoffTime) {
        // 清理过期的TraceContext
        Iterator<Map.Entry<String, TraceContext>> contextIterator = traceContexts.entrySet().iterator();
        while (contextIterator.hasNext()) {
            Map.Entry<String, TraceContext> entry = contextIterator.next();
            if (entry.getValue().getStartTime() < cutoffTime) {
                contextIterator.remove();
            }
        }
        
        // 清理过期的TraceSpan
        Iterator<Map.Entry<String, TraceSpan>> spanIterator = traceSpans.entrySet().iterator();
        while (spanIterator.hasNext()) {
            Map.Entry<String, TraceSpan> entry = spanIterator.next();
            if (entry.getValue().getStartTime() < cutoffTime) {
                spanIterator.remove();
            }
        }
        
        // 清理过期的TraceMetrics
        Iterator<Map.Entry<String, TraceMetrics>> metricsIterator = traceMetrics.entrySet().iterator();
        while (metricsIterator.hasNext()) {
            Map.Entry<String, TraceMetrics> entry = metricsIterator.next();
            if (entry.getValue().getCreatedAt() < cutoffTime) {
                metricsIterator.remove();
            }
        }
    }
    
    // 生成唯一ID
    public String generateId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
    
    // TraceContext类
    public static class TraceContext {
        private String traceId;
        private String operationName;
        private Map<String, Object> tags;
        private long startTime;
        private Long endTime;
        
        public TraceContext(String traceId, String operationName, Map<String, Object> tags, long startTime, Long endTime) {
            this.traceId = traceId;
            this.operationName = operationName;
            this.tags = tags;
            this.startTime = startTime;
            this.endTime = endTime;
        }
        
        // Getters and setters
        public String getTraceId() { return traceId; }
        public void setTraceId(String traceId) { this.traceId = traceId; }
        public String getOperationName() { return operationName; }
        public void setOperationName(String operationName) { this.operationName = operationName; }
        public Map<String, Object> getTags() { return tags; }
        public void setTags(Map<String, Object> tags) { this.tags = tags; }
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public Long getEndTime() { return endTime; }
        public void setEndTime(Long endTime) { this.endTime = endTime; }
    }
    
    // TraceSpan类
    public static class TraceSpan {
        private String spanId;
        private String traceId;
        private String parentSpanId;
        private String operationName;
        private Map<String, Object> tags;
        private long startTime;
        private Long endTime;
        private List<TraceEvent> events;
        
        public TraceSpan(String spanId, String traceId, String parentSpanId, String operationName, Map<String, Object> tags, long startTime, Long endTime, List<TraceEvent> events) {
            this.spanId = spanId;
            this.traceId = traceId;
            this.parentSpanId = parentSpanId;
            this.operationName = operationName;
            this.tags = tags;
            this.startTime = startTime;
            this.endTime = endTime;
            this.events = events;
        }
        
        // Getters and setters
        public String getSpanId() { return spanId; }
        public void setSpanId(String spanId) { this.spanId = spanId; }
        public String getTraceId() { return traceId; }
        public void setTraceId(String traceId) { this.traceId = traceId; }
        public String getParentSpanId() { return parentSpanId; }
        public void setParentSpanId(String parentSpanId) { this.parentSpanId = parentSpanId; }
        public String getOperationName() { return operationName; }
        public void setOperationName(String operationName) { this.operationName = operationName; }
        public Map<String, Object> getTags() { return tags; }
        public void setTags(Map<String, Object> tags) { this.tags = tags; }
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public Long getEndTime() { return endTime; }
        public void setEndTime(Long endTime) { this.endTime = endTime; }
        public List<TraceEvent> getEvents() { return events; }
        public void setEvents(List<TraceEvent> events) { this.events = events; }
    }
    
    // TraceEvent类
    public static class TraceEvent {
        private String name;
        private Map<String, Object> attributes;
        private long timestamp;
        
        public TraceEvent(String name, Map<String, Object> attributes, long timestamp) {
            this.name = name;
            this.attributes = attributes;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Map<String, Object> getAttributes() { return attributes; }
        public void setAttributes(Map<String, Object> attributes) { this.attributes = attributes; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    // TraceMetrics类
    public static class TraceMetrics {
        private String traceId;
        private int totalSpans;
        private long totalDuration;
        private int errorCount;
        private long maxDuration;
        private long minDuration;
        private long createdAt;
        
        public TraceMetrics(String traceId, int totalSpans, long totalDuration, int errorCount, long maxDuration, long minDuration, long createdAt) {
            this.traceId = traceId;
            this.totalSpans = totalSpans;
            this.totalDuration = totalDuration;
            this.errorCount = errorCount;
            this.maxDuration = maxDuration;
            this.minDuration = minDuration;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getTraceId() { return traceId; }
        public void setTraceId(String traceId) { this.traceId = traceId; }
        public int getTotalSpans() { return totalSpans; }
        public void setTotalSpans(int totalSpans) { this.totalSpans = totalSpans; }
        public long getTotalDuration() { return totalDuration; }
        public void setTotalDuration(long totalDuration) { this.totalDuration = totalDuration; }
        public int getErrorCount() { return errorCount; }
        public void setErrorCount(int errorCount) { this.errorCount = errorCount; }
        public long getMaxDuration() { return maxDuration; }
        public void setMaxDuration(long maxDuration) { this.maxDuration = maxDuration; }
        public long getMinDuration() { return minDuration; }
        public void setMinDuration(long minDuration) { this.minDuration = minDuration; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        
        // 计算平均耗时
        public double getAverageDuration() {
            return totalSpans > 0 ? (double) totalDuration / totalSpans : 0;
        }
    }
    
    // Trace类
    public static class Trace {
        private String traceId;
        private String operationName;
        private Map<String, Object> tags;
        private List<TraceSpan> spans;
        private long startTime;
        private Long endTime;
        private TraceMetrics metrics;
        
        public Trace(String traceId, String operationName, Map<String, Object> tags, List<TraceSpan> spans, long startTime, Long endTime, TraceMetrics metrics) {
            this.traceId = traceId;
            this.operationName = operationName;
            this.tags = tags;
            this.spans = spans;
            this.startTime = startTime;
            this.endTime = endTime;
            this.metrics = metrics;
        }
        
        // Getters and setters
        public String getTraceId() { return traceId; }
        public void setTraceId(String traceId) { this.traceId = traceId; }
        public String getOperationName() { return operationName; }
        public void setOperationName(String operationName) { this.operationName = operationName; }
        public Map<String, Object> getTags() { return tags; }
        public void setTags(Map<String, Object> tags) { this.tags = tags; }
        public List<TraceSpan> getSpans() { return spans; }
        public void setSpans(List<TraceSpan> spans) { this.spans = spans; }
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public Long getEndTime() { return endTime; }
        public void setEndTime(Long endTime) { this.endTime = endTime; }
        public TraceMetrics getMetrics() { return metrics; }
        public void setMetrics(TraceMetrics metrics) { this.metrics = metrics; }
        
        // 计算总耗时
        public long getTotalDuration() {
            if (endTime == null) {
                return 0;
            }
            return endTime - startTime;
        }
    }
}