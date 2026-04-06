package com.promptgenie.workspace.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.auth.entity.User;
import com.promptgenie.auth.service.UserService;
import com.promptgenie.workspace.entity.Workspace;
import com.promptgenie.workspace.entity.WorkspaceMember;
import com.promptgenie.workspace.mapper.WorkspaceMapper;
import com.promptgenie.workspace.mapper.WorkspaceMemberMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WorkspaceServiceImpl extends ServiceImpl<WorkspaceMapper, Workspace> implements WorkspaceService {
    
    @Autowired
    private WorkspaceMapper workspaceMapper;
    
    @Autowired
    private WorkspaceMemberMapper workspaceMemberMapper;
    
    @Autowired
    private UserService userService;
    
    @Override
    public Workspace createWorkspace(Long userId, String name, String description) {
        Workspace workspace = new Workspace();
        workspace.setName(name);
        workspace.setDescription(description);
        workspace.setCreatedBy(userId);
        save(workspace);
        
        // 添加创建者为成员
        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspaceId(workspace.getId());
        member.setUserId(userId);
        member.setRole("owner");
        workspaceMemberMapper.insert(member);
        
        return workspace;
    }
    
    @Override
    public List<Workspace> getUserWorkspaces(Long userId) {
        return workspaceMapper.selectByUserId(userId);
    }
    
    @Override
    public void addMember(Long workspaceId, String email, String role) {
        // 根据邮箱查找用户
        User user = userService.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        // 检查是否已存在
        WorkspaceMember existing = workspaceMemberMapper.selectByWorkspaceIdAndUserId(workspaceId, user.getId());
        if (existing != null) {
            throw new RuntimeException("User already in workspace");
        }
        
        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspaceId(workspaceId);
        member.setUserId(user.getId());
        member.setRole(role);
        workspaceMemberMapper.insert(member);
    }
    
    @Override
    public void removeMember(Long workspaceId, Long userId) {
        workspaceMemberMapper.deleteByWorkspaceIdAndUserId(workspaceId, userId);
    }
    
    @Override
    public void updateMemberRole(Long workspaceId, Long userId, String role) {
        WorkspaceMember member = workspaceMemberMapper.selectByWorkspaceIdAndUserId(workspaceId, userId);
        if (member != null) {
            member.setRole(role);
            workspaceMemberMapper.updateById(member);
        }
    }
    
    @Override
    public List<Map<String, Object>> getMembers(Long workspaceId) {
        List<WorkspaceMember> members = workspaceMemberMapper.selectByWorkspaceId(workspaceId);
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (WorkspaceMember member : members) {
            Map<String, Object> memberMap = new HashMap<>();
            memberMap.put("id", member.getId());
            memberMap.put("workspaceId", member.getWorkspaceId());
            memberMap.put("userId", member.getUserId());
            memberMap.put("role", member.getRole());
            
            // 获取用户信息
            User user = userService.getById(member.getUserId());
            if (user != null) {
                memberMap.put("username", user.getName());
                memberMap.put("email", user.getEmail());
            }
            
            result.add(memberMap);
        }
        
        return result;
    }
    
    @Override
    public boolean hasAccess(Long userId, Long workspaceId, String requiredRole) {
        WorkspaceMember member = workspaceMemberMapper.selectByWorkspaceIdAndUserId(workspaceId, userId);
        if (member == null) {
            return false;
        }
        
        // 角色权限检查
        if ("owner".equals(member.getRole())) {
            return true;
        }
        if ("admin".equals(member.getRole()) && !"owner".equals(requiredRole)) {
            return true;
        }
        if ("member".equals(member.getRole()) && ("member".equals(requiredRole) || "viewer".equals(requiredRole))) {
            return true;
        }
        if ("viewer".equals(member.getRole()) && "viewer".equals(requiredRole)) {
            return true;
        }
        
        return false;
    }
}
