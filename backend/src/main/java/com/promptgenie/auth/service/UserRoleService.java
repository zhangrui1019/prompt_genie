package com.promptgenie.auth.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.auth.entity.UserRole;
import com.promptgenie.auth.mapper.UserRoleMapper;
import com.promptgenie.auth.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserRoleService extends ServiceImpl<UserRoleMapper, UserRole> {
    
    @Autowired
    private UserRoleMapper userRoleMapper;
    
    @Autowired
    private RoleService roleService;
    
    public void assignRoleToUser(Long userId, Long roleId) {
        // 检查是否已存在
        UserRole existing = userRoleMapper.selectByUserIdAndRoleId(userId, roleId);
        if (existing == null) {
            UserRole userRole = new UserRole();
            userRole.setUserId(userId);
            userRole.setRoleId(roleId);
            save(userRole);
        }
    }
    
    public void removeRoleFromUser(Long userId, Long roleId) {
        userRoleMapper.deleteByUserIdAndRoleId(userId, roleId);
    }
    
    public List<Long> getUserRoleIds(Long userId) {
        List<UserRole> userRoles = userRoleMapper.selectByUserId(userId);
        List<Long> roleIds = new ArrayList<>();
        for (UserRole userRole : userRoles) {
            roleIds.add(userRole.getRoleId());
        }
        return roleIds;
    }
    
    public List<Long> getUserPermissionIds(Long userId) {
        List<Long> roleIds = getUserRoleIds(userId);
        List<Long> permissionIds = new ArrayList<>();
        
        for (Long roleId : roleIds) {
            List<com.promptgenie.auth.entity.Permission> permissions = roleService.getRolePermissions(roleId);
            for (com.promptgenie.auth.entity.Permission permission : permissions) {
                if (!permissionIds.contains(permission.getId())) {
                    permissionIds.add(permission.getId());
                }
            }
        }
        
        return permissionIds;
    }
    
    public boolean hasPermission(Long userId, String permissionCode) {
        List<Long> roleIds = getUserRoleIds(userId);
        for (Long roleId : roleIds) {
            List<com.promptgenie.auth.entity.Permission> permissions = roleService.getRolePermissions(roleId);
            for (com.promptgenie.auth.entity.Permission permission : permissions) {
                if (permissionCode.equals(permission.getCode())) {
                    return true;
                }
            }
        }
        return false;
    }
}
