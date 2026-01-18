package com.promptgenie.controller;

import com.promptgenie.entity.Prompt;
import com.promptgenie.entity.PromptVersion;
import com.promptgenie.dto.PromptRequest;
import com.promptgenie.service.PromptService;
import com.promptgenie.service.UserContextService;
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

    @GetMapping
    public List<Prompt> getPrompts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag) {
        
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        if (search != null || tag != null) {
            return promptService.searchPrompts(userId, search, tag);
        }
        return promptService.getPromptsByUser(userId);
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
    public Prompt createPrompt(@Valid @RequestBody PromptRequest request) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        Prompt prompt = new Prompt();
        prompt.setUserId(userId);
        prompt.setTitle(request.getTitle());
        prompt.setContent(request.getContent());
        prompt.setVariables(request.getVariables());
        prompt.setTags(request.getTags());
        if (request.getIsPublic() != null) {
            prompt.setIsPublic(request.getIsPublic());
        } else {
            prompt.setIsPublic(false);
        }
        
        promptService.createPrompt(prompt);
        return prompt;
    }
    
    @GetMapping("/{id}")
    public Prompt getPrompt(@PathVariable Long id) {
        return promptService.getById(id);
    }
    
    @PutMapping("/{id}")
    public Prompt updatePrompt(@PathVariable Long id, @Valid @RequestBody PromptRequest request) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        Prompt existing = promptService.getById(id);
        if (existing == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Prompt not found");
        }
        
        if (!existing.getUserId().equals(userId)) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your prompt");
        }
        
        existing.setTitle(request.getTitle());
        existing.setContent(request.getContent());
        existing.setVariables(request.getVariables());
        existing.setTags(request.getTags());
        if (request.getIsPublic() != null) {
            existing.setIsPublic(request.getIsPublic());
        }
        
        promptService.updatePrompt(existing);
        return existing;
    }
    
    @DeleteMapping("/{id}")
    public void deletePrompt(@PathVariable Long id) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        Prompt existing = promptService.getById(id);
        if (existing != null && !existing.getUserId().equals(userId)) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your prompt");
        }
        promptService.removeById(id);
    }
}
