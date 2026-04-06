package com.promptgenie.service;

import com.promptgenie.entity.AuditLog;
import com.promptgenie.service.UserContextService;
import com.promptgenie.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

// 暂时注释掉Aspect相关代码，因为缺少AspectJ依赖
@Component
public class AuditLogAspect {
    
    @Autowired
    private UserContextService userContextService;
    
    @Autowired
    private AuditLogService auditLogService;
    
    // Pointcut for all controller methods
    // @Pointcut("execution(* com.promptgenie.*.controller.*.*(..))")
    // public void controllerMethods() {}
    
    // @AfterReturning("controllerMethods()")
    public void logAfterReturning(Object joinPoint) {
        // Get current user
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            return; // Skip if no user
        }
        
        // Get request information
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return; // Skip if no request
        }
        
        HttpServletRequest request = attributes.getRequest();
        String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        
        // Determine action and resource type based on method name and class
        // String methodName = joinPoint.getSignature().getName();
        // String className = joinPoint.getTarget().getClass().getSimpleName();
        
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setIpAddress(ipAddress);
        auditLog.setUserAgent(userAgent);
        
        // Set action and resource type based on controller and method
        // if (className.contains("PromptController")) {
        //     auditLog.setResourceType("PROMPT");
        //     if (methodName.startsWith("create")) {
        //         auditLog.setAction("CREATE_PROMPT");
        //     } else if (methodName.startsWith("update")) {
        //         auditLog.setAction("UPDATE_PROMPT");
        //     } else if (methodName.startsWith("delete")) {
        //         auditLog.setAction("DELETE_PROMPT");
        //     } else if (methodName.startsWith("move")) {
        //         auditLog.setAction("MOVE_PROMPT");
        //     }
        // } else if (className.contains("ChainController")) {
        //     auditLog.setResourceType("CHAIN");
        //     if (methodName.startsWith("create")) {
        //         auditLog.setAction("CREATE_CHAIN");
        //     } else if (methodName.startsWith("update")) {
        //         auditLog.setAction("UPDATE_CHAIN");
        //     } else if (methodName.startsWith("delete")) {
        //         auditLog.setAction("DELETE_CHAIN");
        //     } else if (methodName.startsWith("move")) {
        //         auditLog.setAction("MOVE_CHAIN");
        //     }
        // } else if (className.contains("KnowledgeController")) {
        //     auditLog.setResourceType("KNOWLEDGE_BASE");
        //     if (methodName.startsWith("create")) {
        //         auditLog.setAction("CREATE_KNOWLEDGE_BASE");
        //     } else if (methodName.startsWith("delete")) {
        //         auditLog.setAction("DELETE_KNOWLEDGE_BASE");
        //     } else if (methodName.startsWith("move")) {
        //         auditLog.setAction("MOVE_KNOWLEDGE_BASE");
        //     }
        // } else if (className.contains("WorkspaceController")) {
        //     auditLog.setResourceType("WORKSPACE");
        //     if (methodName.startsWith("create")) {
        //         auditLog.setAction("CREATE_WORKSPACE");
        //     } else if (methodName.startsWith("addMember")) {
        //         auditLog.setAction("ADD_WORKSPACE_MEMBER");
        //     } else if (methodName.startsWith("removeMember")) {
        //         auditLog.setAction("REMOVE_WORKSPACE_MEMBER");
        //     } else if (methodName.startsWith("updateMemberRole")) {
        //         auditLog.setAction("UPDATE_WORKSPACE_MEMBER_ROLE");
        //     }
        // }
        
        // auditLogService.save(auditLog);
    }
}
