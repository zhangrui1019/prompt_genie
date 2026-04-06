package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
public class PrivacyComplianceService {
    
    private final Map<String, DataPrivacyPolicy> privacyPolicies = new ConcurrentHashMap<>();
    private final Map<String, DataAccessControl> accessControls = new ConcurrentHashMap<>();
    private final Map<String, DataRetentionPolicy> retentionPolicies = new ConcurrentHashMap<>();
    private final Map<String, ComplianceAudit> complianceAudits = new ConcurrentHashMap<>();
    
    // 敏感信息正则表达式
    private final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private final Pattern PHONE_PATTERN = Pattern.compile("(\\+\\d{1,3})?[\\s-]?(\\d{3,4})[\\s-]?(\\d{4,5})");
    private final Pattern ID_CARD_PATTERN = Pattern.compile("[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]");
    
    // 初始化隐私合规服务
    public void init() {
        // 初始化默认隐私政策
        initDefaultPrivacyPolicies();
        
        // 初始化默认数据留存政策
        initDefaultRetentionPolicies();
    }
    
    // 初始化默认隐私政策
    private void initDefaultPrivacyPolicies() {
        // 通用隐私政策
        createPrivacyPolicy(
            "default",
            "通用隐私政策",
            "适用于所有用户的数据隐私保护",
            Map.of(
                "data_minimization", true,
                "purpose_limitation", true,
                "storage_limitation", true,
                "integrity_and_confidentiality", true
            ),
            System.currentTimeMillis()
        );
    }
    
    // 初始化默认数据留存政策
    private void initDefaultRetentionPolicies() {
        // 默认留存政策
        createRetentionPolicy(
            "default",
            "默认数据留存政策",
            365, // 1年
            true, // 自动删除
            System.currentTimeMillis()
        );
    }
    
    // 创建隐私政策
    public DataPrivacyPolicy createPrivacyPolicy(String policyId, String name, String description, Map<String, Object> settings, long createdAt) {
        DataPrivacyPolicy policy = new DataPrivacyPolicy(
            policyId,
            name,
            description,
            settings,
            createdAt
        );
        privacyPolicies.put(policyId, policy);
        return policy;
    }
    
    // 创建数据访问控制
    public DataAccessControl createAccessControl(String controlId, String userId, String resourceId, String accessLevel, long createdAt) {
        DataAccessControl control = new DataAccessControl(
            controlId,
            userId,
            resourceId,
            accessLevel,
            createdAt
        );
        accessControls.put(controlId, control);
        return control;
    }
    
    // 创建数据留存政策
    public DataRetentionPolicy createRetentionPolicy(String policyId, String name, int retentionDays, boolean autoDelete, long createdAt) {
        DataRetentionPolicy policy = new DataRetentionPolicy(
            policyId,
            name,
            retentionDays,
            autoDelete,
            createdAt
        );
        retentionPolicies.put(policyId, policy);
        return policy;
    }
    
    // 数据脱敏
    public String anonymizeData(String data, String policyId) {
        DataPrivacyPolicy policy = privacyPolicies.get(policyId);
        if (policy == null) {
            policy = privacyPolicies.get("default");
        }
        
        // 应用数据脱敏规则
        String result = data;
        
        // 脱敏邮箱
        result = EMAIL_PATTERN.matcher(result).replaceAll("***@***.***");
        
        // 脱敏电话号码
        result = PHONE_PATTERN.matcher(result).replaceAll("***-***-****");
        
        // 脱敏身份证号
        result = ID_CARD_PATTERN.matcher(result).replaceAll("******************");
        
        return result;
    }
    
    // 检查数据访问权限
    public boolean checkAccess(String userId, String resourceId, String requiredLevel) {
        // 查找用户对资源的访问控制
        for (DataAccessControl control : accessControls.values()) {
            if (control.getUserId().equals(userId) && control.getResourceId().equals(resourceId)) {
                // 检查访问级别
                return hasSufficientAccess(control.getAccessLevel(), requiredLevel);
            }
        }
        return false;
    }
    
    // 检查访问级别是否足够
    private boolean hasSufficientAccess(String currentLevel, String requiredLevel) {
        Map<String, Integer> levelHierarchy = Map.of(
            "none", 0,
            "read", 1,
            "write", 2,
            "admin", 3
        );
        
        Integer current = levelHierarchy.get(currentLevel);
        Integer required = levelHierarchy.get(requiredLevel);
        
        return current != null && required != null && current >= required;
    }
    
    // 执行合规性检查
    public ComplianceCheckResult checkCompliance(String data, String policyId) {
        DataPrivacyPolicy policy = privacyPolicies.get(policyId);
        if (policy == null) {
            policy = privacyPolicies.get("default");
        }
        
        List<String> issues = new ArrayList<>();
        
        // 检查敏感信息
        if (EMAIL_PATTERN.matcher(data).find()) {
            issues.add("包含邮箱地址");
        }
        if (PHONE_PATTERN.matcher(data).find()) {
            issues.add("包含电话号码");
        }
        if (ID_CARD_PATTERN.matcher(data).find()) {
            issues.add("包含身份证号");
        }
        
        // 检查数据长度
        if (data.length() > 1000) {
            issues.add("数据长度超过限制");
        }
        
        boolean compliant = issues.isEmpty();
        
        // 记录合规性审计
        String auditId = "audit_" + System.currentTimeMillis();
        ComplianceAudit audit = new ComplianceAudit(
            auditId,
            policyId,
            data.length(),
            issues.size(),
            compliant,
            System.currentTimeMillis()
        );
        complianceAudits.put(auditId, audit);
        
        return new ComplianceCheckResult(
            compliant,
            issues,
            auditId
        );
    }
    
    // 数据删除
    public boolean deleteData(String dataId, String userId) {
        // 检查用户是否有权限删除数据
        if (!checkAccess(userId, dataId, "write")) {
            return false;
        }
        
        // 执行数据删除操作
        // 这里简化处理，实际应该从存储中删除数据
        
        // 记录删除操作
        String auditId = "audit_" + System.currentTimeMillis();
        ComplianceAudit audit = new ComplianceAudit(
            auditId,
            "data_deletion",
            0,
            0,
            true,
            System.currentTimeMillis()
        );
        complianceAudits.put(auditId, audit);
        
        return true;
    }
    
    // 获取隐私政策
    public DataPrivacyPolicy getPrivacyPolicy(String policyId) {
        return privacyPolicies.get(policyId);
    }
    
    // 获取数据访问控制
    public DataAccessControl getAccessControl(String controlId) {
        return accessControls.get(controlId);
    }
    
    // 获取数据留存政策
    public DataRetentionPolicy getRetentionPolicy(String policyId) {
        return retentionPolicies.get(policyId);
    }
    
    // 获取合规性审计
    public ComplianceAudit getComplianceAudit(String auditId) {
        return complianceAudits.get(auditId);
    }
    
    // 数据隐私政策类
    public static class DataPrivacyPolicy {
        private String policyId;
        private String name;
        private String description;
        private Map<String, Object> settings;
        private long createdAt;
        
        public DataPrivacyPolicy(String policyId, String name, String description, Map<String, Object> settings, long createdAt) {
            this.policyId = policyId;
            this.name = name;
            this.description = description;
            this.settings = settings;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getPolicyId() { return policyId; }
        public void setPolicyId(String policyId) { this.policyId = policyId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Map<String, Object> getSettings() { return settings; }
        public void setSettings(Map<String, Object> settings) { this.settings = settings; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 数据访问控制类
    public static class DataAccessControl {
        private String controlId;
        private String userId;
        private String resourceId;
        private String accessLevel;
        private long createdAt;
        
        public DataAccessControl(String controlId, String userId, String resourceId, String accessLevel, long createdAt) {
            this.controlId = controlId;
            this.userId = userId;
            this.resourceId = resourceId;
            this.accessLevel = accessLevel;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getControlId() { return controlId; }
        public void setControlId(String controlId) { this.controlId = controlId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getResourceId() { return resourceId; }
        public void setResourceId(String resourceId) { this.resourceId = resourceId; }
        public String getAccessLevel() { return accessLevel; }
        public void setAccessLevel(String accessLevel) { this.accessLevel = accessLevel; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 数据留存政策类
    public static class DataRetentionPolicy {
        private String policyId;
        private String name;
        private int retentionDays;
        private boolean autoDelete;
        private long createdAt;
        
        public DataRetentionPolicy(String policyId, String name, int retentionDays, boolean autoDelete, long createdAt) {
            this.policyId = policyId;
            this.name = name;
            this.retentionDays = retentionDays;
            this.autoDelete = autoDelete;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getPolicyId() { return policyId; }
        public void setPolicyId(String policyId) { this.policyId = policyId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getRetentionDays() { return retentionDays; }
        public void setRetentionDays(int retentionDays) { this.retentionDays = retentionDays; }
        public boolean isAutoDelete() { return autoDelete; }
        public void setAutoDelete(boolean autoDelete) { this.autoDelete = autoDelete; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 合规性审计类
    public static class ComplianceAudit {
        private String auditId;
        private String policyId;
        private int dataSize;
        private int issueCount;
        private boolean compliant;
        private long createdAt;
        
        public ComplianceAudit(String auditId, String policyId, int dataSize, int issueCount, boolean compliant, long createdAt) {
            this.auditId = auditId;
            this.policyId = policyId;
            this.dataSize = dataSize;
            this.issueCount = issueCount;
            this.compliant = compliant;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getAuditId() { return auditId; }
        public void setAuditId(String auditId) { this.auditId = auditId; }
        public String getPolicyId() { return policyId; }
        public void setPolicyId(String policyId) { this.policyId = policyId; }
        public int getDataSize() { return dataSize; }
        public void setDataSize(int dataSize) { this.dataSize = dataSize; }
        public int getIssueCount() { return issueCount; }
        public void setIssueCount(int issueCount) { this.issueCount = issueCount; }
        public boolean isCompliant() { return compliant; }
        public void setCompliant(boolean compliant) { this.compliant = compliant; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 合规性检查结果类
    public static class ComplianceCheckResult {
        private boolean compliant;
        private List<String> issues;
        private String auditId;
        
        public ComplianceCheckResult(boolean compliant, List<String> issues, String auditId) {
            this.compliant = compliant;
            this.issues = issues;
            this.auditId = auditId;
        }
        
        // Getters and setters
        public boolean isCompliant() { return compliant; }
        public void setCompliant(boolean compliant) { this.compliant = compliant; }
        public List<String> getIssues() { return issues; }
        public void setIssues(List<String> issues) { this.issues = issues; }
        public String getAuditId() { return auditId; }
        public void setAuditId(String auditId) { this.auditId = auditId; }
    }
}