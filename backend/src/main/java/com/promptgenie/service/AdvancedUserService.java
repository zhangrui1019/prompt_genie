package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdvancedUserService {
    
    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final Map<String, Role> roles = new ConcurrentHashMap<>();
    private final Map<String, List<String>> userRoles = new ConcurrentHashMap<>();
    private final Map<String, List<String>> rolePermissions = new ConcurrentHashMap<>();
    
    // 初始化高级用户服务
    public void init() {
        // 初始化默认角色
        initDefaultRoles();
        
        // 初始化默认用户
        initDefaultUsers();
    }
    
    // 初始化默认角色
    private void initDefaultRoles() {
        // 创建默认角色
        Role adminRole = new Role(
            "admin",
            "Administrator",
            "Full access to all features",
            System.currentTimeMillis()
        );
        roles.put(adminRole.getId(), adminRole);
        
        Role userRole = new Role(
            "user",
            "User",
            "Basic access to features",
            System.currentTimeMillis()
        );
        roles.put(userRole.getId(), userRole);
        
        Role guestRole = new Role(
            "guest",
            "Guest",
            "Limited access to features",
            System.currentTimeMillis()
        );
        roles.put(guestRole.getId(), guestRole);
        
        // 分配权限
        List<String> adminPermissions = Arrays.asList(
            "user:create", "user:read", "user:update", "user:delete",
            "model:create", "model:read", "model:update", "model:delete",
            "content:create", "content:read", "content:update", "content:delete",
            "api:create", "api:read", "api:update", "api:delete",
            "monitoring:read", "monitoring:manage",
            "deployment:create", "deployment:read", "deployment:update", "deployment:delete",
            "data:read", "data:manage"
        );
        rolePermissions.put("admin", adminPermissions);
        
        List<String> userPermissions = Arrays.asList(
            "user:read", "user:update",
            "model:read", "model:use",
            "content:read", "content:create", "content:update",
            "api:read", "api:use",
            "monitoring:read",
            "data:read"
        );
        rolePermissions.put("user", userPermissions);
        
        List<String> guestPermissions = Arrays.asList(
            "model:use",
            "content:read",
            "api:use"
        );
        rolePermissions.put("guest", guestPermissions);
    }
    
    // 初始化默认用户
    private void initDefaultUsers() {
        // 创建管理员用户
        User adminUser = new User(
            "admin",
            "Admin User",
            "admin@example.com",
            "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", // password: admin123
            System.currentTimeMillis(),
            "active"
        );
        users.put(adminUser.getId(), adminUser);
        
        // 分配角色
        addRoleToUser("admin", "admin");
        
        // 创建普通用户
        User regularUser = new User(
            "user1",
            "Regular User",
            "user1@example.com",
            "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", // password: admin123
            System.currentTimeMillis(),
            "active"
        );
        users.put(regularUser.getId(), regularUser);
        
        // 分配角色
        addRoleToUser("user1", "user");
    }
    
    // 创建用户
    public User createUser(String id, String name, String email, String password) {
        User user = new User(
            id,
            name,
            email,
            password,
            System.currentTimeMillis(),
            "active"
        );
        users.put(id, user);
        
        // 分配默认角色
        addRoleToUser(id, "user");
        
        return user;
    }
    
    // 更新用户
    public User updateUser(String id, String name, String email, String password) {
        User user = users.get(id);
        if (user != null) {
            if (name != null) user.setName(name);
            if (email != null) user.setEmail(email);
            if (password != null) user.setPassword(password);
            user.setLastUpdatedAt(System.currentTimeMillis());
        }
        return user;
    }
    
    // 删除用户
    public void deleteUser(String id) {
        users.remove(id);
        userRoles.remove(id);
    }
    
    // 获取用户
    public User getUser(String id) {
        return users.get(id);
    }
    
    // 获取所有用户
    public List<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }
    
    // 按状态获取用户
    public List<User> getUsersByStatus(String status) {
        return users.values().stream()
            .filter(user -> status.equals(user.getStatus()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 搜索用户
    public List<User> searchUsers(String query) {
        return users.values().stream()
            .filter(user -> 
                user.getName().contains(query) || 
                user.getEmail().contains(query)
            )
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 创建角色
    public Role createRole(String id, String name, String description) {
        Role role = new Role(
            id,
            name,
            description,
            System.currentTimeMillis()
        );
        roles.put(id, role);
        return role;
    }
    
    // 更新角色
    public Role updateRole(String id, String name, String description) {
        Role role = roles.get(id);
        if (role != null) {
            if (name != null) role.setName(name);
            if (description != null) role.setDescription(description);
            role.setLastUpdatedAt(System.currentTimeMillis());
        }
        return role;
    }
    
    // 删除角色
    public void deleteRole(String id) {
        roles.remove(id);
        rolePermissions.remove(id);
        
        // 从所有用户中移除该角色
        for (Map.Entry<String, List<String>> entry : userRoles.entrySet()) {
            entry.getValue().remove(id);
        }
    }
    
    // 获取角色
    public Role getRole(String id) {
        return roles.get(id);
    }
    
    // 获取所有角色
    public List<Role> getAllRoles() {
        return new ArrayList<>(roles.values());
    }
    
    // 添加角色到用户
    public void addRoleToUser(String userId, String roleId) {
        List<String> userRoleList = userRoles.computeIfAbsent(userId, k -> new ArrayList<>());
        if (!userRoleList.contains(roleId)) {
            userRoleList.add(roleId);
        }
    }
    
    // 从用户中移除角色
    public void removeRoleFromUser(String userId, String roleId) {
        List<String> userRoleList = userRoles.get(userId);
        if (userRoleList != null) {
            userRoleList.remove(roleId);
        }
    }
    
    // 获取用户的角色
    public List<Role> getUserRoles(String userId) {
        List<String> roleIds = userRoles.getOrDefault(userId, Collections.emptyList());
        List<Role> userRolesList = new ArrayList<>();
        for (String roleId : roleIds) {
            Role role = roles.get(roleId);
            if (role != null) {
                userRolesList.add(role);
            }
        }
        return userRolesList;
    }
    
    // 添加权限到角色
    public void addPermissionToRole(String roleId, String permission) {
        List<String> permissions = rolePermissions.computeIfAbsent(roleId, k -> new ArrayList<>());
        if (!permissions.contains(permission)) {
            permissions.add(permission);
        }
    }
    
    // 从角色中移除权限
    public void removePermissionFromRole(String roleId, String permission) {
        List<String> permissions = rolePermissions.get(roleId);
        if (permissions != null) {
            permissions.remove(permission);
        }
    }
    
    // 获取角色的权限
    public List<String> getRolePermissions(String roleId) {
        return rolePermissions.getOrDefault(roleId, Collections.emptyList());
    }
    
    // 检查用户是否有某个权限
    public boolean checkUserPermission(String userId, String permission) {
        List<String> userRoleList = userRoles.getOrDefault(userId, Collections.emptyList());
        for (String roleId : userRoleList) {
            List<String> permissions = rolePermissions.getOrDefault(roleId, Collections.emptyList());
            if (permissions.contains(permission)) {
                return true;
            }
        }
        return false;
    }
    
    // 更新用户状态
    public void updateUserStatus(String userId, String status) {
        User user = users.get(userId);
        if (user != null) {
            user.setStatus(status);
            user.setLastUpdatedAt(System.currentTimeMillis());
        }
    }
    
    // 用户类
    public static class User {
        private String id;
        private String name;
        private String email;
        private String password;
        private long createdAt;
        private long lastUpdatedAt;
        private String status; // active, inactive, deleted
        
        public User(String id, String name, String email, String password, long createdAt, String status) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.password = password;
            this.createdAt = createdAt;
            this.lastUpdatedAt = createdAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getLastUpdatedAt() { return lastUpdatedAt; }
        public void setLastUpdatedAt(long lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // 角色类
    public static class Role {
        private String id;
        private String name;
        private String description;
        private long createdAt;
        private long lastUpdatedAt;
        
        public Role(String id, String name, String description, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.createdAt = createdAt;
            this.lastUpdatedAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getLastUpdatedAt() { return lastUpdatedAt; }
        public void setLastUpdatedAt(long lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
    }
}