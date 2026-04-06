package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.AuditLog;
import com.promptgenie.mapper.AuditLogMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService extends ServiceImpl<AuditLogMapper, AuditLog> {
    
    @Autowired
    private AuditLogMapper auditLogMapper;
    
    public List<AuditLog> getByWorkspaceId(Long workspaceId) {
        return auditLogMapper.selectByWorkspaceId(workspaceId);
    }
    
    public List<AuditLog> getByResourceIdAndType(Long resourceId, String resourceType) {
        return auditLogMapper.selectByResourceIdAndType(resourceId, resourceType);
    }
    
    public List<AuditLog> getByUserId(Long userId) {
        return auditLogMapper.selectByUserId(userId);
    }
}