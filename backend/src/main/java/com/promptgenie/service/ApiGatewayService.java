package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ApiGatewayService {
    
    private final Map<String, ApiKey> apiKeys = new ConcurrentHashMap<>();
    private final Map<String, ApiEndpoint> apiEndpoints = new ConcurrentHashMap<>();
    private final Map<String, ApiLog> apiLogs = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> qpsCounters = new ConcurrentHashMap<>();
    
    // 初始化API网关服务
    public void init() {
        // 初始化默认API端点
        initDefaultEndpoints();
    }
    
    // 初始化默认API端点
    private void initDefaultEndpoints() {
        // 这里可以初始化默认的API端点
    }
    
    // 生成API Key
    public ApiKey generateApiKey(String keyId, String userId, int qpsLimit) {
        // 生成随机密钥
        String key = generateRandomKey();
        
        ApiKey apiKey = new ApiKey(
            keyId,
            key,
            userId,
            qpsLimit,
            "active",
            System.currentTimeMillis()
        );
        apiKeys.put(keyId, apiKey);
        
        // 初始化QPS计数器
        qpsCounters.put(keyId, new AtomicInteger(0));
        
        return apiKey;
    }
    
    // 生成随机密钥
    private String generateRandomKey() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(32);
        Random random = new Random();
        for (int i = 0; i < 32; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
    
    // 废弃API Key
    public void revokeApiKey(String keyId) {
        ApiKey apiKey = apiKeys.get(keyId);
        if (apiKey != null) {
            apiKey.setStatus("revoked");
            apiKey.setRevokedAt(System.currentTimeMillis());
            
            // 移除QPS计数器
            qpsCounters.remove(keyId);
        }
    }
    
    // 为Prompt创建API端点
    public ApiEndpoint createPromptApi(String endpointId, String promptId, String userId) {
        // 生成API URL
        String apiUrl = "/api/v1/run/" + promptId;
        
        ApiEndpoint endpoint = new ApiEndpoint(
            endpointId,
            "prompt",
            promptId,
            apiUrl,
            userId,
            System.currentTimeMillis()
        );
        apiEndpoints.put(endpointId, endpoint);
        
        return endpoint;
    }
    
    // 调用API
    public ApiResponse callApi(String apiUrl, Map<String, Object> params, String apiKey) {
        // 验证API Key
        ApiKey key = validateApiKey(apiKey);
        if (key == null) {
            return new ApiResponse(401, "Invalid API Key", null);
        }
        
        // 检查QPS限制
        if (!checkQpsLimit(key.getId())) {
            return new ApiResponse(429, "QPS limit exceeded", null);
        }
        
        // 查找API端点
        ApiEndpoint endpoint = findEndpointByUrl(apiUrl);
        if (endpoint == null) {
            return new ApiResponse(404, "API endpoint not found", null);
        }
        
        // 执行API调用
        try {
            Object result = executeApiCall(endpoint, params);
            
            // 记录API日志
            recordApiLog(endpoint.getId(), apiKey, params, result, 200, null, System.currentTimeMillis());
            
            return new ApiResponse(200, "Success", result);
        } catch (Exception e) {
            // 记录错误日志
            recordApiLog(endpoint.getId(), apiKey, params, null, 500, e.getMessage(), System.currentTimeMillis());
            
            return new ApiResponse(500, "Internal server error", null);
        }
    }
    
    // 验证API Key
    private ApiKey validateApiKey(String apiKey) {
        for (ApiKey key : apiKeys.values()) {
            if (apiKey.equals(key.getKey()) && "active".equals(key.getStatus())) {
                return key;
            }
        }
        return null;
    }
    
    // 检查QPS限制
    private boolean checkQpsLimit(String keyId) {
        AtomicInteger counter = qpsCounters.get(keyId);
        if (counter == null) {
            return false;
        }
        
        ApiKey key = apiKeys.get(keyId);
        if (key == null) {
            return false;
        }
        
        int currentCount = counter.incrementAndGet();
        if (currentCount > key.getQpsLimit()) {
            return false;
        }
        
        // 重置计数器（这里简化处理，实际应该按时间窗口重置）
        new Thread(() -> {
            try {
                Thread.sleep(1000);
                counter.decrementAndGet();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
        
        return true;
    }
    
    // 根据URL查找API端点
    private ApiEndpoint findEndpointByUrl(String apiUrl) {
        for (ApiEndpoint endpoint : apiEndpoints.values()) {
            if (apiUrl.equals(endpoint.getApiUrl())) {
                return endpoint;
            }
        }
        return null;
    }
    
    // 执行API调用
    private Object executeApiCall(ApiEndpoint endpoint, Map<String, Object> params) {
        // 这里简化处理，实际应该根据endpoint类型执行相应的操作
        return Map.of(
            "promptId", endpoint.getResourceId(),
            "params", params,
            "result", "API executed successfully"
        );
    }
    
    // 记录API日志
    private void recordApiLog(String endpointId, String apiKey, Map<String, Object> params, Object result, int statusCode, String error, long responseTime) {
        String logId = "log-" + System.currentTimeMillis();
        ApiLog log = new ApiLog(
            logId,
            endpointId,
            apiKey,
            params,
            result,
            statusCode,
            error,
            responseTime,
            System.currentTimeMillis()
        );
        apiLogs.put(logId, log);
    }
    
    // 获取API调用统计
    public ApiStats getApiStats(String endpointId, long startTime, long endTime) {
        int totalCalls = 0;
        int successCalls = 0;
        int errorCalls = 0;
        long totalResponseTime = 0;
        int totalTokens = 0;
        
        for (ApiLog log : apiLogs.values()) {
            if (endpointId.equals(log.getEndpointId()) && log.getTimestamp() >= startTime && log.getTimestamp() <= endTime) {
                totalCalls++;
                totalResponseTime += log.getResponseTime();
                
                if (log.getStatusCode() >= 200 && log.getStatusCode() < 300) {
                    successCalls++;
                } else {
                    errorCalls++;
                }
                
                // 模拟Token消耗
                totalTokens += 10; // 假设每次调用消耗10个Token
            }
        }
        
        double successRate = totalCalls > 0 ? (double) successCalls / totalCalls : 0;
        double averageResponseTime = totalCalls > 0 ? (double) totalResponseTime / totalCalls : 0;
        
        return new ApiStats(
            endpointId,
            totalCalls,
            successCalls,
            errorCalls,
            successRate,
            averageResponseTime,
            totalTokens,
            startTime,
            endTime
        );
    }
    
    // 获取API Key列表
    public List<ApiKey> getApiKeys(String userId) {
        List<ApiKey> userKeys = new ArrayList<>();
        for (ApiKey key : apiKeys.values()) {
            if (userId.equals(key.getUserId())) {
                userKeys.add(key);
            }
        }
        return userKeys;
    }
    
    // 获取API端点列表
    public List<ApiEndpoint> getApiEndpoints(String userId) {
        List<ApiEndpoint> userEndpoints = new ArrayList<>();
        for (ApiEndpoint endpoint : apiEndpoints.values()) {
            if (userId.equals(endpoint.getCreatorId())) {
                userEndpoints.add(endpoint);
            }
        }
        return userEndpoints;
    }
    
    // API Key类
    public static class ApiKey {
        private String id;
        private String key;
        private String userId;
        private int qpsLimit;
        private String status; // active, revoked
        private long createdAt;
        private long revokedAt;
        
        public ApiKey(String id, String key, String userId, int qpsLimit, String status, long createdAt) {
            this.id = id;
            this.key = key;
            this.userId = userId;
            this.qpsLimit = qpsLimit;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public int getQpsLimit() { return qpsLimit; }
        public void setQpsLimit(int qpsLimit) { this.qpsLimit = qpsLimit; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getRevokedAt() { return revokedAt; }
        public void setRevokedAt(long revokedAt) { this.revokedAt = revokedAt; }
    }
    
    // API端点类
    public static class ApiEndpoint {
        private String id;
        private String type; // prompt, agent, workflow
        private String resourceId;
        private String apiUrl;
        private String creatorId;
        private long createdAt;
        
        public ApiEndpoint(String id, String type, String resourceId, String apiUrl, String creatorId, long createdAt) {
            this.id = id;
            this.type = type;
            this.resourceId = resourceId;
            this.apiUrl = apiUrl;
            this.creatorId = creatorId;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getResourceId() { return resourceId; }
        public void setResourceId(String resourceId) { this.resourceId = resourceId; }
        public String getApiUrl() { return apiUrl; }
        public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }
        public String getCreatorId() { return creatorId; }
        public void setCreatorId(String creatorId) { this.creatorId = creatorId; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // API日志类
    public static class ApiLog {
        private String id;
        private String endpointId;
        private String apiKey;
        private Map<String, Object> params;
        private Object result;
        private int statusCode;
        private String error;
        private long responseTime;
        private long timestamp;
        
        public ApiLog(String id, String endpointId, String apiKey, Map<String, Object> params, Object result, int statusCode, String error, long responseTime, long timestamp) {
            this.id = id;
            this.endpointId = endpointId;
            this.apiKey = apiKey;
            this.params = params;
            this.result = result;
            this.statusCode = statusCode;
            this.error = error;
            this.responseTime = responseTime;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getEndpointId() { return endpointId; }
        public void setEndpointId(String endpointId) { this.endpointId = endpointId; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public Map<String, Object> getParams() { return params; }
        public void setParams(Map<String, Object> params) { this.params = params; }
        public Object getResult() { return result; }
        public void setResult(Object result) { this.result = result; }
        public int getStatusCode() { return statusCode; }
        public void setStatusCode(int statusCode) { this.statusCode = statusCode; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public long getResponseTime() { return responseTime; }
        public void setResponseTime(long responseTime) { this.responseTime = responseTime; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    // API响应类
    public static class ApiResponse {
        private int statusCode;
        private String message;
        private Object data;
        
        public ApiResponse(int statusCode, String message, Object data) {
            this.statusCode = statusCode;
            this.message = message;
            this.data = data;
        }
        
        // Getters and setters
        public int getStatusCode() { return statusCode; }
        public void setStatusCode(int statusCode) { this.statusCode = statusCode; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
    }
    
    // API统计类
    public static class ApiStats {
        private String endpointId;
        private int totalCalls;
        private int successCalls;
        private int errorCalls;
        private double successRate;
        private double averageResponseTime;
        private int totalTokens;
        private long startTime;
        private long endTime;
        
        public ApiStats(String endpointId, int totalCalls, int successCalls, int errorCalls, double successRate, double averageResponseTime, int totalTokens, long startTime, long endTime) {
            this.endpointId = endpointId;
            this.totalCalls = totalCalls;
            this.successCalls = successCalls;
            this.errorCalls = errorCalls;
            this.successRate = successRate;
            this.averageResponseTime = averageResponseTime;
            this.totalTokens = totalTokens;
            this.startTime = startTime;
            this.endTime = endTime;
        }
        
        // Getters and setters
        public String getEndpointId() { return endpointId; }
        public void setEndpointId(String endpointId) { this.endpointId = endpointId; }
        public int getTotalCalls() { return totalCalls; }
        public void setTotalCalls(int totalCalls) { this.totalCalls = totalCalls; }
        public int getSuccessCalls() { return successCalls; }
        public void setSuccessCalls(int successCalls) { this.successCalls = successCalls; }
        public int getErrorCalls() { return errorCalls; }
        public void setErrorCalls(int errorCalls) { this.errorCalls = errorCalls; }
        public double getSuccessRate() { return successRate; }
        public void setSuccessRate(double successRate) { this.successRate = successRate; }
        public double getAverageResponseTime() { return averageResponseTime; }
        public void setAverageResponseTime(double averageResponseTime) { this.averageResponseTime = averageResponseTime; }
        public int getTotalTokens() { return totalTokens; }
        public void setTotalTokens(int totalTokens) { this.totalTokens = totalTokens; }
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public long getEndTime() { return endTime; }
        public void setEndTime(long endTime) { this.endTime = endTime; }
    }
}