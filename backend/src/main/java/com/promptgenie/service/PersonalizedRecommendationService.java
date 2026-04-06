package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PersonalizedRecommendationService {
    
    private final Map<String, UserProfile> userProfiles = new ConcurrentHashMap<>();
    private final Map<String, List<Recommendation>> recommendations = new ConcurrentHashMap<>();
    private final Map<String, List<UserAction>> userActions = new ConcurrentHashMap<>();
    
    // 初始化个性化推荐服务
    public void init() {
        // 初始化默认用户配置文件
        // 实际应用中，这里应该从数据库加载现有的用户配置文件
    }
    
    // 记录用户行为
    public void recordUserAction(String userId, UserAction action) {
        List<UserAction> actions = userActions.computeIfAbsent(userId, k -> new ArrayList<>());
        actions.add(action);
        
        // 限制行为记录数量，只保留最近的1000条
        if (actions.size() > 1000) {
            actions.subList(0, actions.size() - 1000).clear();
        }
        
        // 更新用户配置文件
        updateUserProfile(userId, action);
    }
    
    // 更新用户配置文件
    private void updateUserProfile(String userId, UserAction action) {
        UserProfile profile = userProfiles.computeIfAbsent(userId, k -> new UserProfile(userId));
        
        // 更新用户偏好
        Map<String, Double> preferences = profile.getPreferences();
        String actionType = action.getType();
        double currentScore = preferences.getOrDefault(actionType, 0.0);
        preferences.put(actionType, currentScore + 1.0);
        
        // 更新最近行为
        List<UserAction> recentActions = profile.getRecentActions();
        recentActions.add(action);
        if (recentActions.size() > 50) {
            recentActions.subList(0, recentActions.size() - 50).clear();
        }
    }
    
    // 生成个性化推荐
    public List<Recommendation> generateRecommendations(String userId, int count) {
        UserProfile profile = userProfiles.get(userId);
        if (profile == null) {
            // 如果用户配置文件不存在，生成默认推荐
            return generateDefaultRecommendations(count);
        }
        
        // 基于用户偏好生成推荐
        List<Recommendation> userRecommendations = generateUserSpecificRecommendations(profile, count);
        
        // 存储推荐结果
        recommendations.put(userId, userRecommendations);
        
        return userRecommendations;
    }
    
    // 生成默认推荐
    private List<Recommendation> generateDefaultRecommendations(int count) {
        List<Recommendation> defaultRecommendations = new ArrayList<>();
        
        // 生成一些默认推荐
        defaultRecommendations.add(new Recommendation(
            "1",
            "Popular Model",
            "This is a popular AI model used by many users",
            "model",
            0.9
        ));
        
        defaultRecommendations.add(new Recommendation(
            "2",
            "Trending Prompt",
            "This prompt is currently trending among users",
            "prompt",
            0.8
        ));
        
        defaultRecommendations.add(new Recommendation(
            "3",
            "New Feature",
            "Check out this new feature we just added",
            "feature",
            0.7
        ));
        
        // 限制推荐数量
        return defaultRecommendations.subList(0, Math.min(count, defaultRecommendations.size()));
    }
    
    // 生成用户特定推荐
    private List<Recommendation> generateUserSpecificRecommendations(UserProfile profile, int count) {
        List<Recommendation> userRecommendations = new ArrayList<>();
        
        // 基于用户偏好排序
        Map<String, Double> preferences = profile.getPreferences();
        List<Map.Entry<String, Double>> sortedPreferences = new ArrayList<>(preferences.entrySet());
        sortedPreferences.sort(Map.Entry.comparingByValue(Comparator.reverseOrder()));
        
        // 生成推荐
        for (Map.Entry<String, Double> entry : sortedPreferences) {
            String actionType = entry.getKey();
            double score = entry.getValue();
            
            // 基于行为类型生成推荐
            switch (actionType) {
                case "model_usage":
                    userRecommendations.add(new Recommendation(
                        UUID.randomUUID().toString(),
                        "Recommended Model",
                        "Based on your model usage history",
                        "model",
                        score / 10.0
                    ));
                    break;
                case "prompt_creation":
                    userRecommendations.add(new Recommendation(
                        UUID.randomUUID().toString(),
                        "Recommended Prompt",
                        "Based on your prompt creation history",
                        "prompt",
                        score / 10.0
                    ));
                    break;
                case "feature_usage":
                    userRecommendations.add(new Recommendation(
                        UUID.randomUUID().toString(),
                        "Recommended Feature",
                        "Based on your feature usage history",
                        "feature",
                        score / 10.0
                    ));
                    break;
            }
            
            if (userRecommendations.size() >= count) {
                break;
            }
        }
        
        // 如果推荐数量不足，添加默认推荐
        if (userRecommendations.size() < count) {
            List<Recommendation> defaultRecommendations = generateDefaultRecommendations(count - userRecommendations.size());
            userRecommendations.addAll(defaultRecommendations);
        }
        
        return userRecommendations;
    }
    
    // 获取推荐
    public List<Recommendation> getRecommendations(String userId) {
        return recommendations.getOrDefault(userId, Collections.emptyList());
    }
    
    // 反馈推荐
    public void feedbackRecommendation(String userId, String recommendationId, boolean liked) {
        List<Recommendation> userRecommendations = recommendations.get(userId);
        if (userRecommendations != null) {
            for (Recommendation recommendation : userRecommendations) {
                if (recommendation.getId().equals(recommendationId)) {
                    recommendation.setLiked(liked);
                    recommendation.setFeedbackReceived(true);
                    
                    // 更新用户配置文件
                    UserProfile profile = userProfiles.get(userId);
                    if (profile != null) {
                        Map<String, Double> preferences = profile.getPreferences();
                        String recommendationType = recommendation.getType();
                        double currentScore = preferences.getOrDefault(recommendationType, 0.0);
                        preferences.put(recommendationType, currentScore + (liked ? 1.0 : -0.5));
                    }
                    
                    break;
                }
            }
        }
    }
    
    // 获取用户配置文件
    public UserProfile getUserProfile(String userId) {
        return userProfiles.get(userId);
    }
    
    // 更新用户配置文件
    public void updateUserProfile(String userId, Map<String, Double> preferences) {
        UserProfile profile = userProfiles.computeIfAbsent(userId, k -> new UserProfile(userId));
        profile.setPreferences(preferences);
    }
    
    // 批量生成推荐
    public Map<String, List<Recommendation>> generateBatchRecommendations(List<String> userIds, int count) {
        Map<String, List<Recommendation>> batchRecommendations = new HashMap<>();
        
        for (String userId : userIds) {
            List<Recommendation> userRecommendations = generateRecommendations(userId, count);
            batchRecommendations.put(userId, userRecommendations);
        }
        
        return batchRecommendations;
    }
    
    // 用户配置文件类
    public static class UserProfile {
        private String userId;
        private Map<String, Double> preferences;
        private List<UserAction> recentActions;
        private long lastUpdatedAt;
        
        public UserProfile(String userId) {
            this.userId = userId;
            this.preferences = new HashMap<>();
            this.recentActions = new ArrayList<>();
            this.lastUpdatedAt = System.currentTimeMillis();
        }
        
        // Getters and setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public Map<String, Double> getPreferences() { return preferences; }
        public void setPreferences(Map<String, Double> preferences) { 
            this.preferences = preferences;
            this.lastUpdatedAt = System.currentTimeMillis();
        }
        public List<UserAction> getRecentActions() { return recentActions; }
        public void setRecentActions(List<UserAction> recentActions) { this.recentActions = recentActions; }
        public long getLastUpdatedAt() { return lastUpdatedAt; }
        public void setLastUpdatedAt(long lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
    }
    
    // 用户行为类
    public static class UserAction {
        private String id;
        private String userId;
        private String type; // model_usage, prompt_creation, feature_usage, etc.
        private String targetId; // ID of the model, prompt, or feature
        private long timestamp;
        private Map<String, Object> metadata;
        
        public UserAction(String id, String userId, String type, String targetId, long timestamp, Map<String, Object> metadata) {
            this.id = id;
            this.userId = userId;
            this.type = type;
            this.targetId = targetId;
            this.timestamp = timestamp;
            this.metadata = metadata;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTargetId() { return targetId; }
        public void setTargetId(String targetId) { this.targetId = targetId; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    }
    
    // 推荐类
    public static class Recommendation {
        private String id;
        private String title;
        private String description;
        private String type; // model, prompt, feature
        private double score;
        private boolean liked;
        private boolean feedbackReceived;
        private long createdAt;
        
        public Recommendation(String id, String title, String description, String type, double score) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.type = type;
            this.score = score;
            this.createdAt = System.currentTimeMillis();
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public double getScore() { return score; }
        public void setScore(double score) { this.score = score; }
        public boolean isLiked() { return liked; }
        public void setLiked(boolean liked) { this.liked = liked; }
        public boolean isFeedbackReceived() { return feedbackReceived; }
        public void setFeedbackReceived(boolean feedbackReceived) { this.feedbackReceived = feedbackReceived; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
}