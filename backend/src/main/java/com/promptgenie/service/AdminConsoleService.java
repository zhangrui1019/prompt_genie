package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminConsoleService {
    
    private final Map<String, AdminUser> adminUsers = new ConcurrentHashMap<>();
    private final Map<String, AdminRole> adminRoles = new ConcurrentHashMap<>();
    private final Map<String, ConfigItem> configItems = new ConcurrentHashMap<>();
    private final Map<String, Alert> alerts = new ConcurrentHashMap<>();
    private final Map<String, AuditLog> auditLogs = new ConcurrentHashMap<>();
    
    // 初始化管理端服务
    public void init() {
        // 初始化默认角色
        initDefaultRoles();
        
        // 初始化默认配置
        initDefaultConfig();
    }
    
    // 初始化默认角色
    private void initDefaultRoles() {
        createAdminRole("super_admin", "超级管理员", "拥有所有权限");
        createAdminRole("content_admin", "内容管理员", "管理模板内容");
        createAdminRole("operation_admin", "运营管理员", "管理运营配置");
        createAdminRole("tech_admin", "技术管理员", "管理技术配置");
    }
    
    // 初始化默认配置
    private void initDefaultConfig() {
        // 分类配置
        setConfig("categories", "分类配置", Arrays.asList(
            Map.of("id", "marketing", "name", "营销", "order", 1),
            Map.of("id", "content", "name", "内容创作", "order", 2),
            Map.of("id", "coding", "name", "编程", "order", 3),
            Map.of("id", "education", "name", "教育", "order", 4),
            Map.of("id", "design", "name", "设计", "order", 5)
        ));
        
        // 趋势权重配置
        setConfig("trending_weights", "趋势权重配置", Map.of(
            "view_weight", 1.0,
            "copy_weight", 2.0,
            "favorite_weight", 3.0,
            "fork_weight", 4.0,
            "comment_weight", 2.5
        ));
        
        // 风控阈值配置
        setConfig("risk_control", "风控阈值配置", Map.of(
            "like_frequency_limit", 10, // 每分钟点赞上限
            "fork_frequency_limit", 5, // 每分钟分叉上限
            "comment_frequency_limit", 20, // 每分钟评论上限
            "blacklist_keywords", Arrays.asList("spam", "scam", "illegal")
        ));
    }
    
    // 创建管理员角色
    public AdminRole createAdminRole(String roleId, String name, String description) {
        AdminRole role = new AdminRole(
            roleId,
            name,
            description,
            System.currentTimeMillis()
        );
        adminRoles.put(roleId, role);
        return role;
    }
    
    // 添加管理员用户
    public AdminUser addAdminUser(String userId, String email, String roleId) {
        AdminRole role = adminRoles.get(roleId);
        if (role == null) {
            throw new IllegalArgumentException("Role not found: " + roleId);
        }
        
        AdminUser user = new AdminUser(
            userId,
            email,
            roleId,
            "active",
            System.currentTimeMillis()
        );
        adminUsers.put(userId, user);
        
        // 记录审计日志
        recordAuditLog("ADMIN_USER_ADD", "Added admin user: " + email, null);
        
        return user;
    }
    
    // 移除管理员用户
    public void removeAdminUser(String userId) {
        AdminUser user = adminUsers.get(userId);
        if (user != null) {
            user.setStatus("inactive");
            
            // 记录审计日志
            recordAuditLog("ADMIN_USER_REMOVE", "Removed admin user: " + user.getEmail(), null);
        }
    }
    
    // 设置配置项
    public ConfigItem setConfig(String configId, String name, Object value) {
        ConfigItem config = new ConfigItem(
            configId,
            name,
            value,
            System.currentTimeMillis()
        );
        configItems.put(configId, config);
        
        // 记录审计日志
        recordAuditLog("CONFIG_UPDATE", "Updated config: " + name, null);
        
        return config;
    }
    
    // 获取配置项
    public ConfigItem getConfig(String configId) {
        return configItems.get(configId);
    }
    
    // 获取所有配置项
    public List<ConfigItem> getConfigs() {
        return new ArrayList<>(configItems.values());
    }
    
    // 生成告警
    public Alert generateAlert(String alertId, String alertType, String message, Map<String, Object> details) {
        Alert alert = new Alert(
            alertId,
            alertType,
            message,
            details,
            "active",
            System.currentTimeMillis()
        );
        alerts.put(alertId, alert);
        return alert;
    }
    
    // 处理告警
    public void handleAlert(String alertId, String action, String handlerId) {
        Alert alert = alerts.get(alertId);
        if (alert != null) {
            alert.setStatus("handled");
            alert.setHandledAt(System.currentTimeMillis());
            alert.setHandlerId(handlerId);
            alert.setAction(action);
            
            // 记录审计日志
            recordAuditLog("ALERT_HANDLED", "Handled alert: " + alertId, handlerId);
        }
    }
    
    // 记录审计日志
    private void recordAuditLog(String action, String description, String operatorId) {
        String logId = "audit-" + System.currentTimeMillis();
        AuditLog log = new AuditLog(
            logId,
            action,
            description,
            operatorId,
            System.currentTimeMillis()
        );
        auditLogs.put(logId, log);
    }
    
    // 获取管理员用户列表
    public List<AdminUser> getAdminUsers() {
        return new ArrayList<>(adminUsers.values());
    }
    
    // 获取管理员角色列表
    public List<AdminRole> getAdminRoles() {
        return new ArrayList<>(adminRoles.values());
    }
    
    // 获取告警列表
    public List<Alert> getAlerts(String status) {
        List<Alert> filteredAlerts = new ArrayList<>();
        for (Alert alert : alerts.values()) {
            if (status == null || status.equals(alert.getStatus())) {
                filteredAlerts.add(alert);
            }
        }
        // 按时间倒序排序
        filteredAlerts.sort(Comparator.comparingLong(Alert::getCreatedAt).reversed());
        return filteredAlerts;
    }
    
    // 获取审计日志
    public List<AuditLog> getAuditLogs(long startTime, long endTime) {
        List<AuditLog> filteredLogs = new ArrayList<>();
        for (AuditLog log : auditLogs.values()) {
            if (log.getTimestamp() >= startTime && log.getTimestamp() <= endTime) {
                filteredLogs.add(log);
            }
        }
        // 按时间倒序排序
        filteredLogs.sort(Comparator.comparingLong(AuditLog::getTimestamp).reversed());
        return filteredLogs;
    }
    
    // 管理员用户类
    public static class AdminUser {
        private String id;
        private String email;
        private String roleId;
        private String status; // active, inactive
        private long createdAt;
        
        public AdminUser(String id, String email, String roleId, String status, long createdAt) {
            this.id = id;
            this.email = email;
            this.roleId = roleId;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRoleId() { return roleId; }
        public void setRoleId(String roleId) { this.roleId = roleId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 管理员角色类
    public static class AdminRole {
        private String id;
        private String name;
        private String description;
        private long createdAt;
        
        public AdminRole(String id, String name, String description, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 配置项类
    public static class ConfigItem {
        private String id;
        private String name;
        private Object value;
        private long updatedAt;
        
        public ConfigItem(String id, String name, Object value, long updatedAt) {
            this.id = id;
            this.name = name;
            this.value = value;
            this.updatedAt = updatedAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Object getValue() { return value; }
        public void setValue(Object value) { this.value = value; }
        public long getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }
    }
    
    // 告警类
    public static class Alert {
        private String id;
        private String alertType;
        private String message;
        private Map<String, Object> details;
        private String status; // active, handled
        private String action;
        private String handlerId;
        private long createdAt;
        private long handledAt;
        
        public Alert(String id, String alertType, String message, Map<String, Object> details, String status, long createdAt) {
            this.id = id;
            this.alertType = alertType;
            this.message = message;
            this.details = details;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAlertType() { return alertType; }
        public void setAlertType(String alertType) { this.alertType = alertType; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Map<String, Object> getDetails() { return details; }
        public void setDetails(Map<String, Object> details) { this.details = details; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getHandlerId() { return handlerId; }
        public void setHandlerId(String handlerId) { this.handlerId = handlerId; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getHandledAt() { return handledAt; }
        public void setHandledAt(long handledAt) { this.handledAt = handledAt; }
    }
    
    // 审计日志类
    public static class AuditLog {
        private String id;
        private String action;
        private String description;
        private String operatorId;
        private long timestamp;
        
        public AuditLog(String id, String action, String description, String operatorId, long timestamp) {
            this.id = id;
            this.action = action;
            this.description = description;
            this.operatorId = operatorId;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getOperatorId() { return operatorId; }
        public void setOperatorId(String operatorId) { this.operatorId = operatorId; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}