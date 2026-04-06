package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SmartContentService {
    
    private final Map<String, Content> contentStore = new ConcurrentHashMap<>();
    private final Map<String, List<ContentVersion>> contentVersions = new ConcurrentHashMap<>();
    private final Map<String, List<String>> contentTags = new ConcurrentHashMap<>();
    private final Map<String, List<String>> tagContents = new ConcurrentHashMap<>();
    
    // 初始化智能内容服务
    public void init() {
        // 初始化默认内容
        initDefaultContent();
    }
    
    // 初始化默认内容
    private void initDefaultContent() {
        // 创建默认内容
        Content content1 = new Content(
            "content_1",
            "Introduction to AI",
            "This is an introduction to AI technology.",
            "article",
            "admin",
            System.currentTimeMillis(),
            "published"
        );
        contentStore.put(content1.getId(), content1);
        
        // 创建内容版本
        List<ContentVersion> versions1 = new ArrayList<>();
        versions1.add(new ContentVersion(
            "content_1_v1",
            "content_1",
            "1.0",
            "Initial version",
            "This is an introduction to AI technology.",
            System.currentTimeMillis(),
            "active"
        ));
        contentVersions.put("content_1", versions1);
        
        // 添加标签
        addTagToContent("content_1", "AI");
        addTagToContent("content_1", "technology");
        
        // 创建另一个默认内容
        Content content2 = new Content(
            "content_2",
            "Machine Learning Basics",
            "This is a guide to machine learning basics.",
            "article",
            "admin",
            System.currentTimeMillis(),
            "published"
        );
        contentStore.put(content2.getId(), content2);
        
        // 创建内容版本
        List<ContentVersion> versions2 = new ArrayList<>();
        versions2.add(new ContentVersion(
            "content_2_v1",
            "content_2",
            "1.0",
            "Initial version",
            "This is a guide to machine learning basics.",
            System.currentTimeMillis(),
            "active"
        ));
        contentVersions.put("content_2", versions2);
        
        // 添加标签
        addTagToContent("content_2", "machine learning");
        addTagToContent("content_2", "AI");
    }
    
    // 创建内容
    public Content createContent(String title, String content, String type, String author) {
        String contentId = "content_" + UUID.randomUUID().toString().substring(0, 8);
        Content newContent = new Content(
            contentId,
            title,
            content,
            type,
            author,
            System.currentTimeMillis(),
            "draft"
        );
        contentStore.put(contentId, newContent);
        
        // 创建初始版本
        createContentVersion(contentId, "1.0", "Initial version", content);
        
        return newContent;
    }
    
    // 更新内容
    public Content updateContent(String contentId, String title, String content, String type) {
        Content existingContent = contentStore.get(contentId);
        if (existingContent != null) {
            if (title != null) existingContent.setTitle(title);
            if (content != null) existingContent.setContent(content);
            if (type != null) existingContent.setType(type);
            existingContent.setLastUpdatedAt(System.currentTimeMillis());
            
            // 创建新版本
            List<ContentVersion> versions = contentVersions.get(contentId);
            int versionNumber = versions != null ? versions.size() + 1 : 1;
            createContentVersion(contentId, versionNumber + ".0", "Updated version", content);
        }
        return existingContent;
    }
    
    // 删除内容
    public void deleteContent(String contentId) {
        contentStore.remove(contentId);
        contentVersions.remove(contentId);
        List<String> tags = contentTags.get(contentId);
        if (tags != null) {
            for (String tag : tags) {
                List<String> taggedContents = tagContents.get(tag);
                if (taggedContents != null) {
                    taggedContents.remove(contentId);
                }
            }
        }
        contentTags.remove(contentId);
    }
    
    // 获取内容
    public Content getContent(String contentId) {
        return contentStore.get(contentId);
    }
    
    // 获取所有内容
    public List<Content> getAllContent() {
        return new ArrayList<>(contentStore.values());
    }
    
    // 按类型获取内容
    public List<Content> getContentByType(String type) {
        return contentStore.values().stream()
            .filter(content -> type.equals(content.getType()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 按状态获取内容
    public List<Content> getContentByStatus(String status) {
        return contentStore.values().stream()
            .filter(content -> status.equals(content.getStatus()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 按作者获取内容
    public List<Content> getContentByAuthor(String author) {
        return contentStore.values().stream()
            .filter(content -> author.equals(content.getAuthor()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 搜索内容
    public List<Content> searchContent(String query) {
        return contentStore.values().stream()
            .filter(content -> 
                content.getTitle().contains(query) || 
                content.getContent().contains(query)
            )
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 创建内容版本
    public ContentVersion createContentVersion(String contentId, String version, String description, String content) {
        String versionId = contentId + "_v" + version.replace(".", "");
        ContentVersion contentVersion = new ContentVersion(
            versionId,
            contentId,
            version,
            description,
            content,
            System.currentTimeMillis(),
            "active"
        );
        
        List<ContentVersion> versions = contentVersions.computeIfAbsent(contentId, k -> new ArrayList<>());
        versions.add(contentVersion);
        
        return contentVersion;
    }
    
    // 获取内容版本
    public List<ContentVersion> getContentVersions(String contentId) {
        return contentVersions.getOrDefault(contentId, Collections.emptyList());
    }
    
    // 激活内容版本
    public void activateContentVersion(String contentId, String versionId) {
        List<ContentVersion> versions = contentVersions.get(contentId);
        if (versions != null) {
            for (ContentVersion version : versions) {
                if (version.getId().equals(versionId)) {
                    version.setStatus("active");
                    // 更新内容为该版本
                    Content content = contentStore.get(contentId);
                    if (content != null) {
                        content.setContent(version.getContent());
                        content.setLastUpdatedAt(System.currentTimeMillis());
                    }
                } else {
                    version.setStatus("inactive");
                }
            }
        }
    }
    
    // 添加标签到内容
    public void addTagToContent(String contentId, String tag) {
        // 添加标签到内容
        List<String> tags = contentTags.computeIfAbsent(contentId, k -> new ArrayList<>());
        if (!tags.contains(tag)) {
            tags.add(tag);
        }
        
        // 添加内容到标签
        List<String> taggedContents = tagContents.computeIfAbsent(tag, k -> new ArrayList<>());
        if (!taggedContents.contains(contentId)) {
            taggedContents.add(contentId);
        }
    }
    
    // 从内容中移除标签
    public void removeTagFromContent(String contentId, String tag) {
        // 从内容中移除标签
        List<String> tags = contentTags.get(contentId);
        if (tags != null) {
            tags.remove(tag);
        }
        
        // 从标签中移除内容
        List<String> taggedContents = tagContents.get(tag);
        if (taggedContents != null) {
            taggedContents.remove(contentId);
        }
    }
    
    // 获取内容的标签
    public List<String> getContentTags(String contentId) {
        return contentTags.getOrDefault(contentId, Collections.emptyList());
    }
    
    // 获取标签的内容
    public List<Content> getContentByTag(String tag) {
        List<String> contentIds = tagContents.getOrDefault(tag, Collections.emptyList());
        List<Content> contents = new ArrayList<>();
        for (String contentId : contentIds) {
            Content content = contentStore.get(contentId);
            if (content != null) {
                contents.add(content);
            }
        }
        return contents;
    }
    
    // 更新内容状态
    public void updateContentStatus(String contentId, String status) {
        Content content = contentStore.get(contentId);
        if (content != null) {
            content.setStatus(status);
            content.setLastUpdatedAt(System.currentTimeMillis());
        }
    }
    
    // 内容类
    public static class Content {
        private String id;
        private String title;
        private String content;
        private String type; // article, blog, tutorial, documentation
        private String author;
        private long createdAt;
        private long lastUpdatedAt;
        private String status; // draft, published, archived
        
        public Content(String id, String title, String content, String type, String author, long createdAt, String status) {
            this.id = id;
            this.title = title;
            this.content = content;
            this.type = type;
            this.author = author;
            this.createdAt = createdAt;
            this.lastUpdatedAt = createdAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getLastUpdatedAt() { return lastUpdatedAt; }
        public void setLastUpdatedAt(long lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // 内容版本类
    public static class ContentVersion {
        private String id;
        private String contentId;
        private String version;
        private String description;
        private String content;
        private long createdAt;
        private String status; // active, inactive
        
        public ContentVersion(String id, String contentId, String version, String description, String content, long createdAt, String status) {
            this.id = id;
            this.contentId = contentId;
            this.version = version;
            this.description = description;
            this.content = content;
            this.createdAt = createdAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getContentId() { return contentId; }
        public void setContentId(String contentId) { this.contentId = contentId; }
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}