package com.promptgenie.service.edge;

import java.security.KeyPair;
import java.util.Map;

public interface SecurityService {
    /**
     * 初始化安全服务
     */
    void initialize();

    /**
     * 生成密钥对
     * @return 密钥对
     */
    KeyPair generateKeyPair();

    /**
     * 加密数据
     * @param data 待加密数据
     * @param publicKey 公钥
     * @return 加密后的数据
     */
    byte[] encrypt(byte[] data, byte[] publicKey);

    /**
     * 解密数据
     * @param encryptedData 加密数据
     * @param privateKey 私钥
     * @return 解密后的数据
     */
    byte[] decrypt(byte[] encryptedData, byte[] privateKey);

    /**
     * 签名数据
     * @param data 待签名数据
     * @param privateKey 私钥
     * @return 签名
     */
    byte[] sign(byte[] data, byte[] privateKey);

    /**
     * 验证签名
     * @param data 原始数据
     * @param signature 签名
     * @param publicKey 公钥
     * @return 是否验证通过
     */
    boolean verify(byte[] data, byte[] signature, byte[] publicKey);

    /**
     * 设备认证
     * @param deviceId 设备ID
     * @param token 认证令牌
     * @return 是否认证通过
     */
    boolean authenticateDevice(String deviceId, String token);

    /**
     * 生成设备认证令牌
     * @param deviceId 设备ID
     * @param deviceInfo 设备信息
     * @return 认证令牌
     */
    String generateDeviceToken(String deviceId, Map<String, Object> deviceInfo);

    /**
     * 数据脱敏
     * @param data 原始数据
     * @param sensitiveFields 敏感字段列表
     * @return 脱敏后的数据
     */
    Map<String, Object> maskSensitiveData(Map<String, Object> data, String[] sensitiveFields);

    /**
     * 检查权限
     * @param deviceId 设备ID
     * @param action 操作
     * @param resource 资源
     * @return 是否有权限
     */
    boolean checkPermission(String deviceId, String action, String resource);

    /**
     * 关闭安全服务
     */
    void shutdown();
}