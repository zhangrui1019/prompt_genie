package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CommunityService {
    
    private final Map<String, Comment> comments = new ConcurrentHashMap<>();
    private final Map<String, Fork> forks = new ConcurrentHashMap<>();
    private final Map<String, UserProfile> userProfiles = new ConcurrentHashMap<>();
    private final Map<String, Like> likes = new ConcurrentHashMap<>();
    
    // 初始化社区服务
    public void init() {
        // 初始化默认用户档案
        initDefaultUserProfiles();
    }
    
    // 初始化默认用户档案
    private void initDefaultUserProfiles() {
        // 这里可以初始化默认的用户档案
    }
    
    // 克隆Prompt
    public Fork forkPrompt(String forkId, String promptId, String userId, String newName, String newDescription) {
        Fork fork = new Fork(
            forkId,
            promptId,
            userId,
            newName,
            newDescription,
            System.currentTimeMillis()
        );
        forks.put(forkId, fork);
        
        // 更新用户的fork统计
        updateUserForkCount(userId);
        
        return fork;
    }
    
    // 添加评论
    public Comment addComment(String commentId, String promptId, String userId, String content, String parentCommentId) {
        Comment comment = new Comment(
            commentId,
            promptId,
            userId,
            content,
            parentCommentId,
            System.currentTimeMillis()
        );
        comments.put(commentId, comment);
        
        // 更新用户的评论统计
        updateUserCommentCount(userId);
        
        return comment;
    }
    
    // 点赞Prompt
    public Like likePrompt(String likeId, String promptId, String userId) {
        Like like = new Like(
            likeId,
            promptId,
            userId,
            System.currentTimeMillis()
        );
        likes.put(likeId, like);
        
        // 更新用户的点赞统计
        updateUserLikeCount(userId);
        
        return like;
    }
    
    // 取消点赞
    public void unlikePrompt(String promptId, String userId) {
        String likeId = promptId + ":" + userId;
        Like like = likes.get(likeId);
        if (like != null) {
            likes.remove(likeId);
            
            // 更新用户的点赞统计
            updateUserLikeCount(userId);
        }
    }
    
    // 获取Prompt的评论
    public List<Comment> getPromptComments(String promptId) {
        List<Comment> promptComments = new ArrayList<>();
        for (Comment comment : comments.values()) {
            if (promptId.equals(comment.getPromptId())) {
                promptComments.add(comment);
            }
        }
        
        // 按时间排序
        promptComments.sort(Comparator.comparingLong(Comment::getCreatedAt));
        
        return promptComments;
    }
    
    // 获取Prompt的点赞数
    public int getPromptLikeCount(String promptId) {
        int count = 0;
        for (Like like : likes.values()) {
            if (promptId.equals(like.getPromptId())) {
                count++;
            }
        }
        return count;
    }
    
    // 获取用户是否点赞了Prompt
    public boolean isPromptLikedByUser(String promptId, String userId) {
        String likeId = promptId + ":" + userId;
        return likes.containsKey(likeId);
    }
    
    // 获取用户档案
    public UserProfile getUserProfile(String userId) {
        UserProfile profile = userProfiles.get(userId);
        if (profile == null) {
            // 创建新的用户档案
            profile = new UserProfile(
                userId,
                "User " + userId,
                "",
                0,
                0,
                0,
                0,
                System.currentTimeMillis()
            );
            userProfiles.put(userId, profile);
        }
        return profile;
    }
    
    // 更新用户的fork统计
    private void updateUserForkCount(String userId) {
        UserProfile profile = getUserProfile(userId);
        int forkCount = 0;
        for (Fork fork : forks.values()) {
            if (userId.equals(fork.getUserId())) {
                forkCount++;
            }
        }
        profile.setForkCount(forkCount);
    }
    
    // 更新用户的评论统计
    private void updateUserCommentCount(String userId) {
        UserProfile profile = getUserProfile(userId);
        int commentCount = 0;
        for (Comment comment : comments.values()) {
            if (userId.equals(comment.getUserId())) {
                commentCount++;
            }
        }
        profile.setCommentCount(commentCount);
    }
    
    // 更新用户的点赞统计
    private void updateUserLikeCount(String userId) {
        UserProfile profile = getUserProfile(userId);
        int likeCount = 0;
        for (Like like : likes.values()) {
            if (userId.equals(like.getUserId())) {
                likeCount++;
            }
        }
        profile.setLikeCount(likeCount);
    }
    
    // 评论类
    public static class Comment {
        private String id;
        private String promptId;
        private String userId;
        private String content;
        private String parentCommentId;
        private long createdAt;
        
        public Comment(String id, String promptId, String userId, String content, String parentCommentId, long createdAt) {
            this.id = id;
            this.promptId = promptId;
            this.userId = userId;
            this.content = content;
            this.parentCommentId = parentCommentId;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getPromptId() { return promptId; }
        public void setPromptId(String promptId) { this.promptId = promptId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getParentCommentId() { return parentCommentId; }
        public void setParentCommentId(String parentCommentId) { this.parentCommentId = parentCommentId; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 克隆类
    public static class Fork {
        private String id;
        private String promptId;
        private String userId;
        private String newName;
        private String newDescription;
        private long createdAt;
        
        public Fork(String id, String promptId, String userId, String newName, String newDescription, long createdAt) {
            this.id = id;
            this.promptId = promptId;
            this.userId = userId;
            this.newName = newName;
            this.newDescription = newDescription;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getPromptId() { return promptId; }
        public void setPromptId(String promptId) { this.promptId = promptId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getNewName() { return newName; }
        public void setNewName(String newName) { this.newName = newName; }
        public String getNewDescription() { return newDescription; }
        public void setNewDescription(String newDescription) { this.newDescription = newDescription; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 用户档案类
    public static class UserProfile {
        private String userId;
        private String username;
        private String bio;
        private int promptCount;
        private int forkCount;
        private int commentCount;
        private int likeCount;
        private long createdAt;
        
        public UserProfile(String userId, String username, String bio, int promptCount, int forkCount, int commentCount, int likeCount, long createdAt) {
            this.userId = userId;
            this.username = username;
            this.bio = bio;
            this.promptCount = promptCount;
            this.forkCount = forkCount;
            this.commentCount = commentCount;
            this.likeCount = likeCount;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public int getPromptCount() { return promptCount; }
        public void setPromptCount(int promptCount) { this.promptCount = promptCount; }
        public int getForkCount() { return forkCount; }
        public void setForkCount(int forkCount) { this.forkCount = forkCount; }
        public int getCommentCount() { return commentCount; }
        public void setCommentCount(int commentCount) { this.commentCount = commentCount; }
        public int getLikeCount() { return likeCount; }
        public void setLikeCount(int likeCount) { this.likeCount = likeCount; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 点赞类
    public static class Like {
        private String id;
        private String promptId;
        private String userId;
        private long createdAt;
        
        public Like(String id, String promptId, String userId, long createdAt) {
            this.id = id;
            this.promptId = promptId;
            this.userId = userId;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getPromptId() { return promptId; }
        public void setPromptId(String promptId) { this.promptId = promptId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
}