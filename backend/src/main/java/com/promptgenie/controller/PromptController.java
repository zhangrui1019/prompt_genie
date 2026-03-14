package com.promptgenie.controller;

import com.promptgenie.entity.Prompt;
import com.promptgenie.entity.PromptVersion;
import com.promptgenie.dto.PromptRequest;
import com.promptgenie.service.PromptService;
import com.promptgenie.service.UserContextService;
import com.promptgenie.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prompts")
public class PromptController {
    
    @Autowired
    private PromptService promptService;

    @Autowired
    private UserContextService userContextService;

    @Autowired
    private WorkspaceService workspaceService;

    @GetMapping
    public List<Prompt> getAll(@RequestParam(required = false) Long workspaceId) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
            @PutMapping("/{id}/move")
    public void movePrompt(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
            @PostMapping("/{id}/fork")
    public Prompt forkPrompt(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        Long targetWorkspaceId = request.get("workspaceId");
        // targetWorkspaceId can be null (fork to personal)
        
        if (targetWorkspaceId != null) {
             if (!workspaceService.hasAccess(userId, targetWorkspaceId, "editor")) {
                 throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Write access denied to target workspace");
             }
        }
        
        return promptService.forkPrompt(id, userId, targetWorkspaceId);
    }
}
        
        Long targetWorkspaceId = request.get("workspaceId");
        if (targetWorkspaceId == null) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target workspace ID required");
        }
        
        Prompt prompt = promptService.getById(id);
        if (prompt == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        
        // 1. Check ownership (must be owner of the prompt)
        if (!prompt.getUserId().equals(userId)) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can move this prompt");
        }
        
        // 2. Check write access to target workspace
        if (!workspaceService.hasAccess(userId, targetWorkspaceId, "editor")) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have write access to the target workspace");
        }
        
        promptService.movePromptToWorkspace(id, targetWorkspaceId);
    }
}
        
        if (workspaceId != null) {
            // RBAC check
            if (!workspaceService.hasAccess(userId, workspaceId, "viewer")) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to workspace");
            }
            return promptService.getByWorkspaceId(workspaceId);
        }
        
        return promptService.getAll(userId);
    }
    
    @GetMapping("/tags")
    public List<String> getTags() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        return promptService.getAllTags(userId);
    }

    @GetMapping("/public")
    public List<Prompt> getPublicPrompts(
            @RequestParam(required = false) String search) {
        Long userId = userContextService.getCurrentUserId(); // Optional for public prompts
        return promptService.getPublicPrompts(search, userId);
    }

    @GetMapping("/user/{userId}/public")
    public List<Prompt> getUserPublicPrompts(@PathVariable Long userId) {
        return promptService.getPublicPromptsByUser(userId);
    }

    @PostMapping("/{id}/like")
    public Map<String, Boolean> likePrompt(@PathVariable Long id) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        boolean liked = promptService.toggleLike(id, userId);
        return Map.of("liked", liked);
    }

    @PostMapping("/{id}/use")
    public void usePrompt(@PathVariable Long id) {
        promptService.incrementUsage(id);
    }

    @PostMapping("/{id}/fork")
    public Prompt forkPrompt(@PathVariable Long id) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        return promptService.forkPrompt(id, userId);
    }

    @GetMapping("/{id}/versions")
    public List<PromptVersion> getVersions(@PathVariable Long id) {
        return promptService.getVersions(id);
    }

    @PostMapping("/{id}/versions")
    public PromptVersion createVersion(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String note = body.get("note");
        return promptService.createVersion(id, note);
    }

    @PostMapping("/{id}/restore/{versionId}")
    public Prompt restoreVersion(@PathVariable Long id, @PathVariable Long versionId) {
        return promptService.restoreVersion(id, versionId);
    }
    
    @PostMapping
    public Prompt createPrompt(@RequestBody Prompt prompt) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        if (prompt.getWorkspaceId() != null) {
            if (!workspaceService.hasAccess(userId, prompt.getWorkspaceId(), "editor")) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Write access denied to workspace");
            }
        }
        
        prompt.setUserId(userId);
        return promptService.createPrompt(prompt);
    }
    
    @GetMapping("/{id}")
    public Prompt getPrompt(@PathVariable Long id) {
        Long userId = userContextService.getCurrentUserId();
        Prompt prompt = promptService.getById(id);
        
        if (prompt == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Prompt not found");
        }
        
        // RBAC Check
        if (prompt.getWorkspaceId() != null) {
             if (userId != null && workspaceService.hasAccess(userId, prompt.getWorkspaceId(), "viewer")) {
                 return prompt;
             }
        }
        
        if (prompt.getIsPublic() || (userId != null && prompt.getUserId().equals(userId))) {
            return prompt;
        }
        
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }
    
    @PutMapping("/{id}")
    public Prompt updatePrompt(@PathVariable Long id, @RequestBody Prompt prompt) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        Prompt existing = promptService.getById(id);
        if (existing == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        
        // RBAC
        if (existing.getWorkspaceId() != null) {
             if (!workspaceService.hasAccess(userId, existing.getWorkspaceId(), "editor")) {
                 throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Write access denied to workspace");
             }
        } else if (!existing.getUserId().equals(userId)) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your prompt");
        }

        prompt.setId(id);
        return promptService.updatePrompt(prompt);
    }
    
    @DeleteMapping("/{id}")
    public void deletePrompt(@PathVariable Long id) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        Prompt existing = promptService.getById(id);
        if (existing != null) {
            // RBAC
            if (existing.getWorkspaceId() != null) {
                 if (!workspaceService.hasAccess(userId, existing.getWorkspaceId(), "owner")) { // Only owner can delete
                     throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Delete access denied to workspace");
                 }
            } else if (!existing.getUserId().equals(userId)) {
                 throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your prompt");
            }
        }
        
        promptService.removeById(id);
    }
}
