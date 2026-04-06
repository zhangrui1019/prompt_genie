package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EdgeSdkService {
    
    private final Map<String, SdkVersion> sdkVersions = new ConcurrentHashMap<>();
    private final Map<String, SdkConfiguration> sdkConfigurations = new ConcurrentHashMap<>();
    private final Map<String, SdkApiEndpoint> sdkApiEndpoints = new ConcurrentHashMap<>();
    private final Map<String, SdkLicense> sdkLicenses = new ConcurrentHashMap<>();
    
    // 初始化端侧SDK服务
    public void init() {
        // 初始化默认SDK版本
        initDefaultSdkVersions();
        
        // 初始化默认API端点
        initDefaultApiEndpoints();
    }
    
    // 初始化默认SDK版本
    private void initDefaultSdkVersions() {
        // 创建Android SDK版本
        SdkVersion androidSdk = new SdkVersion(
            "android-1.0.0",
            "Android SDK",
            "1.0.0",
            "android",
            "https://download.promptgenie.com/sdk/android/promptgenie-android-1.0.0.aar",
            10485760, // 10MB
            System.currentTimeMillis()
        );
        sdkVersions.put(androidSdk.getId(), androidSdk);
        
        // 创建iOS SDK版本
        SdkVersion iosSdk = new SdkVersion(
            "ios-1.0.0",
            "iOS SDK",
            "1.0.0",
            "ios",
            "https://download.promptgenie.com/sdk/ios/promptgenie-ios-1.0.0.framework",
            15728640, // 15MB
            System.currentTimeMillis()
        );
        sdkVersions.put(iosSdk.getId(), iosSdk);
    }
    
    // 初始化默认API端点
    private void initDefaultApiEndpoints() {
        // 创建模型管理API端点
        SdkApiEndpoint modelEndpoint = new SdkApiEndpoint(
            "model-management",
            "Model Management",
            "/api/v1/sdk/models",
            "POST",
            Arrays.asList("GET", "POST", "PUT", "DELETE"),
            System.currentTimeMillis()
        );
        sdkApiEndpoints.put(modelEndpoint.getId(), modelEndpoint);
        
        // 创建推理API端点
        SdkApiEndpoint inferenceEndpoint = new SdkApiEndpoint(
            "inference",
            "Inference",
            "/api/v1/sdk/inference",
            "POST",
            Arrays.asList("POST"),
            System.currentTimeMillis()
        );
        sdkApiEndpoints.put(inferenceEndpoint.getId(), inferenceEndpoint);
        
        // 创建设备管理API端点
        SdkApiEndpoint deviceEndpoint = new SdkApiEndpoint(
            "device-management",
            "Device Management",
            "/api/v1/sdk/devices",
            "GET",
            Arrays.asList("GET", "POST", "PUT"),
            System.currentTimeMillis()
        );
        sdkApiEndpoints.put(deviceEndpoint.getId(), deviceEndpoint);
    }
    
    // 获取SDK版本列表
    public List<SdkVersion> getSdkVersions() {
        return new ArrayList<>(sdkVersions.values());
    }
    
    // 获取特定平台的SDK版本
    public List<SdkVersion> getSdkVersionsByPlatform(String platform) {
        return sdkVersions.values().stream()
            .filter(version -> platform.equals(version.getPlatform()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 获取SDK配置
    public SdkConfiguration getSdkConfiguration(String configId) {
        return sdkConfigurations.get(configId);
    }
    
    // 创建SDK配置
    public SdkConfiguration createSdkConfiguration(String configId, String name, String platform, Map<String, Object> parameters) {
        SdkConfiguration config = new SdkConfiguration(
            configId,
            name,
            platform,
            parameters,
            System.currentTimeMillis()
        );
        sdkConfigurations.put(configId, config);
        return config;
    }
    
    // 获取API端点列表
    public List<SdkApiEndpoint> getApiEndpoints() {
        return new ArrayList<>(sdkApiEndpoints.values());
    }
    
    // 生成SDK许可证
    public SdkLicense generateSdkLicense(String licenseId, String deviceId, String platform, String sdkVersion, long expirationTime) {
        SdkLicense license = new SdkLicense(
            licenseId,
            deviceId,
            platform,
            sdkVersion,
            generateLicenseKey(),
            expirationTime,
            "active",
            System.currentTimeMillis()
        );
        sdkLicenses.put(licenseId, license);
        return license;
    }
    
    // 生成许可证密钥
    private String generateLicenseKey() {
        return UUID.randomUUID().toString().toUpperCase().replace("-", "");
    }
    
    // 验证SDK许可证
    public boolean validateSdkLicense(String licenseKey) {
        for (SdkLicense license : sdkLicenses.values()) {
            if (licenseKey.equals(license.getLicenseKey()) && "active".equals(license.getStatus())) {
                // 检查是否过期
                return System.currentTimeMillis() < license.getExpirationTime();
            }
        }
        return false;
    }
    
    // 吊销SDK许可证
    public void revokeSdkLicense(String licenseId) {
        SdkLicense license = sdkLicenses.get(licenseId);
        if (license != null) {
            license.setStatus("revoked");
        }
    }
    
    // 获取SDK使用统计
    public SdkUsageStats getSdkUsageStats(String deviceId) {
        // 模拟使用统计
        Map<String, Double> metrics = new HashMap<>();
        metrics.put("model_load_time_ms", 150.0 + Math.random() * 50.0);
        metrics.put("inference_time_ms", 50.0 + Math.random() * 30.0);
        metrics.put("memory_usage_mb", 300.0 + Math.random() * 100.0);
        metrics.put("battery_usage_percent", 5.0 + Math.random() * 3.0);
        
        return new SdkUsageStats(
            "stats-" + deviceId + "-" + System.currentTimeMillis(),
            deviceId,
            metrics,
            System.currentTimeMillis()
        );
    }
    
    // 注册SDK设备
    public SdkDevice registerSdkDevice(String deviceId, String deviceType, String platform, Map<String, Object> deviceInfo) {
        return new SdkDevice(
            deviceId,
            deviceType,
            platform,
            deviceInfo,
            System.currentTimeMillis()
        );
    }
    
    // SDK版本类
    public static class SdkVersion {
        private String id;
        private String name;
        private String version;
        private String platform; // android, ios
        private String downloadUrl;
        private long fileSize; // in bytes
        private long createdAt;
        
        public SdkVersion(String id, String name, String version, String platform, String downloadUrl, long fileSize, long createdAt) {
            this.id = id;
            this.name = name;
            this.version = version;
            this.platform = platform;
            this.downloadUrl = downloadUrl;
            this.fileSize = fileSize;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }
        public String getDownloadUrl() { return downloadUrl; }
        public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // SDK配置类
    public static class SdkConfiguration {
        private String id;
        private String name;
        private String platform;
        private Map<String, Object> parameters;
        private long createdAt;
        
        public SdkConfiguration(String id, String name, String platform, Map<String, Object> parameters, long createdAt) {
            this.id = id;
            this.name = name;
            this.platform = platform;
            this.parameters = parameters;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }
        public Map<String, Object> getParameters() { return parameters; }
        public void setParameters(Map<String, Object> parameters) { this.parameters = parameters; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // SDK API端点类
    public static class SdkApiEndpoint {
        private String id;
        private String name;
        private String endpoint;
        private String method;
        private List<String> supportedMethods;
        private long createdAt;
        
        public SdkApiEndpoint(String id, String name, String endpoint, String method, List<String> supportedMethods, long createdAt) {
            this.id = id;
            this.name = name;
            this.endpoint = endpoint;
            this.method = method;
            this.supportedMethods = supportedMethods;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public List<String> getSupportedMethods() { return supportedMethods; }
        public void setSupportedMethods(List<String> supportedMethods) { this.supportedMethods = supportedMethods; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // SDK许可证类
    public static class SdkLicense {
        private String id;
        private String deviceId;
        private String platform;
        private String sdkVersion;
        private String licenseKey;
        private long expirationTime;
        private String status; // active, revoked, expired
        private long createdAt;
        
        public SdkLicense(String id, String deviceId, String platform, String sdkVersion, String licenseKey, long expirationTime, String status, long createdAt) {
            this.id = id;
            this.deviceId = deviceId;
            this.platform = platform;
            this.sdkVersion = sdkVersion;
            this.licenseKey = licenseKey;
            this.expirationTime = expirationTime;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDeviceId() { return deviceId; }
        public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }
        public String getSdkVersion() { return sdkVersion; }
        public void setSdkVersion(String sdkVersion) { this.sdkVersion = sdkVersion; }
        public String getLicenseKey() { return licenseKey; }
        public void setLicenseKey(String licenseKey) { this.licenseKey = licenseKey; }
        public long getExpirationTime() { return expirationTime; }
        public void setExpirationTime(long expirationTime) { this.expirationTime = expirationTime; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // SDK使用统计类
    public static class SdkUsageStats {
        private String id;
        private String deviceId;
        private Map<String, Double> metrics;
        private long timestamp;
        
        public SdkUsageStats(String id, String deviceId, Map<String, Double> metrics, long timestamp) {
            this.id = id;
            this.deviceId = deviceId;
            this.metrics = metrics;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDeviceId() { return deviceId; }
        public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
        public Map<String, Double> getMetrics() { return metrics; }
        public void setMetrics(Map<String, Double> metrics) { this.metrics = metrics; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    // SDK设备类
    public static class SdkDevice {
        private String id;
        private String deviceType;
        private String platform;
        private Map<String, Object> deviceInfo;
        private long registeredAt;
        
        public SdkDevice(String id, String deviceType, String platform, Map<String, Object> deviceInfo, long registeredAt) {
            this.id = id;
            this.deviceType = deviceType;
            this.platform = platform;
            this.deviceInfo = deviceInfo;
            this.registeredAt = registeredAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDeviceType() { return deviceType; }
        public void setDeviceType(String deviceType) { this.deviceType = deviceType; }
        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }
        public Map<String, Object> getDeviceInfo() { return deviceInfo; }
        public void setDeviceInfo(Map<String, Object> deviceInfo) { this.deviceInfo = deviceInfo; }
        public long getRegisteredAt() { return registeredAt; }
        public void setRegisteredAt(long registeredAt) { this.registeredAt = registeredAt; }
    }
}