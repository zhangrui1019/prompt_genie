package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ExtensionService {
    
    private final Map<String, Extension> extensions = new ConcurrentHashMap<>();
    private final Map<String, ServiceInstance> services = new ConcurrentHashMap<>();
    
    // 初始化扩展服务
    public void init() {
        // 初始化默认插件
        initDefaultExtensions();
    }
    
    // 初始化默认插件
    private void initDefaultExtensions() {
        // 添加默认的插件
        registerExtension(new Extension(
            "ai-model",
            "AI Model Extension",
            "v1.0",
            "Provides AI model management functionality",
            "active",
            System.currentTimeMillis()
        ));
        
        registerExtension(new Extension(
            "analytics",
            "Analytics Extension",
            "v1.0",
            "Provides data analytics functionality",
            "active",
            System.currentTimeMillis()
        ));
        
        registerExtension(new Extension(
            "security",
            "Security Extension",
            "v1.0",
            "Provides security functionality",
            "active",
            System.currentTimeMillis()
        ));
        
        registerExtension(new Extension(
            "localization",
            "Localization Extension",
            "v1.0",
            "Provides localization functionality",
            "active",
            System.currentTimeMillis()
        ));
        
        registerExtension(new Extension(
            "collaboration",
            "Collaboration Extension",
            "v1.0",
            "Provides real-time collaboration functionality",
            "active",
            System.currentTimeMillis()
        ));
    }
    
    // 注册插件
    public void registerExtension(Extension extension) {
        extensions.put(extension.getId(), extension);
    }
    
    // 卸载插件
    public void unregisterExtension(String extensionId) {
        extensions.remove(extensionId);
    }
    
    // 获取插件
    public Extension getExtension(String extensionId) {
        return extensions.get(extensionId);
    }
    
    // 获取所有插件
    public List<Extension> getAllExtensions() {
        return new ArrayList<>(extensions.values());
    }
    
    // 激活插件
    public void activateExtension(String extensionId) {
        Extension extension = extensions.get(extensionId);
        if (extension != null) {
            extension.setStatus("active");
        }
    }
    
    // 停用插件
    public void deactivateExtension(String extensionId) {
        Extension extension = extensions.get(extensionId);
        if (extension != null) {
            extension.setStatus("inactive");
        }
    }
    
    // 注册服务实例
    public void registerService(ServiceInstance service) {
        services.put(service.getId(), service);
    }
    
    // 注销服务实例
    public void unregisterService(String serviceId) {
        services.remove(serviceId);
    }
    
    // 获取服务实例
    public ServiceInstance getService(String serviceId) {
        return services.get(serviceId);
    }
    
    // 获取所有服务实例
    public List<ServiceInstance> getAllServices() {
        return new ArrayList<>(services.values());
    }
    
    // 发现服务
    public List<ServiceInstance> discoverServices(String serviceType) {
        return services.values().stream()
            .filter(service -> serviceType.equals(service.getType()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 健康检查
    public Map<String, String> healthCheck() {
        Map<String, String> healthStatus = new HashMap<>();
        
        // 检查插件健康状态
        for (Extension extension : extensions.values()) {
            healthStatus.put("extension_" + extension.getId(), extension.getStatus());
        }
        
        // 检查服务健康状态
        for (ServiceInstance service : services.values()) {
            healthStatus.put("service_" + service.getId(), service.getStatus());
        }
        
        return healthStatus;
    }
    
    // 插件类
    public static class Extension {
        private String id;
        private String name;
        private String version;
        private String description;
        private String status; // active, inactive, error
        private long registeredAt;
        private long lastUpdatedAt;
        
        public Extension(String id, String name, String version, String description, String status, long registeredAt) {
            this.id = id;
            this.name = name;
            this.version = version;
            this.description = description;
            this.status = status;
            this.registeredAt = registeredAt;
            this.lastUpdatedAt = registeredAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { 
            this.status = status;
            this.lastUpdatedAt = System.currentTimeMillis();
        }
        public long getRegisteredAt() { return registeredAt; }
        public void setRegisteredAt(long registeredAt) { this.registeredAt = registeredAt; }
        public long getLastUpdatedAt() { return lastUpdatedAt; }
        public void setLastUpdatedAt(long lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
    }
    
    // 服务实例类
    public static class ServiceInstance {
        private String id;
        private String name;
        private String type;
        private String url;
        private String status; // up, down, unknown
        private long registeredAt;
        private long lastHeartbeatAt;
        
        public ServiceInstance(String id, String name, String type, String url, String status, long registeredAt) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.url = url;
            this.status = status;
            this.registeredAt = registeredAt;
            this.lastHeartbeatAt = registeredAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getRegisteredAt() { return registeredAt; }
        public void setRegisteredAt(long registeredAt) { this.registeredAt = registeredAt; }
        public long getLastHeartbeatAt() { return lastHeartbeatAt; }
        public void setLastHeartbeatAt(long lastHeartbeatAt) { this.lastHeartbeatAt = lastHeartbeatAt; }
        
        // 更新心跳
        public void updateHeartbeat() {
            this.lastHeartbeatAt = System.currentTimeMillis();
            this.status = "up";
        }
    }
}