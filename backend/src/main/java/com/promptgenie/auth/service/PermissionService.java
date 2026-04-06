package com.promptgenie.auth.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.auth.entity.Permission;
import com.promptgenie.auth.mapper.PermissionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PermissionService extends ServiceImpl<PermissionMapper, Permission> {
    
    @Autowired
    private PermissionMapper permissionMapper;
    
    public List<Permission> getPermissionsByModule(String module) {
        return permissionMapper.selectByModule(module);
    }
    
    public Permission getPermissionByCode(String code) {
        return permissionMapper.selectByCode(code);
    }
    
    public Permission createPermission(Permission permission) {
        save(permission);
        return permission;
    }
    
    public void updatePermission(Permission permission) {
        updateById(permission);
    }
    
    public void deletePermission(Long permissionId) {
        removeById(permissionId);
    }
    
    public List<Permission> getAllPermissions() {
        return list();
    }
}