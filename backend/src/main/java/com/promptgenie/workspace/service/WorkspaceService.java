package com.promptgenie.workspace.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.promptgenie.workspace.entity.Workspace;
import com.promptgenie.workspace.entity.WorkspaceMember;
import java.util.List;
import java.util.Map;

public interface WorkspaceService extends IService<Workspace> {
    
    Workspace createWorkspace(Long userId, String name, String description);
    
    List<Workspace> getUserWorkspaces(Long userId);
    
    void addMember(Long workspaceId, String email, String role);
    
    void removeMember(Long workspaceId, Long userId);
    
    void updateMemberRole(Long workspaceId, Long userId, String role);
    
    List<Map<String, Object>> getMembers(Long workspaceId);
    
    boolean hasAccess(Long userId, Long workspaceId, String requiredRole);
}
