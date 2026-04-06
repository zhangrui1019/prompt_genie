package com.promptgenie.service.edge;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SecurityServiceImpl implements SecurityService {

    private final Map<String, String> deviceTokens = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Boolean>> permissions = new ConcurrentHashMap<>();
    private KeyPair keyPair;
    private SecretKey secretKey;

    @Override
    public void initialize() {
        try {
            // 生成RSA密钥对
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            keyPair = keyPairGenerator.generateKeyPair();

            // 生成AES密钥
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
            keyGenerator.init(256);
            secretKey = keyGenerator.generateKey();

            System.out.println("SecurityService initialized");
        } catch (Exception e) {
            System.err.println("Failed to initialize SecurityService: " + e.getMessage());
        }
    }

    @Override
    public KeyPair generateKeyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            return keyPairGenerator.generateKeyPair();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate key pair", e);
        }
    }

    @Override
    public byte[] encrypt(byte[] data, byte[] publicKey) {
        try {
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKey);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PublicKey pubKey = keyFactory.generatePublic(keySpec);

            Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
            cipher.init(Cipher.ENCRYPT_MODE, pubKey);
            return cipher.doFinal(data);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt data", e);
        }
    }

    @Override
    public byte[] decrypt(byte[] encryptedData, byte[] privateKey) {
        try {
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKey);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PrivateKey privKey = keyFactory.generatePrivate(keySpec);

            Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
            cipher.init(Cipher.DECRYPT_MODE, privKey);
            return cipher.doFinal(encryptedData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt data", e);
        }
    }

    @Override
    public byte[] sign(byte[] data, byte[] privateKey) {
        try {
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKey);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PrivateKey privKey = keyFactory.generatePrivate(keySpec);

            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initSign(privKey);
            signature.update(data);
            return signature.sign();
        } catch (Exception e) {
            throw new RuntimeException("Failed to sign data", e);
        }
    }

    @Override
    public boolean verify(byte[] data, byte[] signature, byte[] publicKey) {
        try {
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKey);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PublicKey pubKey = keyFactory.generatePublic(keySpec);

            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initVerify(pubKey);
            sig.update(data);
            return sig.verify(signature);
        } catch (Exception e) {
            System.err.println("Failed to verify signature: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean authenticateDevice(String deviceId, String token) {
        String storedToken = deviceTokens.get(deviceId);
        if (storedToken == null) {
            return false;
        }

        try {
            // 验证JWT令牌
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return storedToken.equals(token);
        } catch (Exception e) {
            System.err.println("Failed to authenticate device: " + e.getMessage());
            return false;
        }
    }

    @Override
    public String generateDeviceToken(String deviceId, Map<String, Object> deviceInfo) {
        try {
            // 生成JWT令牌
            String token = Jwts.builder()
                    .setSubject(deviceId)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 30 * 24 * 60 * 60 * 1000)) // 30天过期
                    .setClaims(deviceInfo)
                    .signWith(secretKey, SignatureAlgorithm.HS256)
                    .compact();

            deviceTokens.put(deviceId, token);
            return token;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate device token", e);
        }
    }

    @Override
    public Map<String, Object> maskSensitiveData(Map<String, Object> data, String[] sensitiveFields) {
        Map<String, Object> maskedData = new HashMap<>(data);
        for (String field : sensitiveFields) {
            if (maskedData.containsKey(field)) {
                maskedData.put(field, "***");
            }
        }
        return maskedData;
    }

    @Override
    public boolean checkPermission(String deviceId, String action, String resource) {
        Map<String, Boolean> devicePermissions = permissions.get(deviceId);
        if (devicePermissions == null) {
            return false;
        }
        return devicePermissions.getOrDefault(action + ":" + resource, false);
    }

    @Override
    public void shutdown() {
        deviceTokens.clear();
        permissions.clear();
        System.out.println("SecurityService shutdown");
    }

    /**
     * 添加设备权限
     * @param deviceId 设备ID
     * @param action 操作
     * @param resource 资源
     */
    public void addPermission(String deviceId, String action, String resource) {
        Map<String, Boolean> devicePermissions = permissions.computeIfAbsent(deviceId, k -> new HashMap<>());
        devicePermissions.put(action + ":" + resource, true);
    }

    /**
     * 移除设备权限
     * @param deviceId 设备ID
     * @param action 操作
     * @param resource 资源
     */
    public void removePermission(String deviceId, String action, String resource) {
        Map<String, Boolean> devicePermissions = permissions.get(deviceId);
        if (devicePermissions != null) {
            devicePermissions.remove(action + ":" + resource);
        }
    }
}