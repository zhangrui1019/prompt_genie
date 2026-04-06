package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class CollaborationService {
    
    private final Map<String, CollaborationSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, UserSessionInfo> userSessions = new ConcurrentHashMap<>();
    
    // 初始化协作服务
    public void init() {
        // 初始化默认会话
        // 实际应用中，这里应该从数据库加载现有的会话
    }
    
    // 创建协作会话
    public CollaborationSession createSession(String sessionName, String creatorId) {
        String sessionId = UUID.randomUUID().toString();
        CollaborationSession session = new CollaborationSession(
            sessionId,
            sessionName,
            creatorId,
            System.currentTimeMillis(),
            "active"
        );
        sessions.put(sessionId, session);
        
        // 添加创建者到会话
        joinSession(sessionId, creatorId, "creator");
        
        return session;
    }
    
    // 加入协作会话
    public void joinSession(String sessionId, String userId, String role) {
        CollaborationSession session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        
        // 创建用户会话信息
        UserSessionInfo userSessionInfo = new UserSessionInfo(
            userId,
            sessionId,
            role,
            System.currentTimeMillis(),
            "active"
        );
        userSessions.put(userId + "_" + sessionId, userSessionInfo);
        
        // 添加用户到会话
        session.getUsers().add(userId);
        
        // 发送加入消息
        sendMessage(sessionId, "system", userId + " joined the session as " + role);
    }
    
    // 离开协作会话
    public void leaveSession(String sessionId, String userId) {
        CollaborationSession session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        
        // 从会话中移除用户
        session.getUsers().remove(userId);
        
        // 移除用户会话信息
        userSessions.remove(userId + "_" + sessionId);
        
        // 发送离开消息
        sendMessage(sessionId, "system", userId + " left the session");
        
        // 如果会话为空，关闭会话
        if (session.getUsers().isEmpty()) {
            closeSession(sessionId);
        }
    }
    
    // 关闭协作会话
    public void closeSession(String sessionId) {
        CollaborationSession session = sessions.get(sessionId);
        if (session != null) {
            session.setStatus("closed");
            session.setClosedAt(System.currentTimeMillis());
            
            // 通知所有用户会话已关闭
            sendMessage(sessionId, "system", "Session has been closed");
            
            // 移除所有用户会话信息
            for (String userId : session.getUsers()) {
                userSessions.remove(userId + "_" + sessionId);
            }
        }
    }
    
    // 发送消息
    public void sendMessage(String sessionId, String userId, String content) {
        CollaborationSession session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        
        // 创建消息
        CollaborationMessage message = new CollaborationMessage(
            UUID.randomUUID().toString(),
            sessionId,
            userId,
            content,
            System.currentTimeMillis(),
            "delivered"
        );
        
        // 添加消息到会话
        session.getMessages().add(message);
        
        // 限制消息数量，只保留最近的1000条
        if (session.getMessages().size() > 1000) {
            session.getMessages().subList(0, session.getMessages().size() - 1000).clear();
        }
    }
    
    // 发送文件
    public void sendFile(String sessionId, String userId, String fileName, byte[] fileContent) {
        CollaborationSession session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        
        // 创建文件消息
        CollaborationFile file = new CollaborationFile(
            UUID.randomUUID().toString(),
            sessionId,
            userId,
            fileName,
            fileContent.length,
            System.currentTimeMillis(),
            "uploaded"
        );
        
        // 添加文件到会话
        session.getFiles().add(file);
        
        // 发送文件上传消息
        sendMessage(sessionId, "system", userId + " uploaded file: " + fileName);
    }
    
    // 同步文档
    public void syncDocument(String sessionId, String userId, String documentId, String content, long version) {
        CollaborationSession session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        
        // 创建文档同步事件
        DocumentSyncEvent syncEvent = new DocumentSyncEvent(
            UUID.randomUUID().toString(),
            sessionId,
            userId,
            documentId,
            content,
            version,
            System.currentTimeMillis()
        );
        
        // 添加同步事件到会话
        session.getSyncEvents().add(syncEvent);
        
        // 限制同步事件数量，只保留最近的1000条
        if (session.getSyncEvents().size() > 1000) {
            session.getSyncEvents().subList(0, session.getSyncEvents().size() - 1000).clear();
        }
    }
    
    // 解决冲突
    public void resolveConflict(String sessionId, String userId, String conflictId, String resolution) {
        CollaborationSession session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        
        // 这里应该实现实际的冲突解决逻辑
        // 为了演示，我们简单发送一个冲突解决消息
        sendMessage(sessionId, "system", userId + " resolved conflict: " + conflictId);
    }
    
    // 获取会话信息
    public CollaborationSession getSession(String sessionId) {
        return sessions.get(sessionId);
    }
    
    // 获取用户的会话
    public List<CollaborationSession> getUserSessions(String userId) {
        List<CollaborationSession> userSessionsList = new ArrayList<>();
        for (CollaborationSession session : sessions.values()) {
            if (session.getUsers().contains(userId)) {
                userSessionsList.add(session);
            }
        }
        return userSessionsList;
    }
    
    // 获取会话的消息
    public List<CollaborationMessage> getSessionMessages(String sessionId, long since) {
        CollaborationSession session = sessions.get(sessionId);
        if (session == null) {
            return Collections.emptyList();
        }
        
        return session.getMessages().stream()
            .filter(message -> message.getTimestamp() > since)
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 获取会话的同步事件
    public List<DocumentSyncEvent> getSessionSyncEvents(String sessionId, long since) {
        CollaborationSession session = sessions.get(sessionId);
        if (session == null) {
            return Collections.emptyList();
        }
        
        return session.getSyncEvents().stream()
            .filter(event -> event.getTimestamp() > since)
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 检查用户是否在会话中
    public boolean isUserInSession(String sessionId, String userId) {
        CollaborationSession session = sessions.get(sessionId);
        if (session == null) {
            return false;
        }
        return session.getUsers().contains(userId);
    }
    
    // 获取会话的在线用户
    public List<String> getSessionUsers(String sessionId) {
        CollaborationSession session = sessions.get(sessionId);
        if (session == null) {
            return Collections.emptyList();
        }
        return new ArrayList<>(session.getUsers());
    }
    
    // 协作会话类
    public static class CollaborationSession {
        private String id;
        private String name;
        private String creatorId;
        private long createdAt;
        private long closedAt;
        private String status; // active, closed
        private List<String> users;
        private List<CollaborationMessage> messages;
        private List<CollaborationFile> files;
        private List<DocumentSyncEvent> syncEvents;
        
        public CollaborationSession(String id, String name, String creatorId, long createdAt, String status) {
            this.id = id;
            this.name = name;
            this.creatorId = creatorId;
            this.createdAt = createdAt;
            this.status = status;
            this.users = new CopyOnWriteArrayList<>();
            this.messages = new CopyOnWriteArrayList<>();
            this.files = new CopyOnWriteArrayList<>();
            this.syncEvents = new CopyOnWriteArrayList<>();
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCreatorId() { return creatorId; }
        public void setCreatorId(String creatorId) { this.creatorId = creatorId; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getClosedAt() { return closedAt; }
        public void setClosedAt(long closedAt) { this.closedAt = closedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public List<String> getUsers() { return users; }
        public void setUsers(List<String> users) { this.users = users; }
        public List<CollaborationMessage> getMessages() { return messages; }
        public void setMessages(List<CollaborationMessage> messages) { this.messages = messages; }
        public List<CollaborationFile> getFiles() { return files; }
        public void setFiles(List<CollaborationFile> files) { this.files = files; }
        public List<DocumentSyncEvent> getSyncEvents() { return syncEvents; }
        public void setSyncEvents(List<DocumentSyncEvent> syncEvents) { this.syncEvents = syncEvents; }
    }
    
    // 用户会话信息类
    public static class UserSessionInfo {
        private String userId;
        private String sessionId;
        private String role;
        private long joinedAt;
        private String status; // active, inactive
        
        public UserSessionInfo(String userId, String sessionId, String role, long joinedAt, String status) {
            this.userId = userId;
            this.sessionId = sessionId;
            this.role = role;
            this.joinedAt = joinedAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public long getJoinedAt() { return joinedAt; }
        public void setJoinedAt(long joinedAt) { this.joinedAt = joinedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // 协作消息类
    public static class CollaborationMessage {
        private String id;
        private String sessionId;
        private String userId;
        private String content;
        private long timestamp;
        private String status; // sent, delivered, read
        
        public CollaborationMessage(String id, String sessionId, String userId, String content, long timestamp, String status) {
            this.id = id;
            this.sessionId = sessionId;
            this.userId = userId;
            this.content = content;
            this.timestamp = timestamp;
            this.status = status;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // 协作文件类
    public static class CollaborationFile {
        private String id;
        private String sessionId;
        private String userId;
        private String fileName;
        private int fileSize;
        private long uploadedAt;
        private String status; // uploading, uploaded, failed
        
        public CollaborationFile(String id, String sessionId, String userId, String fileName, int fileSize, long uploadedAt, String status) {
            this.id = id;
            this.sessionId = sessionId;
            this.userId = userId;
            this.fileName = fileName;
            this.fileSize = fileSize;
            this.uploadedAt = uploadedAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public int getFileSize() { return fileSize; }
        public void setFileSize(int fileSize) { this.fileSize = fileSize; }
        public long getUploadedAt() { return uploadedAt; }
        public void setUploadedAt(long uploadedAt) { this.uploadedAt = uploadedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // 文档同步事件类
    public static class DocumentSyncEvent {
        private String id;
        private String sessionId;
        private String userId;
        private String documentId;
        private String content;
        private long version;
        private long timestamp;
        
        public DocumentSyncEvent(String id, String sessionId, String userId, String documentId, String content, long version, long timestamp) {
            this.id = id;
            this.sessionId = sessionId;
            this.userId = userId;
            this.documentId = documentId;
            this.content = content;
            this.version = version;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getDocumentId() { return documentId; }
        public void setDocumentId(String documentId) { this.documentId = documentId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public long getVersion() { return version; }
        public void setVersion(long version) { this.version = version; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}