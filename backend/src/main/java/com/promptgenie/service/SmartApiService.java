package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SmartApiService {
    
    private final Map<String, Api> apis = new ConcurrentHashMap<>();
    private final Map<String, List<ApiVersion>> apiVersions = new ConcurrentHashMap<>();
    private final Map<String, List<String>> apiAccessControl = new ConcurrentHashMap<>();
    private final Map<String, List<ApiUsage>> apiUsages = new ConcurrentHashMap<>();
    
    // 初始化智能API服务
    public void init() {
        // 初始化默认API
        initDefaultApis();
    }
    
    // 初始化默认API
    private void initDefaultApis() {
        // 创建默认API
        Api modelApi = new Api(
            "model-api",
            "Model API",
            "API for managing AI models",
            "/api/models",
            "REST",
            System.currentTimeMillis(),
            "active"
        );
        apis.put(modelApi.getId(), modelApi);
        
        // 创建API版本
        List<ApiVersion> modelApiVersions = new ArrayList<>();
        modelApiVersions.add(new ApiVersion(
            "model-api-v1",
            "model-api",
            "1.0",
            "Initial version",
            "https://api.example.com/v1/models",
            System.currentTimeMillis(),
            "active"
        ));
        apiVersions.put("model-api", modelApiVersions);
        
        // 设置访问控制
        List<String> modelApiAccess = Arrays.asList("admin", "user");
        apiAccessControl.put("model-api", modelApiAccess);
        
        // 创建另一个默认API
        Api contentApi = new Api(
            "content-api",
            "Content API",
            "API for managing content",
            "/api/content",
            "REST",
            System.currentTimeMillis(),
            "active"
        );
        apis.put(contentApi.getId(), contentApi);
        
        // 创建API版本
        List<ApiVersion> contentApiVersions = new ArrayList<>();
        contentApiVersions.add(new ApiVersion(
            "content-api-v1",
            "content-api",
            "1.0",
            "Initial version",
            "https://api.example.com/v1/content",
            System.currentTimeMillis(),
            "active"
        ));
        apiVersions.put("content-api", contentApiVersions);
        
        // 设置访问控制
        List<String> contentApiAccess = Arrays.asList("admin", "user");
        apiAccessControl.put("content-api", contentApiAccess);
    }
    
    // 创建API
    public Api createApi(String id, String name, String description, String endpoint, String type) {
        Api api = new Api(
            id,
            name,
            description,
            endpoint,
            type,
            System.currentTimeMillis(),
            "active"
        );
        apis.put(id, api);
        
        // 创建初始版本
        createApiVersion(id, "1.0", "Initial version", endpoint);
        
        return api;
    }
    
    // 更新API
    public Api updateApi(String id, String name, String description, String endpoint, String type) {
        Api api = apis.get(id);
        if (api != null) {
            if (name != null) api.setName(name);
            if (description != null) api.setDescription(description);
            if (endpoint != null) api.setEndpoint(endpoint);
            if (type != null) api.setType(type);
            api.setLastUpdatedAt(System.currentTimeMillis());
        }
        return api;
    }
    
    // 删除API
    public void deleteApi(String id) {
        apis.remove(id);
        apiVersions.remove(id);
        apiAccessControl.remove(id);
        apiUsages.remove(id);
    }
    
    // 获取API
    public Api getApi(String id) {
        return apis.get(id);
    }
    
    // 获取所有API
    public List<Api> getAllApis() {
        return new ArrayList<>(apis.values());
    }
    
    // 按状态获取API
    public List<Api> getApisByStatus(String status) {
        return apis.values().stream()
            .filter(api -> status.equals(api.getStatus()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 按类型获取API
    public List<Api> getApisByType(String type) {
        return apis.values().stream()
            .filter(api -> type.equals(api.getType()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 搜索API
    public List<Api> searchApis(String query) {
        return apis.values().stream()
            .filter(api -> 
                api.getName().contains(query) || 
                api.getDescription().contains(query)
            )
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 创建API版本
    public ApiVersion createApiVersion(String apiId, String version, String description, String endpoint) {
        String versionId = apiId + "-v" + version.replace(".", "");
        ApiVersion apiVersion = new ApiVersion(
            versionId,
            apiId,
            version,
            description,
            endpoint,
            System.currentTimeMillis(),
            "active"
        );
        
        List<ApiVersion> versions = apiVersions.computeIfAbsent(apiId, k -> new ArrayList<>());
        versions.add(apiVersion);
        
        return apiVersion;
    }
    
    // 获取API版本
    public List<ApiVersion> getApiVersions(String apiId) {
        return apiVersions.getOrDefault(apiId, Collections.emptyList());
    }
    
    // 激活API版本
    public void activateApiVersion(String apiId, String versionId) {
        List<ApiVersion> versions = apiVersions.get(apiId);
        if (versions != null) {
            for (ApiVersion version : versions) {
                if (version.getId().equals(versionId)) {
                    version.setStatus("active");
                } else {
                    version.setStatus("inactive");
                }
            }
        }
    }
    
    // 停用API版本
    public void deactivateApiVersion(String apiId, String versionId) {
        List<ApiVersion> versions = apiVersions.get(apiId);
        if (versions != null) {
            for (ApiVersion version : versions) {
                if (version.getId().equals(versionId)) {
                    version.setStatus("inactive");
                }
            }
        }
    }
    
    // 添加访问控制
    public void addAccessControl(String apiId, String role) {
        List<String> roles = apiAccessControl.computeIfAbsent(apiId, k -> new ArrayList<>());
        if (!roles.contains(role)) {
            roles.add(role);
        }
    }
    
    // 移除访问控制
    public void removeAccessControl(String apiId, String role) {
        List<String> roles = apiAccessControl.get(apiId);
        if (roles != null) {
            roles.remove(role);
        }
    }
    
    // 获取访问控制
    public List<String> getAccessControl(String apiId) {
        return apiAccessControl.getOrDefault(apiId, Collections.emptyList());
    }
    
    // 检查访问权限
    public boolean checkAccess(String apiId, String role) {
        List<String> roles = apiAccessControl.getOrDefault(apiId, Collections.emptyList());
        return roles.contains(role);
    }
    
    // 记录API使用
    public void recordApiUsage(String apiId, String userId, String endpoint, long responseTime) {
        ApiUsage usage = new ApiUsage(
            UUID.randomUUID().toString(),
            apiId,
            userId,
            endpoint,
            responseTime,
            System.currentTimeMillis()
        );
        
        List<ApiUsage> usages = apiUsages.computeIfAbsent(apiId, k -> new ArrayList<>());
        usages.add(usage);
        
        // 限制使用记录数量，只保留最近的1000条
        if (usages.size() > 1000) {
            usages.subList(0, usages.size() - 1000).clear();
        }
    }
    
    // 获取API使用记录
    public List<ApiUsage> getApiUsage(String apiId) {
        return apiUsages.getOrDefault(apiId, Collections.emptyList());
    }
    
    // 获取API使用统计
    public ApiUsageStats getApiUsageStats(String apiId, long startTime, long endTime) {
        List<ApiUsage> usages = apiUsages.getOrDefault(apiId, Collections.emptyList());
        List<ApiUsage> filteredUsages = usages.stream()
            .filter(usage -> usage.getTimestamp() >= startTime && usage.getTimestamp() <= endTime)
            .collect(java.util.stream.Collectors.toList());
        
        int totalRequests = filteredUsages.size();
        long totalResponseTime = filteredUsages.stream()
            .mapToLong(ApiUsage::getResponseTime)
            .sum();
        double averageResponseTime = totalRequests > 0 ? (double) totalResponseTime / totalRequests : 0;
        
        // 按用户统计
        Map<String, Integer> userRequests = new HashMap<>();
        for (ApiUsage usage : filteredUsages) {
            userRequests.put(usage.getUserId(), userRequests.getOrDefault(usage.getUserId(), 0) + 1);
        }
        
        // 按端点统计
        Map<String, Integer> endpointRequests = new HashMap<>();
        for (ApiUsage usage : filteredUsages) {
            endpointRequests.put(usage.getEndpoint(), endpointRequests.getOrDefault(usage.getEndpoint(), 0) + 1);
        }
        
        return new ApiUsageStats(
            apiId,
            totalRequests,
            averageResponseTime,
            userRequests,
            endpointRequests,
            startTime,
            endTime
        );
    }
    
    // 更新API状态
    public void updateApiStatus(String apiId, String status) {
        Api api = apis.get(apiId);
        if (api != null) {
            api.setStatus(status);
            api.setLastUpdatedAt(System.currentTimeMillis());
        }
    }
    
    // API类
    public static class Api {
        private String id;
        private String name;
        private String description;
        private String endpoint;
        private String type; // REST, GraphQL, gRPC
        private long createdAt;
        private long lastUpdatedAt;
        private String status; // active, inactive, deprecated
        
        public Api(String id, String name, String description, String endpoint, String type, long createdAt, String status) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.endpoint = endpoint;
            this.type = type;
            this.createdAt = createdAt;
            this.lastUpdatedAt = createdAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getLastUpdatedAt() { return lastUpdatedAt; }
        public void setLastUpdatedAt(long lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // API版本类
    public static class ApiVersion {
        private String id;
        private String apiId;
        private String version;
        private String description;
        private String endpoint;
        private long createdAt;
        private String status; // active, inactive
        
        public ApiVersion(String id, String apiId, String version, String description, String endpoint, long createdAt, String status) {
            this.id = id;
            this.apiId = apiId;
            this.version = version;
            this.description = description;
            this.endpoint = endpoint;
            this.createdAt = createdAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getApiId() { return apiId; }
        public void setApiId(String apiId) { this.apiId = apiId; }
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // API使用类
    public static class ApiUsage {
        private String id;
        private String apiId;
        private String userId;
        private String endpoint;
        private long responseTime; // milliseconds
        private long timestamp;
        
        public ApiUsage(String id, String apiId, String userId, String endpoint, long responseTime, long timestamp) {
            this.id = id;
            this.apiId = apiId;
            this.userId = userId;
            this.endpoint = endpoint;
            this.responseTime = responseTime;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getApiId() { return apiId; }
        public void setApiId(String apiId) { this.apiId = apiId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public long getResponseTime() { return responseTime; }
        public void setResponseTime(long responseTime) { this.responseTime = responseTime; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    // API使用统计类
    public static class ApiUsageStats {
        private String apiId;
        private int totalRequests;
        private double averageResponseTime;
        private Map<String, Integer> userRequests;
        private Map<String, Integer> endpointRequests;
        private long startTime;
        private long endTime;
        
        public ApiUsageStats(String apiId, int totalRequests, double averageResponseTime, Map<String, Integer> userRequests, Map<String, Integer> endpointRequests, long startTime, long endTime) {
            this.apiId = apiId;
            this.totalRequests = totalRequests;
            this.averageResponseTime = averageResponseTime;
            this.userRequests = userRequests;
            this.endpointRequests = endpointRequests;
            this.startTime = startTime;
            this.endTime = endTime;
        }
        
        // Getters and setters
        public String getApiId() { return apiId; }
        public void setApiId(String apiId) { this.apiId = apiId; }
        public int getTotalRequests() { return totalRequests; }
        public void setTotalRequests(int totalRequests) { this.totalRequests = totalRequests; }
        public double getAverageResponseTime() { return averageResponseTime; }
        public void setAverageResponseTime(double averageResponseTime) { this.averageResponseTime = averageResponseTime; }
        public Map<String, Integer> getUserRequests() { return userRequests; }
        public void setUserRequests(Map<String, Integer> userRequests) { this.userRequests = userRequests; }
        public Map<String, Integer> getEndpointRequests() { return endpointRequests; }
        public void setEndpointRequests(Map<String, Integer> endpointRequests) { this.endpointRequests = endpointRequests; }
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public long getEndTime() { return endTime; }
        public void setEndTime(long endTime) { this.endTime = endTime; }
    }
}