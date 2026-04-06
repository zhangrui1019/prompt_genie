package com.promptgenie.prompt.controller;

import com.promptgenie.prompt.entity.Prompt;
import com.promptgenie.prompt.entity.PromptVersion;
import com.promptgenie.dto.PromptRequest;
import com.promptgenie.prompt.service.PromptService;
import com.promptgenie.service.UserContextService;
import com.promptgenie.service.QuotaService;
import com.promptgenie.workspace.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/prompts")
public class PromptController {
    
    @Autowired
    private PromptService promptService;

    @Autowired
    private UserContextService userContextService;

    @Autowired
    private WorkspaceService workspaceService;

    @GetMapping
    public List<Prompt> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String workspaceId) {
        try {
            System.out.println("Entering getAll method");
            Long userId = userContextService.getCurrentUserId();
            System.out.println("Got userId: " + userId);
            if (userId == null) {
                System.out.println("User not found");
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
            }
            
            if (workspaceId != null) {
                try {
                    Long wsId = Long.parseLong(workspaceId);
                    // RBAC check
                    if (!workspaceService.hasAccess(userId, wsId, "viewer")) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to workspace");
                    }
                    System.out.println("Getting prompts by workspace ID: " + wsId);
                    return promptService.getByWorkspaceId(wsId);
                } catch (NumberFormatException e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid workspace ID");
                }
            }
            
            // Handle search and tag parameters
            if (search != null || tag != null) {
                System.out.println("Searching prompts with search: " + search + ", tag: " + tag);
                return promptService.searchPrompts(userId, search, tag);
            }
            
            System.out.println("Getting all prompts for userId: " + userId);
            return promptService.getAll(userId);
        } catch (ResponseStatusException e) {
            System.err.println("ResponseStatusException in getAll: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Error in getAll: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to load prompts");
        }
    }

    @PutMapping("/{id}/move")
    public void movePrompt(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
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

    @PostMapping("/{id}/fork")
    public Prompt forkPrompt(@PathVariable Long id, @RequestBody(required = false) Map<String, Long> request) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        Long targetWorkspaceId = request != null ? request.get("workspaceId") : null;
        
        if (targetWorkspaceId != null) {
             if (!workspaceService.hasAccess(userId, targetWorkspaceId, "editor")) {
                 throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Write access denied to target workspace");
             }
        }
        
        return promptService.forkPrompt(id, userId, targetWorkspaceId);
    }
    
    @GetMapping("/tags")
    public List<String> getTags() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             return promptService.getAllTags(null);
        }
        return promptService.getAllTags(userId);
    }

    @GetMapping("/public")
    public List<Prompt> getPublicPrompts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String scene,
            @RequestParam(required = false) String assetType,
            @RequestParam(required = false, defaultValue = "new") String sort) {
        Long userId = userContextService.getCurrentUserId(); // Optional for public prompts
        return promptService.getPublicPrompts(search, category, scene, assetType, sort, userId);
    }

    @GetMapping("/public/catalog")
    public Map<String, Object> getPublicCatalog(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String scene) {
        return Map.of(
                "categories", promptService.getPublicCategories(),
                "scenes", promptService.getPublicScenes(category),
                "assetTypes", promptService.getPublicAssetTypes(category, scene)
        );
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
        if (Boolean.TRUE.equals(prompt.getIsPublic())) {
            prompt.setIsPublic(false);
            prompt.setStatus("SUBMITTED");
        }
        return promptService.createPrompt(prompt);
    }

    @PostMapping("/{id}/submit")
    public void submitForReview(@PathVariable Long id) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }

        Prompt prompt = promptService.getById(id);
        if (prompt == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        if (prompt.getWorkspaceId() != null) {
            if (!workspaceService.hasAccess(userId, prompt.getWorkspaceId(), "editor")) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Write access denied to workspace");
            }
        } else if (!prompt.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        prompt.setStatus("SUBMITTED");
        prompt.setIsPublic(false);
        promptService.updateById(prompt);
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
