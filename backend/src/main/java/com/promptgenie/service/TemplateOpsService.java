package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TemplateOpsService {
    
    private final Map<String, TemplateAsset> templateAssets = new ConcurrentHashMap<>();
    private final Map<String, OperationPosition> operationPositions = new ConcurrentHashMap<>();
    private final Map<String, Category> categories = new ConcurrentHashMap<>();
    private final Map<String, AuditLog> auditLogs = new ConcurrentHashMap<>();
    private final Map<String, Event> events = new ConcurrentHashMap<>();
    private final Map<String, DashboardMetric> dashboardMetrics = new ConcurrentHashMap<>();
    
    // 初始化模板资产运营服务
    public void init() {
        // 初始化默认分类
        initDefaultCategories();
        
        // 初始化默认运营位
        initDefaultOperationPositions();
    }
    
    // 初始化默认分类
    private void initDefaultCategories() {
        createCategory("marketing", "营销", "Marketing templates");
        createCategory("content", "内容创作", "Content creation templates");
        createCategory("coding", "编程", "Coding templates");
        createCategory("education", "教育", "Education templates");
        createCategory("design", "设计", "Design templates");
    }
    
    // 初始化默认运营位
    private void initDefaultOperationPositions() {
        createOperationPosition("featured", "精选", "Featured templates");
        createOperationPosition("trending", "趋势", "Trending templates");
        createOperationPosition("new", "最新", "New templates");
    }
    
    // 创建分类
    public Category createCategory(String categoryId, String name, String description) {
        Category category = new Category(
            categoryId,
            name,
            description,
            System.currentTimeMillis()
        );
        categories.put(categoryId, category);
        return category;
    }
    
    // 创建运营位
    public OperationPosition createOperationPosition(String positionId, String name, String description) {
        OperationPosition position = new OperationPosition(
            positionId,
            name,
            description,
            System.currentTimeMillis()
        );
        operationPositions.put(positionId, position);
        return position;
    }
    
    // 创建模板资产
    public TemplateAsset createTemplateAsset(String assetId, String name, String description, String categoryId, String creatorId) {
        TemplateAsset asset = new TemplateAsset(
            assetId,
            name,
            description,
            categoryId,
            creatorId,
            "DRAFT", // 初始状态为草稿
            System.currentTimeMillis()
        );
        templateAssets.put(assetId, asset);
        
        // 记录审计日志
        recordAuditLog(assetId, "CREATE", "Created template asset", creatorId);
        
        return asset;
    }
    
    // 更新模板资产状态
    public void updateTemplateAssetStatus(String assetId, String status, String reviewerId, String reason) {
        TemplateAsset asset = templateAssets.get(assetId);
        if (asset != null) {
            String oldStatus = asset.getStatus();
            asset.setStatus(status);
            asset.setUpdatedAt(System.currentTimeMillis());
            
            // 记录审计日志
            recordAuditLog(assetId, "UPDATE_STATUS", "Changed status from " + oldStatus + " to " + status + (reason != null ? " with reason: " + reason : ""), reviewerId);
        }
    }
    
    // 提交模板资产审核
    public void submitTemplateAssetForReview(String assetId, String submitterId) {
        updateTemplateAssetStatus(assetId, "SUBMITTED", submitterId, null);
    }
    
    // 审核模板资产
    public void reviewTemplateAsset(String assetId, boolean approved, String reviewerId, String reason) {
        String status = approved ? "APPROVED" : "REJECTED";
        updateTemplateAssetStatus(assetId, status, reviewerId, reason);
        
        // 如果审核通过，自动发布
        if (approved) {
            publishTemplateAsset(assetId, reviewerId);
        }
    }
    
    // 发布模板资产
    public void publishTemplateAsset(String assetId, String publisherId) {
        updateTemplateAssetStatus(assetId, "PUBLISHED", publisherId, null);
    }
    
    // 下架模板资产
    public void archiveTemplateAsset(String assetId, String archiverId, String reason) {
        updateTemplateAssetStatus(assetId, "ARCHIVED", archiverId, reason);
    }
    
    // 设置模板资产为精选
    public void setTemplateAssetAsFeatured(String assetId, int order, String operatorId) {
        TemplateAsset asset = templateAssets.get(assetId);
        if (asset != null) {
            asset.setFeatured(true);
            asset.setFeaturedOrder(order);
            asset.setUpdatedAt(System.currentTimeMillis());
            
            // 记录审计日志
            recordAuditLog(assetId, "SET_FEATURED", "Set template as featured with order " + order, operatorId);
        }
    }
    
    // 取消模板资产精选
    public void unsetTemplateAssetAsFeatured(String assetId, String operatorId) {
        TemplateAsset asset = templateAssets.get(assetId);
        if (asset != null) {
            asset.setFeatured(false);
            asset.setFeaturedOrder(0);
            asset.setUpdatedAt(System.currentTimeMillis());
            
            // 记录审计日志
            recordAuditLog(assetId, "UNSET_FEATURED", "Unset template as featured", operatorId);
        }
    }
    
    // 记录模板资产事件
    public void recordTemplateEvent(String assetId, String eventName, Map<String, Object> properties, String sessionId, String userId) {
        String eventId = "event-" + System.currentTimeMillis() + "-" + assetId;
        Event event = new Event(
            eventId,
            assetId,
            eventName,
            properties,
            sessionId,
            userId,
            System.currentTimeMillis()
        );
        events.put(eventId, event);
        
        // 更新模板资产的统计数据
        updateTemplateAssetStats(assetId, eventName);
    }
    
    // 更新模板资产统计数据
    private void updateTemplateAssetStats(String assetId, String eventName) {
        TemplateAsset asset = templateAssets.get(assetId);
        if (asset != null) {
            switch (eventName) {
                case "view":
                    asset.setViewCount(asset.getViewCount() + 1);
                    break;
                case "copy":
                    asset.setCopyCount(asset.getCopyCount() + 1);
                    break;
                case "favorite":
                    asset.setFavoriteCount(asset.getFavoriteCount() + 1);
                    break;
                case "fork":
                    asset.setForkCount(asset.getForkCount() + 1);
                    break;
                case "comment":
                    asset.setCommentCount(asset.getCommentCount() + 1);
                    break;
            }
        }
    }
    
    // 记录审计日志
    private void recordAuditLog(String assetId, String action, String description, String operatorId) {
        String logId = "audit-" + System.currentTimeMillis() + "-" + assetId;
        AuditLog log = new AuditLog(
            logId,
            assetId,
            action,
            description,
            operatorId,
            System.currentTimeMillis()
        );
        auditLogs.put(logId, log);
    }
    
    // 获取模板资产列表
    public List<TemplateAsset> getTemplateAssets(String status, String categoryId, String sortBy) {
        List<TemplateAsset> assets = new ArrayList<>();
        
        for (TemplateAsset asset : templateAssets.values()) {
            // 按状态过滤
            if (status != null && !status.equals(asset.getStatus())) {
                continue;
            }
            
            // 按分类过滤
            if (categoryId != null && !categoryId.equals(asset.getCategoryId())) {
                continue;
            }
            
            assets.add(asset);
        }
        
        // 排序
        switch (sortBy) {
            case "latest":
                assets.sort(Comparator.comparingLong(TemplateAsset::getCreatedAt).reversed());
                break;
            case "trending":
                assets.sort(Comparator.comparingLong(TemplateAsset::getViewCount).reversed());
                break;
            case "featured":
                assets.sort((a, b) -> {
                    if (a.isFeatured() && !b.isFeatured()) return -1;
                    if (!a.isFeatured() && b.isFeatured()) return 1;
                    return Integer.compare(a.getFeaturedOrder(), b.getFeaturedOrder());
                });
                break;
        }
        
        return assets;
    }
    
    // 获取模板资产
    public TemplateAsset getTemplateAsset(String assetId) {
        return templateAssets.get(assetId);
    }
    
    // 获取运营位模板
    public List<TemplateAsset> getOperationPositionTemplates(String positionId, int limit) {
        List<TemplateAsset> assets = new ArrayList<>();
        
        for (TemplateAsset asset : templateAssets.values()) {
            if ("PUBLISHED".equals(asset.getStatus())) {
                assets.add(asset);
            }
        }
        
        // 排序
        switch (positionId) {
            case "featured":
                assets.sort((a, b) -> {
                    if (a.isFeatured() && !b.isFeatured()) return -1;
                    if (!a.isFeatured() && b.isFeatured()) return 1;
                    return Integer.compare(a.getFeaturedOrder(), b.getFeaturedOrder());
                });
                break;
            case "trending":
                assets.sort(Comparator.comparingLong(TemplateAsset::getViewCount).reversed());
                break;
            case "new":
                assets.sort(Comparator.comparingLong(TemplateAsset::getCreatedAt).reversed());
                break;
        }
        
        // 限制数量
        if (assets.size() > limit) {
            assets = assets.subList(0, limit);
        }
        
        return assets;
    }
    
    // 生成增长看板数据
    public DashboardMetrics generateDashboardMetrics(long startTime, long endTime) {
        // 统计各种指标
        int totalViews = 0;
        int totalCopies = 0;
        int totalFavorites = 0;
        int totalForks = 0;
        int totalComments = 0;
        int totalUsers = 0;
        
        Set<String> uniqueUsers = new HashSet<>();
        Map<String, Integer> eventCounts = new HashMap<>();
        
        for (Event event : events.values()) {
            if (event.getTimestamp() >= startTime && event.getTimestamp() <= endTime) {
                totalViews += "view".equals(event.getEventName()) ? 1 : 0;
                totalCopies += "copy".equals(event.getEventName()) ? 1 : 0;
                totalFavorites += "favorite".equals(event.getEventName()) ? 1 : 0;
                totalForks += "fork".equals(event.getEventName()) ? 1 : 0;
                totalComments += "comment".equals(event.getEventName()) ? 1 : 0;
                
                if (event.getUserId() != null) {
                    uniqueUsers.add(event.getUserId());
                }
                
                eventCounts.put(event.getEventName(), eventCounts.getOrDefault(event.getEventName(), 0) + 1);
            }
        }
        
        totalUsers = uniqueUsers.size();
        
        // 计算转化率
        double copyRate = totalViews > 0 ? (double) totalCopies / totalViews : 0;
        double favoriteRate = totalViews > 0 ? (double) totalFavorites / totalViews : 0;
        double forkRate = totalViews > 0 ? (double) totalForks / totalViews : 0;
        
        // 创建仪表板指标
        DashboardMetrics metrics = new DashboardMetrics(
            totalViews,
            totalCopies,
            totalFavorites,
            totalForks,
            totalComments,
            totalUsers,
            copyRate,
            favoriteRate,
            forkRate,
            eventCounts,
            startTime,
            endTime
        );
        
        return metrics;
    }
    
    // 模板资产类
    public static class TemplateAsset {
        private String id;
        private String name;
        private String description;
        private String categoryId;
        private String creatorId;
        private String status; // DRAFT, SUBMITTED, APPROVED, REJECTED, PUBLISHED, ARCHIVED
        private boolean featured;
        private int featuredOrder;
        private int viewCount;
        private int copyCount;
        private int favoriteCount;
        private int forkCount;
        private int commentCount;
        private long createdAt;
        private long updatedAt;
        
        public TemplateAsset(String id, String name, String description, String categoryId, String creatorId, String status, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.categoryId = categoryId;
            this.creatorId = creatorId;
            this.status = status;
            this.createdAt = createdAt;
            this.updatedAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategoryId() { return categoryId; }
        public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
        public String getCreatorId() { return creatorId; }
        public void setCreatorId(String creatorId) { this.creatorId = creatorId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public boolean isFeatured() { return featured; }
        public void setFeatured(boolean featured) { this.featured = featured; }
        public int getFeaturedOrder() { return featuredOrder; }
        public void setFeaturedOrder(int featuredOrder) { this.featuredOrder = featuredOrder; }
        public int getViewCount() { return viewCount; }
        public void setViewCount(int viewCount) { this.viewCount = viewCount; }
        public int getCopyCount() { return copyCount; }
        public void setCopyCount(int copyCount) { this.copyCount = copyCount; }
        public int getFavoriteCount() { return favoriteCount; }
        public void setFavoriteCount(int favoriteCount) { this.favoriteCount = favoriteCount; }
        public int getForkCount() { return forkCount; }
        public void setForkCount(int forkCount) { this.forkCount = forkCount; }
        public int getCommentCount() { return commentCount; }
        public void setCommentCount(int commentCount) { this.commentCount = commentCount; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }
    }
    
    // 分类类
    public static class Category {
        private String id;
        private String name;
        private String description;
        private long createdAt;
        
        public Category(String id, String name, String description, long createdAt) {
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
    
    // 运营位类
    public static class OperationPosition {
        private String id;
        private String name;
        private String description;
        private long createdAt;
        
        public OperationPosition(String id, String name, String description, long createdAt) {
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
    
    // 审计日志类
    public static class AuditLog {
        private String id;
        private String assetId;
        private String action;
        private String description;
        private String operatorId;
        private long timestamp;
        
        public AuditLog(String id, String assetId, String action, String description, String operatorId, long timestamp) {
            this.id = id;
            this.assetId = assetId;
            this.action = action;
            this.description = description;
            this.operatorId = operatorId;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAssetId() { return assetId; }
        public void setAssetId(String assetId) { this.assetId = assetId; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getOperatorId() { return operatorId; }
        public void setOperatorId(String operatorId) { this.operatorId = operatorId; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    // 事件类
    public static class Event {
        private String id;
        private String assetId;
        private String eventName;
        private Map<String, Object> properties;
        private String sessionId;
        private String userId;
        private long timestamp;
        
        public Event(String id, String assetId, String eventName, Map<String, Object> properties, String sessionId, String userId, long timestamp) {
            this.id = id;
            this.assetId = assetId;
            this.eventName = eventName;
            this.properties = properties;
            this.sessionId = sessionId;
            this.userId = userId;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAssetId() { return assetId; }
        public void setAssetId(String assetId) { this.assetId = assetId; }
        public String getEventName() { return eventName; }
        public void setEventName(String eventName) { this.eventName = eventName; }
        public Map<String, Object> getProperties() { return properties; }
        public void setProperties(Map<String, Object> properties) { this.properties = properties; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    // 仪表板指标类
    public static class DashboardMetrics {
        private int totalViews;
        private int totalCopies;
        private int totalFavorites;
        private int totalForks;
        private int totalComments;
        private int totalUsers;
        private double copyRate;
        private double favoriteRate;
        private double forkRate;
        private Map<String, Integer> eventCounts;
        private long startTime;
        private long endTime;
        
        public DashboardMetrics(int totalViews, int totalCopies, int totalFavorites, int totalForks, int totalComments, int totalUsers, double copyRate, double favoriteRate, double forkRate, Map<String, Integer> eventCounts, long startTime, long endTime) {
            this.totalViews = totalViews;
            this.totalCopies = totalCopies;
            this.totalFavorites = totalFavorites;
            this.totalForks = totalForks;
            this.totalComments = totalComments;
            this.totalUsers = totalUsers;
            this.copyRate = copyRate;
            this.favoriteRate = favoriteRate;
            this.forkRate = forkRate;
            this.eventCounts = eventCounts;
            this.startTime = startTime;
            this.endTime = endTime;
        }
        
        // Getters and setters
        public int getTotalViews() { return totalViews; }
        public void setTotalViews(int totalViews) { this.totalViews = totalViews; }
        public int getTotalCopies() { return totalCopies; }
        public void setTotalCopies(int totalCopies) { this.totalCopies = totalCopies; }
        public int getTotalFavorites() { return totalFavorites; }
        public void setTotalFavorites(int totalFavorites) { this.totalFavorites = totalFavorites; }
        public int getTotalForks() { return totalForks; }
        public void setTotalForks(int totalForks) { this.totalForks = totalForks; }
        public int getTotalComments() { return totalComments; }
        public void setTotalComments(int totalComments) { this.totalComments = totalComments; }
        public int getTotalUsers() { return totalUsers; }
        public void setTotalUsers(int totalUsers) { this.totalUsers = totalUsers; }
        public double getCopyRate() { return copyRate; }
        public void setCopyRate(double copyRate) { this.copyRate = copyRate; }
        public double getFavoriteRate() { return favoriteRate; }
        public void setFavoriteRate(double favoriteRate) { this.favoriteRate = favoriteRate; }
        public double getForkRate() { return forkRate; }
        public void setForkRate(double forkRate) { this.forkRate = forkRate; }
        public Map<String, Integer> getEventCounts() { return eventCounts; }
        public void setEventCounts(Map<String, Integer> eventCounts) { this.eventCounts = eventCounts; }
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public long getEndTime() { return endTime; }
        public void setEndTime(long endTime) { this.endTime = endTime; }
    }
    
    // 仪表板度量类
    public static class DashboardMetric {
        private String id;
        private String name;
        private double value;
        private long timestamp;
        
        public DashboardMetric(String id, String name, double value, long timestamp) {
            this.id = id;
            this.name = name;
            this.value = value;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getValue() { return value; }
        public void setValue(double value) { this.value = value; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}