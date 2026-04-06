package com.promptgenie.service;

import org.springframework.stereotype.Service;

import javax.crypto.*;
import javax.crypto.spec.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SecurityService {
    
    private final Map<String, UserSession> userSessions = new ConcurrentHashMap<>();
    private final Map<String, ApiKey> apiKeys = new ConcurrentHashMap<>();
    private final List<SecurityAuditLog> auditLogs = new ArrayList<>();
    
    // 密钥管理
    private KeyPair rsaKeyPair;
    private SecretKey aesKey;
    
    // 初始化安全服务
    public void init() {
        try {
            // 生成RSA密钥对
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            rsaKeyPair = keyPairGenerator.generateKeyPair();
            
            // 生成AES密钥
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
            keyGenerator.init(256);
            aesKey = keyGenerator.generateKey();
            
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to initialize security service", e);
        }
    }
    
    // 加密数据
    public String encrypt(String data) throws Exception {
        // 使用AES加密
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        IvParameterSpec iv = new IvParameterSpec(new byte[16]);
        cipher.init(Cipher.ENCRYPT_MODE, aesKey, iv);
        byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encrypted);
    }
    
    // 解密数据
    public String decrypt(String encryptedData) throws Exception {
        // 使用AES解密
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        IvParameterSpec iv = new IvParameterSpec(new byte[16]);
        cipher.init(Cipher.DECRYPT_MODE, aesKey, iv);
        byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        return new String(decrypted, StandardCharsets.UTF_8);
    }
    
    // 生成API密钥
    public ApiKey generateApiKey(String userId, String description) {
        String key = UUID.randomUUID().toString().replace("-", "");
        ApiKey apiKey = new ApiKey(
            key,
            userId,
            description,
            System.currentTimeMillis(),
            System.currentTimeMillis() + 365 * 24 * 60 * 60 * 1000, // 1年过期
            "active"
        );
        apiKeys.put(key, apiKey);
        
        // 记录审计日志
        logAudit("API_KEY_GENERATED", userId, "Generated API key for user: " + userId);
        
        return apiKey;
    }
    
    // 验证API密钥
    public boolean validateApiKey(String apiKey) {
        ApiKey key = apiKeys.get(apiKey);
        if (key == null) {
            return false;
        }
        
        if (!"active".equals(key.getStatus())) {
            return false;
        }
        
        if (key.getExpiresAt() < System.currentTimeMillis()) {
            return false;
        }
        
        return true;
    }
    
    // 禁用API密钥
    public void revokeApiKey(String apiKey) {
        ApiKey key = apiKeys.get(apiKey);
        if (key != null) {
            key.setStatus("revoked");
            
            // 记录审计日志
            logAudit("API_KEY_REVOKED", key.getUserId(), "Revoked API key for user: " + key.getUserId());
        }
    }
    
    // 生成用户会话
    public UserSession createUserSession(String userId, String ipAddress) {
        String sessionId = UUID.randomUUID().toString();
        UserSession session = new UserSession(
            sessionId,
            userId,
            ipAddress,
            System.currentTimeMillis(),
            System.currentTimeMillis() + 24 * 60 * 60 * 1000, // 24小时过期
            "active"
        );
        userSessions.put(sessionId, session);
        
        // 记录审计日志
        logAudit("USER_SESSION_CREATED", userId, "Created user session for user: " + userId + " from IP: " + ipAddress);
        
        return session;
    }
    
    // 验证用户会话
    public boolean validateUserSession(String sessionId) {
        UserSession session = userSessions.get(sessionId);
        if (session == null) {
            return false;
        }
        
        if (!"active".equals(session.getStatus())) {
            return false;
        }
        
        if (session.getExpiresAt() < System.currentTimeMillis()) {
            return false;
        }
        
        // 延长会话过期时间
        session.setExpiresAt(System.currentTimeMillis() + 24 * 60 * 60 * 1000);
        
        return true;
    }
    
    // 注销用户会话
    public void invalidateUserSession(String sessionId) {
        UserSession session = userSessions.get(sessionId);
        if (session != null) {
            session.setStatus("invalidated");
            
            // 记录审计日志
            logAudit("USER_SESSION_INVALIDATED", session.getUserId(), "Invalidated user session for user: " + session.getUserId());
        }
    }
    
    // 检查权限
    public boolean checkPermission(String userId, String resource, String action) {
        // 这里应该实现实际的权限检查逻辑
        // 为了演示，我们简单返回true
        return true;
    }
    
    // 记录安全审计日志
    public void logAudit(String eventType, String userId, String description) {
        SecurityAuditLog log = new SecurityAuditLog(
            UUID.randomUUID().toString(),
            eventType,
            userId,
            description,
            System.currentTimeMillis(),
            "active"
        );
        auditLogs.add(log);
        
        // 限制日志数量，只保留最近的10000条
        if (auditLogs.size() > 10000) {
            auditLogs.subList(0, auditLogs.size() - 10000).clear();
        }
    }
    
    // 获取安全审计日志
    public List<SecurityAuditLog> getAuditLogs(long startTime, long endTime, String eventType) {
        return auditLogs.stream()
            .filter(log -> log.getTimestamp() >= startTime && log.getTimestamp() <= endTime)
            .filter(log -> eventType == null || eventType.equals(log.getEventType()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 生成密码哈希
    public String generatePasswordHash(String password) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hash);
    }
    
    // 验证密码
    public boolean verifyPassword(String password, String hash) throws Exception {
        String generatedHash = generatePasswordHash(password);
        return generatedHash.equals(hash);
    }
    
    // 生成随机令牌
    public String generateToken(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder token = new StringBuilder(length);
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            token.append(chars.charAt(random.nextInt(chars.length())));
        }
        return token.toString();
    }
    
    // 清理过期的会话和API密钥
    public void cleanupExpired() {
        long now = System.currentTimeMillis();
        
        // 清理过期的会话
        userSessions.entrySet().removeIf(entry -> entry.getValue().getExpiresAt() < now || "invalidated".equals(entry.getValue().getStatus()));
        
        // 清理过期的API密钥
        apiKeys.entrySet().removeIf(entry -> entry.getValue().getExpiresAt() < now || "revoked".equals(entry.getValue().getStatus()));
    }
    
    // 用户会话类
    public static class UserSession {
        private String sessionId;
        private String userId;
        private String ipAddress;
        private long createdAt;
        private long expiresAt;
        private String status; // active, invalidated
        
        public UserSession(String sessionId, String userId, String ipAddress, long createdAt, long expiresAt, String status) {
            this.sessionId = sessionId;
            this.userId = userId;
            this.ipAddress = ipAddress;
            this.createdAt = createdAt;
            this.expiresAt = expiresAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getExpiresAt() { return expiresAt; }
        public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // API密钥类
    public static class ApiKey {
        private String key;
        private String userId;
        private String description;
        private long createdAt;
        private long expiresAt;
        private String status; // active, revoked
        
        public ApiKey(String key, String userId, String description, long createdAt, long expiresAt, String status) {
            this.key = key;
            this.userId = userId;
            this.description = description;
            this.createdAt = createdAt;
            this.expiresAt = expiresAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getExpiresAt() { return expiresAt; }
        public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // 安全审计日志类
    public static class SecurityAuditLog {
        private String id;
        private String eventType;
        private String userId;
        private String description;
        private long timestamp;
        private String status; // active, archived
        
        public SecurityAuditLog(String id, String eventType, String userId, String description, long timestamp, String status) {
            this.id = id;
            this.eventType = eventType;
            this.userId = userId;
            this.description = description;
            this.timestamp = timestamp;
            this.status = status;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}