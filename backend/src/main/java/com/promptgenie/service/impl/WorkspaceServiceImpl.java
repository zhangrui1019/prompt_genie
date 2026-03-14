package com.promptgenie.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.User;
import com.promptgenie.entity.Workspace;
import com.promptgenie.entity.WorkspaceMember;
import com.promptgenie.mapper.WorkspaceMapper;
import com.promptgenie.mapper.WorkspaceMemberMapper;
import com.promptgenie.service.UserService;
import com.promptgenie.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkspaceServiceImpl extends ServiceImpl<WorkspaceMapper, Workspace> implements WorkspaceService {

    @Autowired
    private WorkspaceMemberMapper memberMapper;

    @Autowired
    private UserService userService;

    @Override
    @Transactional
    public Workspace createWorkspace(Long userId, String name, String description) {
        Workspace workspace = new Workspace();
        workspace.setName(name);
        workspace.setDescription(description);
        workspace.setOwnerId(userId);
        workspace.setCreatedAt(LocalDateTime.now());
        workspace.setUpdatedAt(LocalDateTime.now());
        
        save(workspace);
        
        // Add owner as member with 'owner' role
        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspaceId(workspace.getId());
        member.setUserId(userId);
        member.setRole("owner");
        member.setCreatedAt(LocalDateTime.now());
        memberMapper.insert(member);
        
        return workspace;
    }

    @Override
    public List<Workspace> getUserWorkspaces(Long userId) {
        return baseMapper.selectByUserId(userId);
    }

    @Override
    public void addMember(Long workspaceId, String email, String role) {
        User user = userService.getByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found with email: " + email);
        }
        
        // Check if already member
        QueryWrapper<WorkspaceMember> query = new QueryWrapper<>();
        query.eq("workspace_id", workspaceId).eq("user_id", user.getId());
        if (memberMapper.selectCount(query) > 0) {
            throw new RuntimeException("User is already a member of this workspace");
        }
        
        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspaceId(workspaceId);
        member.setUserId(user.getId());
        member.setRole(role);
        member.setCreatedAt(LocalDateTime.now());
        memberMapper.insert(member);
    }

    @Override
    public void removeMember(Long workspaceId, Long userId) {
        QueryWrapper<WorkspaceMember> query = new QueryWrapper<>();
        query.eq("workspace_id", workspaceId).eq("user_id", userId);
        memberMapper.delete(query);
    }

    @Override
    public void updateMemberRole(Long workspaceId, Long userId, String role) {
        QueryWrapper<WorkspaceMember> query = new QueryWrapper<>();
        query.eq("workspace_id", workspaceId).eq("user_id", userId);
        WorkspaceMember member = memberMapper.selectOne(query);
        if (member != null) {
            member.setRole(role);
            memberMapper.updateById(member);
        }
    }

    @Override
    public List<WorkspaceMember> getMembers(Long workspaceId) {
        QueryWrapper<WorkspaceMember> query = new QueryWrapper<>();
        query.eq("workspace_id", workspaceId);
        return memberMapper.selectList(query);
    }

    @Override
    public boolean hasAccess(Long userId, Long workspaceId, String requiredRole) {
        QueryWrapper<WorkspaceMember> query = new QueryWrapper<>();
        query.eq("workspace_id", workspaceId).eq("user_id", userId);
        WorkspaceMember member = memberMapper.selectOne(query);
        
        if (member == null) return false;
        
        // Role hierarchy: owner > editor > viewer
        String role = member.getRole();
        if ("owner".equals(role)) return true;
        if ("editor".equals(role) && !"owner".equals(requiredRole)) return true;
        if ("viewer".equals(role) && "viewer".equals(requiredRole)) return true;
        
        return false;
    }
}
