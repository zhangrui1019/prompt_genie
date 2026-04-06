package com.promptgenie.workspace.controller;

import com.promptgenie.workspace.entity.Workspace;
import com.promptgenie.workspace.entity.WorkspaceMember;
import com.promptgenie.service.UserContextService;
import com.promptgenie.workspace.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workspaces")
@CrossOrigin(origins = "*")
public class WorkspaceController {

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private UserContextService userContextService;

    @PostMapping
    public Workspace createWorkspace(@RequestBody Map<String, String> request) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        
        return workspaceService.createWorkspace(userId, request.get("name"), request.get("description"));
    }

    @GetMapping
    public List<Workspace> getMyWorkspaces() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        
        return workspaceService.getUserWorkspaces(userId);
    }

    @GetMapping("/{id}/members")
    public List<Map<String, Object>> getMembers(@PathVariable Long id) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        
        if (!workspaceService.hasAccess(userId, id, "viewer")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return workspaceService.getMembers(id);
    }

    @PostMapping("/{id}/members")
    public void addMember(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        
        if (!workspaceService.hasAccess(userId, id, "owner")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owners can add members");
        }
        workspaceService.addMember(id, request.get("email"), request.get("role"));
    }

    @DeleteMapping("/{id}/members/{targetUserId}")
    public void removeMember(@PathVariable Long id, @PathVariable Long targetUserId) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        
        if (!workspaceService.hasAccess(userId, id, "owner")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owners can remove members");
        }
        workspaceService.removeMember(id, targetUserId);
    }
}
