package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class RealTimeDashboardService {
    
    private final Map<String, Dashboard> dashboards = new ConcurrentHashMap<>();
    private final Map<String, Widget> widgets = new ConcurrentHashMap<>();
    private final Map<String, TimeSeriesData> timeSeriesData = new ConcurrentHashMap<>();
    private final Map<String, Alert> dashboardAlerts = new ConcurrentHashMap<>();
    
    // 初始化仪表盘服务
    public void init() {
        // 初始化默认仪表盘
        initDefaultDashboard();
    }
    
    // 初始化默认仪表盘
    private void initDefaultDashboard() {
        // 创建系统概览仪表盘
        Dashboard systemOverview = createDashboard(
            "system_overview",
            "系统概览",
            "系统运行状态的实时监控",
            System.currentTimeMillis()
        );
        
        // 添加默认组件
        addWidgetToDashboard(systemOverview.getDashboardId(), "widget_1", "请求量", "COUNTER", Map.of(
            "metric", "request_count",
            "interval", 60,
            "color", "#10B981"
        ));
        
        addWidgetToDashboard(systemOverview.getDashboardId(), "widget_2", "响应时间", "GAUGE", Map.of(
            "metric", "response_time",
            "interval", 60,
            "color", "#3B82F6",
            "unit", "ms"
        ));
        
        addWidgetToDashboard(systemOverview.getDashboardId(), "widget_3", "错误率", "GAUGE", Map.of(
            "metric", "error_rate",
            "interval", 60,
            "color", "#EF4444",
            "unit", "%"
        ));
        
        addWidgetToDashboard(systemOverview.getDashboardId(), "widget_4", "令牌消耗", "COUNTER", Map.of(
            "metric", "token_usage",
            "interval", 60,
            "color", "#8B5CF6"
        ));
    }
    
    // 创建仪表盘
    public Dashboard createDashboard(String dashboardId, String name, String description, long createdAt) {
        Dashboard dashboard = new Dashboard(
            dashboardId,
            name,
            description,
            new ArrayList<>(),
            createdAt
        );
        dashboards.put(dashboardId, dashboard);
        return dashboard;
    }
    
    // 添加组件到仪表盘
    public Widget addWidgetToDashboard(String dashboardId, String widgetId, String name, String type, Map<String, Object> config) {
        Dashboard dashboard = dashboards.get(dashboardId);
        if (dashboard == null) {
            throw new IllegalArgumentException("Dashboard not found");
        }
        
        Widget widget = new Widget(
            widgetId,
            dashboardId,
            name,
            type,
            config,
            System.currentTimeMillis()
        );
        widgets.put(widgetId, widget);
        dashboard.getWidgetIds().add(widgetId);
        
        return widget;
    }
    
    // 更新组件配置
    public void updateWidgetConfig(String widgetId, Map<String, Object> config) {
        Widget widget = widgets.get(widgetId);
        if (widget != null) {
            widget.setConfig(config);
        }
    }
    
    // 移除组件
    public void removeWidgetFromDashboard(String dashboardId, String widgetId) {
        Dashboard dashboard = dashboards.get(dashboardId);
        if (dashboard != null) {
            dashboard.getWidgetIds().remove(widgetId);
            widgets.remove(widgetId);
        }
    }
    
    // 记录时间序列数据
    public void recordTimeSeriesData(String metricName, double value, Map<String, String> tags, long timestamp) {
        String key = metricName + "_" + tags.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> entry.getKey() + "=" + entry.getValue())
            .collect(Collectors.joining(","));
        
        TimeSeriesData data = timeSeriesData.get(key);
        if (data == null) {
            data = new TimeSeriesData(
                key,
                metricName,
                tags,
                new ArrayList<>(),
                System.currentTimeMillis()
            );
            timeSeriesData.put(key, data);
        }
        
        // 添加数据点
        DataPoint dataPoint = new DataPoint(value, timestamp);
        data.getDataPoints().add(dataPoint);
        
        // 保留最近24小时的数据
        long cutoffTime = System.currentTimeMillis() - 24 * 60 * 60 * 1000;
        data.getDataPoints().removeIf(point -> point.getTimestamp() < cutoffTime);
    }
    
    // 获取仪表盘数据
    public DashboardData getDashboardData(String dashboardId, long startTime, long endTime) {
        Dashboard dashboard = dashboards.get(dashboardId);
        if (dashboard == null) {
            return null;
        }
        
        List<WidgetData> widgetDataList = new ArrayList<>();
        for (String widgetId : dashboard.getWidgetIds()) {
            Widget widget = widgets.get(widgetId);
            if (widget != null) {
                WidgetData widgetData = getWidgetData(widget, startTime, endTime);
                widgetDataList.add(widgetData);
            }
        }
        
        // 获取告警信息
        List<Alert> alerts = getDashboardAlerts(dashboardId);
        
        return new DashboardData(
            dashboard.getDashboardId(),
            dashboard.getName(),
            widgetDataList,
            alerts,
            System.currentTimeMillis()
        );
    }
    
    // 获取组件数据
    private WidgetData getWidgetData(Widget widget, long startTime, long endTime) {
        String metricName = (String) widget.getConfig().getOrDefault("metric", "");
        if (metricName.isEmpty()) {
            return new WidgetData(
                widget.getWidgetId(),
                widget.getName(),
                widget.getType(),
                Collections.emptyList(),
                0,
                0,
                0
            );
        }
        
        // 查找相关的时间序列数据
        List<DataPoint> dataPoints = new ArrayList<>();
        for (TimeSeriesData data : timeSeriesData.values()) {
            if (data.getMetricName().equals(metricName)) {
                dataPoints.addAll(data.getDataPoints().stream()
                    .filter(point -> point.getTimestamp() >= startTime && point.getTimestamp() <= endTime)
                    .collect(Collectors.toList()));
            }
        }
        
        // 按时间排序
        dataPoints.sort(Comparator.comparingLong(DataPoint::getTimestamp));
        
        // 计算统计值
        double currentValue = 0;
        double minValue = Double.MAX_VALUE;
        double maxValue = Double.MIN_VALUE;
        
        if (!dataPoints.isEmpty()) {
            currentValue = dataPoints.get(dataPoints.size() - 1).getValue();
            minValue = dataPoints.stream().mapToDouble(DataPoint::getValue).min().orElse(0);
            maxValue = dataPoints.stream().mapToDouble(DataPoint::getValue).max().orElse(0);
        }
        
        return new WidgetData(
            widget.getWidgetId(),
            widget.getName(),
            widget.getType(),
            dataPoints,
            currentValue,
            minValue,
            maxValue
        );
    }
    
    // 获取仪表盘告警
    private List<Alert> getDashboardAlerts(String dashboardId) {
        return dashboardAlerts.values().stream()
            .filter(alert -> alert.getDashboardId().equals(dashboardId) && "OPEN".equals(alert.getStatus()))
            .collect(Collectors.toList());
    }
    
    // 添加告警到仪表盘
    public void addAlertToDashboard(String dashboardId, String alertId, String description, String severity, long createdAt) {
        Alert alert = new Alert(
            alertId,
            dashboardId,
            description,
            severity,
            "OPEN",
            createdAt,
            null
        );
        dashboardAlerts.put(alertId, alert);
    }
    
    // 解决告警
    public void resolveAlert(String alertId) {
        Alert alert = dashboardAlerts.get(alertId);
        if (alert != null) {
            alert.setStatus("RESOLVED");
            alert.setResolvedAt(System.currentTimeMillis());
        }
    }
    
    // 获取所有仪表盘
    public List<Dashboard> getDashboards() {
        return new ArrayList<>(dashboards.values());
    }
    
    // 获取仪表盘
    public Dashboard getDashboard(String dashboardId) {
        return dashboards.get(dashboardId);
    }
    
    // 获取组件
    public Widget getWidget(String widgetId) {
        return widgets.get(widgetId);
    }
    
    // 仪表盘类
    public static class Dashboard {
        private String dashboardId;
        private String name;
        private String description;
        private List<String> widgetIds;
        private long createdAt;
        
        public Dashboard(String dashboardId, String name, String description, List<String> widgetIds, long createdAt) {
            this.dashboardId = dashboardId;
            this.name = name;
            this.description = description;
            this.widgetIds = widgetIds;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getDashboardId() { return dashboardId; }
        public void setDashboardId(String dashboardId) { this.dashboardId = dashboardId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getWidgetIds() { return widgetIds; }
        public void setWidgetIds(List<String> widgetIds) { this.widgetIds = widgetIds; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 组件类
    public static class Widget {
        private String widgetId;
        private String dashboardId;
        private String name;
        private String type;
        private Map<String, Object> config;
        private long createdAt;
        
        public Widget(String widgetId, String dashboardId, String name, String type, Map<String, Object> config, long createdAt) {
            this.widgetId = widgetId;
            this.dashboardId = dashboardId;
            this.name = name;
            this.type = type;
            this.config = config;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getWidgetId() { return widgetId; }
        public void setWidgetId(String widgetId) { this.widgetId = widgetId; }
        public String getDashboardId() { return dashboardId; }
        public void setDashboardId(String dashboardId) { this.dashboardId = dashboardId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Map<String, Object> getConfig() { return config; }
        public void setConfig(Map<String, Object> config) { this.config = config; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 时间序列数据类
    public static class TimeSeriesData {
        private String dataId;
        private String metricName;
        private Map<String, String> tags;
        private List<DataPoint> dataPoints;
        private long createdAt;
        
        public TimeSeriesData(String dataId, String metricName, Map<String, String> tags, List<DataPoint> dataPoints, long createdAt) {
            this.dataId = dataId;
            this.metricName = metricName;
            this.tags = tags;
            this.dataPoints = dataPoints;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getDataId() { return dataId; }
        public void setDataId(String dataId) { this.dataId = dataId; }
        public String getMetricName() { return metricName; }
        public void setMetricName(String metricName) { this.metricName = metricName; }
        public Map<String, String> getTags() { return tags; }
        public void setTags(Map<String, String> tags) { this.tags = tags; }
        public List<DataPoint> getDataPoints() { return dataPoints; }
        public void setDataPoints(List<DataPoint> dataPoints) { this.dataPoints = dataPoints; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 数据点类
    public static class DataPoint {
        private double value;
        private long timestamp;
        
        public DataPoint(double value, long timestamp) {
            this.value = value;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public double getValue() { return value; }
        public void setValue(double value) { this.value = value; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    // 仪表盘数据类
    public static class DashboardData {
        private String dashboardId;
        private String name;
        private List<WidgetData> widgets;
        private List<Alert> alerts;
        private long timestamp;
        
        public DashboardData(String dashboardId, String name, List<WidgetData> widgets, List<Alert> alerts, long timestamp) {
            this.dashboardId = dashboardId;
            this.name = name;
            this.widgets = widgets;
            this.alerts = alerts;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getDashboardId() { return dashboardId; }
        public void setDashboardId(String dashboardId) { this.dashboardId = dashboardId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<WidgetData> getWidgets() { return widgets; }
        public void setWidgets(List<WidgetData> widgets) { this.widgets = widgets; }
        public List<Alert> getAlerts() { return alerts; }
        public void setAlerts(List<Alert> alerts) { this.alerts = alerts; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    // 组件数据类
    public static class WidgetData {
        private String widgetId;
        private String name;
        private String type;
        private List<DataPoint> dataPoints;
        private double currentValue;
        private double minValue;
        private double maxValue;
        
        public WidgetData(String widgetId, String name, String type, List<DataPoint> dataPoints, double currentValue, double minValue, double maxValue) {
            this.widgetId = widgetId;
            this.name = name;
            this.type = type;
            this.dataPoints = dataPoints;
            this.currentValue = currentValue;
            this.minValue = minValue;
            this.maxValue = maxValue;
        }
        
        // Getters and setters
        public String getWidgetId() { return widgetId; }
        public void setWidgetId(String widgetId) { this.widgetId = widgetId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public List<DataPoint> getDataPoints() { return dataPoints; }
        public void setDataPoints(List<DataPoint> dataPoints) { this.dataPoints = dataPoints; }
        public double getCurrentValue() { return currentValue; }
        public void setCurrentValue(double currentValue) { this.currentValue = currentValue; }
        public double getMinValue() { return minValue; }
        public void setMinValue(double minValue) { this.minValue = minValue; }
        public double getMaxValue() { return maxValue; }
        public void setMaxValue(double maxValue) { this.maxValue = maxValue; }
    }
    
    // 告警类
    public static class Alert {
        private String alertId;
        private String dashboardId;
        private String description;
        private String severity;
        private String status;
        private long createdAt;
        private Long resolvedAt;
        
        public Alert(String alertId, String dashboardId, String description, String severity, String status, long createdAt, Long resolvedAt) {
            this.alertId = alertId;
            this.dashboardId = dashboardId;
            this.description = description;
            this.severity = severity;
            this.status = status;
            this.createdAt = createdAt;
            this.resolvedAt = resolvedAt;
        }
        
        // Getters and setters
        public String getAlertId() { return alertId; }
        public void setAlertId(String alertId) { this.alertId = alertId; }
        public String getDashboardId() { return dashboardId; }
        public void setDashboardId(String dashboardId) { this.dashboardId = dashboardId; }
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
}