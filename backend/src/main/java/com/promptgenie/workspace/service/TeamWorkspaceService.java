package com.promptgenie.workspace.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TeamWorkspaceService {
    
    private final Map<String, Workspace> workspaces = new ConcurrentHashMap<>();
    private final Map<String, WorkspaceMember> workspaceMembers = new ConcurrentHashMap<>();
    private final Map<String, WorkspaceResource> workspaceResources = new ConcurrentHashMap<>();
    private final Map<String, AuditLog> auditLogs = new ConcurrentHashMap<>();
    
    // 初始化团队协作空间服务
    public void init() {
        // 初始化默认工作区
        initDefaultWorkspaces();
    }
    
    // 初始化默认工作区
    private void initDefaultWorkspaces() {
        // 这里可以初始化默认的工作区
    }
    
    // 创建工作区
    public Workspace createWorkspace(String workspaceId, String name, String description, String ownerId) {
        Workspace workspace = new Workspace(
            workspaceId,
            name,
            description,
            ownerId,
            System.currentTimeMillis()
        );
        workspaces.put(workspaceId, workspace);
        
        // 添加创建者为所有者
        addMemberToWorkspace(workspaceId, ownerId, "Owner");
        
        return workspace;
    }
    
    // 添加成员到工作区
    public WorkspaceMember addMemberToWorkspace(String workspaceId, String userId, String role) {
        Workspace workspace = workspaces.get(workspaceId);
        if (workspace == null) {
            throw new IllegalArgumentException("Workspace not found: " + workspaceId);
        }
        
        String memberId = workspaceId + ":" + userId;
        WorkspaceMember member = new WorkspaceMember(
            memberId,
            workspaceId,
            userId,
            role, // Owner, Editor, Viewer
            "active",
            System.currentTimeMillis()
        );
        workspaceMembers.put(memberId, member);
        
        // 记录审计日志
        recordAuditLog(workspaceId, "ADD_MEMBER", "Added member " + userId + " with role " + role, userId);
        
        return member;
    }
    
    // 从工作区移除成员
    public void removeMemberFromWorkspace(String workspaceId, String userId) {
        String memberId = workspaceId + ":" + userId;
        WorkspaceMember member = workspaceMembers.get(memberId);
        if (member != null) {
            member.setStatus("inactive");
            
            // 记录审计日志
            recordAuditLog(workspaceId, "REMOVE_MEMBER", "Removed member " + userId, null);
        }
    }
    
    // 更新成员角色
    public void updateMemberRole(String workspaceId, String userId, String newRole) {
        String memberId = workspaceId + ":" + userId;
        WorkspaceMember member = workspaceMembers.get(memberId);
        if (member != null) {
            String oldRole = member.getRole();
            member.setRole(newRole);
            
            // 记录审计日志
            recordAuditLog(workspaceId, "UPDATE_MEMBER_ROLE", "Changed role from " + oldRole + " to " + newRole + " for user " + userId, null);
        }
    }
    
    // 共享资源到工作区
    public WorkspaceResource shareResourceToWorkspace(String resourceId, String workspaceId, String resourceType, String userId) {
        Workspace workspace = workspaces.get(workspaceId);
        if (workspace == null) {
            throw new IllegalArgumentException("Workspace not found: " + workspaceId);
        }
        
        String workspaceResourceId = workspaceId + ":" + resourceId;
        WorkspaceResource resource = new WorkspaceResource(
            workspaceResourceId,
            workspaceId,
            resourceId,
            resourceType, // prompt, knowledge, chain
            userId,
            System.currentTimeMillis()
        );
        workspaceResources.put(workspaceResourceId, resource);
        
        // 记录审计日志
        recordAuditLog(workspaceId, "SHARE_RESOURCE", "Shared " + resourceType + " " + resourceId + " to workspace", userId);
        
        return resource;
    }
    
    // 从工作区移除资源
    public void removeResourceFromWorkspace(String workspaceId, String resourceId) {
        String workspaceResourceId = workspaceId + ":" + resourceId;
        WorkspaceResource resource = workspaceResources.get(workspaceResourceId);
        if (resource != null) {
            workspaceResources.remove(workspaceResourceId);
            
            // 记录审计日志
            recordAuditLog(workspaceId, "REMOVE_RESOURCE", "Removed resource " + resourceId + " from workspace", null);
        }
    }
    
    // 记录审计日志
    private void recordAuditLog(String workspaceId, String action, String description, String userId) {
        String logId = workspaceId + ":" + System.currentTimeMillis();
        AuditLog log = new AuditLog(
            logId,
            workspaceId,
            action,
            description,
            userId,
            System.currentTimeMillis()
        );
        auditLogs.put(logId, log);
    }
    
    // 获取工作区
    public Workspace getWorkspace(String workspaceId) {
        return workspaces.get(workspaceId);
    }
    
    // 获取工作区列表
    public List<Workspace> getWorkspaces() {
        return new ArrayList<>(workspaces.values());
    }
    
    // 获取工作区成员
    public List<WorkspaceMember> getWorkspaceMembers(String workspaceId) {
        List<WorkspaceMember> members = new ArrayList<>();
        for (WorkspaceMember member : workspaceMembers.values()) {
            if (workspaceId.equals(member.getWorkspaceId()) && "active".equals(member.getStatus())) {
                members.add(member);
            }
        }
        return members;
    }
    
    // 获取工作区资源
    public List<WorkspaceResource> getWorkspaceResources(String workspaceId) {
        List<WorkspaceResource> resources = new ArrayList<>();
        for (WorkspaceResource resource : workspaceResources.values()) {
            if (workspaceId.equals(resource.getWorkspaceId())) {
                resources.add(resource);
            }
        }
        return resources;
    }
    
    // 获取工作区审计日志
    public List<AuditLog> getWorkspaceAuditLogs(String workspaceId) {
        List<AuditLog> logs = new ArrayList<>();
        for (AuditLog log : auditLogs.values()) {
            if (workspaceId.equals(log.getWorkspaceId())) {
                logs.add(log);
            }
        }
        // 按时间倒序排序
        logs.sort(Comparator.comparingLong(AuditLog::getTimestamp).reversed());
        return logs;
    }
    
    // 工作区类
    public static class Workspace {
        private String id;
        private String name;
        private String description;
        private String ownerId;
        private long createdAt;
        
        public Workspace(String id, String name, String description, String ownerId, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.ownerId = ownerId;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getOwnerId() { return ownerId; }
        public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 工作区成员类
    public static class WorkspaceMember {
        private String id;
        private String workspaceId;
        private String userId;
        private String role; // Owner, Editor, Viewer
        private String status; // active, inactive
        private long joinedAt;
        
        public WorkspaceMember(String id, String workspaceId, String userId, String role, String status, long joinedAt) {
            this.id = id;
            this.workspaceId = workspaceId;
            this.userId = userId;
            this.role = role;
            this.status = status;
            this.joinedAt = joinedAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(String workspaceId) { this.workspaceId = workspaceId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getJoinedAt() { return joinedAt; }
        public void setJoinedAt(long joinedAt) { this.joinedAt = joinedAt; }
    }
    
    // 工作区资源类
    public static class WorkspaceResource {
        private String id;
        private String workspaceId;
        private String resourceId;
        private String resourceType; // prompt, knowledge, chain
        private String sharedBy;
        private long sharedAt;
        
        public WorkspaceResource(String id, String workspaceId, String resourceId, String resourceType, String sharedBy, long sharedAt) {
            this.id = id;
            this.workspaceId = workspaceId;
            this.resourceId = resourceId;
            this.resourceType = resourceType;
            this.sharedBy = sharedBy;
            this.sharedAt = sharedAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(String workspaceId) { this.workspaceId = workspaceId; }
        public String getResourceId() { return resourceId; }
        public void setResourceId(String resourceId) { this.resourceId = resourceId; }
        public String getResourceType() { return resourceType; }
        public void setResourceType(String resourceType) { this.resourceType = resourceType; }
        public String getSharedBy() { return sharedBy; }
        public void setSharedBy(String sharedBy) { this.sharedBy = sharedBy; }
        public long getSharedAt() { return sharedAt; }
        public void setSharedAt(long sharedAt) { this.sharedAt = sharedAt; }
    }
    
    // 审计日志类
    public static class AuditLog {
        private String id;
        private String workspaceId;
        private String action;
        private String description;
        private String userId;
        private long timestamp;
        
        public AuditLog(String id, String workspaceId, String action, String description, String userId, long timestamp) {
            this.id = id;
            this.workspaceId = workspaceId;
            this.action = action;
            this.description = description;
            this.userId = userId;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getWorkspaceId() { return workspaceId; }
        public void setWorkspaceId(String workspaceId) { this.workspaceId = workspaceId; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}