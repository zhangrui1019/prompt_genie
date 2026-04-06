package com.promptgenie.auth.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.auth.entity.Role;
import com.promptgenie.auth.entity.RolePermission;
import com.promptgenie.auth.mapper.RoleMapper;
import com.promptgenie.auth.mapper.RolePermissionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.List;

@Service
public class RoleService extends ServiceImpl<RoleMapper, Role> {
    
    @Autowired
    private RoleMapper roleMapper;
    
    @Autowired
    private RolePermissionMapper rolePermissionMapper;
    
    @Override
    public boolean removeById(Serializable id) {
        // 删除角色权限关系
        rolePermissionMapper.deleteByRoleId((Long) id);
        // 删除角色
        return super.removeById(id);
    }
    
    public void addPermissionToRole(Long roleId, Long permissionId) {
        // 检查是否已存在
        RolePermission existing = rolePermissionMapper.selectByRoleIdAndPermissionId(roleId, permissionId);
        if (existing == null) {
            RolePermission rolePermission = new RolePermission();
            rolePermission.setRoleId(roleId);
            rolePermission.setPermissionId(permissionId);
            rolePermissionMapper.insert(rolePermission);
        }
    }
    
    public void removePermissionFromRole(Long roleId, Long permissionId) {
        rolePermissionMapper.deleteByRoleIdAndPermissionId(roleId, permissionId);
    }
    
    public List<com.promptgenie.auth.entity.Permission> getRolePermissions(Long roleId) {
        return rolePermissionMapper.selectPermissionsByRoleId(roleId);
    }
    
    public List<Role> getRolesByUserId(Long userId) {
        return roleMapper.selectByUserId(userId);
    }
    
    public Role getRoleByName(String name) {
        return roleMapper.selectByName(name);
    }
    
    public List<Role> getAllRoles() {
        return roleMapper.selectList(null);
    }
    
    public Role createRole(String name, String description) {
        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        save(role);
        return role;
    }
    
    public void updateRole(Long id, String name, String description) {
        Role role = getById(id);
        if (role != null) {
            role.setName(name);
            role.setDescription(description);
            updateById(role);
        }
    }
}
