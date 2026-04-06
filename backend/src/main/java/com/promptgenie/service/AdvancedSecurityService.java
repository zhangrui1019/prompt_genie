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
public class AdvancedSecurityService {
    
    private final Map<String, SecurityToken> securityTokens = new ConcurrentHashMap<>();
    private final Map<String, UserCredential> userCredentials = new ConcurrentHashMap<>();
    private final List<SecurityAuditLog> auditLogs = new ArrayList<>();
    
    // 密钥管理
    private KeyPair rsaKeyPair;
    private SecretKey aesKey;
    
    // 初始化高级安全服务
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
    
    // 生成安全令牌
    public SecurityToken generateSecurityToken(String userId, String scope) {
        String tokenId = UUID.randomUUID().toString();
        String token = generateToken(32);
        SecurityToken securityToken = new SecurityToken(
            tokenId,
            userId,
            token,
            scope,
            System.currentTimeMillis(),
            System.currentTimeMillis() + 24 * 60 * 60 * 1000, // 24小时过期
            "active"
        );
        securityTokens.put(tokenId, securityToken);
        
        // 记录审计日志
        logAudit("TOKEN_GENERATED", userId, "Generated security token for user: " + userId);
        
        return securityToken;
    }
    
    // 验证安全令牌
    public boolean validateSecurityToken(String token) {
        for (SecurityToken securityToken : securityTokens.values()) {
            if (token.equals(securityToken.getToken()) && "active".equals(securityToken.getStatus())) {
                if (securityToken.getExpiresAt() > System.currentTimeMillis()) {
                    return true;
                } else {
                    // 令牌已过期
                    securityToken.setStatus("expired");
                    return false;
                }
            }
        }
        return false;
    }
    
    // 撤销安全令牌
    public void revokeSecurityToken(String tokenId) {
        SecurityToken securityToken = securityTokens.get(tokenId);
        if (securityToken != null) {
            securityToken.setStatus("revoked");
            
            // 记录审计日志
            logAudit("TOKEN_REVOKED", securityToken.getUserId(), "Revoked security token for user: " + securityToken.getUserId());
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
    
    // 数字签名
    public String sign(String data) throws Exception {
        // 使用RSA签名
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initSign(rsaKeyPair.getPrivate());
        signature.update(data.getBytes(StandardCharsets.UTF_8));
        byte[] signed = signature.sign();
        return Base64.getEncoder().encodeToString(signed);
    }
    
    // 验证数字签名
    public boolean verifySignature(String data, String signature) throws Exception {
        // 使用RSA验证签名
        Signature verifier = Signature.getInstance("SHA256withRSA");
        verifier.initVerify(rsaKeyPair.getPublic());
        verifier.update(data.getBytes(StandardCharsets.UTF_8));
        return verifier.verify(Base64.getDecoder().decode(signature));
    }
    
    // 存储用户凭证
    public void storeUserCredential(String userId, String passwordHash, String salt) {
        UserCredential credential = new UserCredential(
            userId,
            passwordHash,
            salt,
            System.currentTimeMillis()
        );
        userCredentials.put(userId, credential);
    }
    
    // 验证用户凭证
    public boolean verifyUserCredential(String userId, String password) throws Exception {
        UserCredential credential = userCredentials.get(userId);
        if (credential == null) {
            return false;
        }
        
        // 生成密码哈希
        String passwordHash = generatePasswordHash(password, credential.getSalt());
        return passwordHash.equals(credential.getPasswordHash());
    }
    
    // 生成密码哈希
    public String generatePasswordHash(String password, String salt) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest((password + salt).getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hash);
    }
    
    // 生成随机令牌
    private String generateToken(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder token = new StringBuilder(length);
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            token.append(chars.charAt(random.nextInt(chars.length())));
        }
        return token.toString();
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
    
    // 安全扫描
    public SecurityScanResult scanForSecurityIssues() {
        List<SecurityIssue> issues = new ArrayList<>();
        
        // 检查过期令牌
        for (SecurityToken token : securityTokens.values()) {
            if (token.getExpiresAt() < System.currentTimeMillis() && "active".equals(token.getStatus())) {
                issues.add(new SecurityIssue(
                    "EXPIRED_TOKEN",
                    "Expired security token",
                    "Token " + token.getId() + " for user " + token.getUserId() + " has expired",
                    "medium"
                ));
            }
        }
        
        // 检查弱密码（模拟）
        for (UserCredential credential : userCredentials.values()) {
            // 这里应该实现实际的弱密码检查逻辑
            // 为了演示，我们简单添加一个模拟的弱密码警告
            if (credential.getUserId().equals("admin")) {
                issues.add(new SecurityIssue(
                    "WEAK_PASSWORD",
                    "Weak password detected",
                    "User " + credential.getUserId() + " has a weak password",
                    "high"
                ));
            }
        }
        
        return new SecurityScanResult(
            System.currentTimeMillis(),
            issues.size() > 0 ? "issues_found" : "no_issues",
            issues
        );
    }
    
    // 安全令牌类
    public static class SecurityToken {
        private String id;
        private String userId;
        private String token;
        private String scope;
        private long createdAt;
        private long expiresAt;
        private String status; // active, expired, revoked
        
        public SecurityToken(String id, String userId, String token, String scope, long createdAt, long expiresAt, String status) {
            this.id = id;
            this.userId = userId;
            this.token = token;
            this.scope = scope;
            this.createdAt = createdAt;
            this.expiresAt = expiresAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getScope() { return scope; }
        public void setScope(String scope) { this.scope = scope; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getExpiresAt() { return expiresAt; }
        public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // 用户凭证类
    public static class UserCredential {
        private String userId;
        private String passwordHash;
        private String salt;
        private long createdAt;
        
        public UserCredential(String userId, String passwordHash, String salt, long createdAt) {
            this.userId = userId;
            this.passwordHash = passwordHash;
            this.salt = salt;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getPasswordHash() { return passwordHash; }
        public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
        public String getSalt() { return salt; }
        public void setSalt(String salt) { this.salt = salt; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
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
    
    // 安全问题类
    public static class SecurityIssue {
        private String id;
        private String title;
        private String description;
        private String severity; // low, medium, high, critical
        
        public SecurityIssue(String id, String title, String description, String severity) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.severity = severity;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
    }
    
    // 安全扫描结果类
    public static class SecurityScanResult {
        private long scannedAt;
        private String status; // no_issues, issues_found
        private List<SecurityIssue> issues;
        
        public SecurityScanResult(long scannedAt, String status, List<SecurityIssue> issues) {
            this.scannedAt = scannedAt;
            this.status = status;
            this.issues = issues;
        }
        
        // Getters and setters
        public long getScannedAt() { return scannedAt; }
        public void setScannedAt(long scannedAt) { this.scannedAt = scannedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public List<SecurityIssue> getIssues() { return issues; }
        public void setIssues(List<SecurityIssue> issues) { this.issues = issues; }
    }
}