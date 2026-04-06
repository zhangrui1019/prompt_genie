package com.promptgenie.api.controller;

import com.promptgenie.entity.AuditLog;
import com.promptgenie.service.AuditLogService;
import com.promptgenie.service.UserContextService;
import com.promptgenie.workspace.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private UserContextService userContextService;
    
    @Autowired
    private WorkspaceService workspaceService;
    
    @GetMapping("/workspace/{workspaceId}")
    public List<AuditLog> getWorkspaceAuditLogs(@PathVariable Long workspaceId) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        if (!workspaceService.hasAccess(userId, workspaceId, "viewer")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to workspace");
        }
        
        return auditLogService.getByWorkspaceId(workspaceId);
    }
    
    @GetMapping("/resource/{resourceType}/{resourceId}")
    public List<AuditLog> getResourceAuditLogs(@PathVariable String resourceType, @PathVariable Long resourceId) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        return auditLogService.getByResourceIdAndType(resourceId, resourceType);
    }
    
    @GetMapping("/user/{userId}")
    public List<AuditLog> getUserAuditLogs(@PathVariable Long userId) {
        Long currentUserId = userContextService.getCurrentUserId();
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        // Only allow users to see their own audit logs
        if (!currentUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        return auditLogService.getByUserId(userId);
    }
}