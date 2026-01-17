package com.promptgenie.controller;

import com.promptgenie.entity.Prompt;
import com.promptgenie.entity.PromptVersion;
import com.promptgenie.service.PromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prompts")
@CrossOrigin(origins = "*") // Allow frontend access
public class PromptController {
    
    @Autowired
    private PromptService promptService;

    @GetMapping
    public List<Prompt> getPrompts(
            @RequestParam(required = false) Long userId, // In real app, get from auth context
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag) {
        
        if (userId == null) {
            // Temporary: for testing, if no userId, return all (not secure but useful for dev)
            // Or better, return empty or throw.
             return promptService.list();
        }
        
        if (search != null || tag != null) {
            return promptService.searchPrompts(userId, search, tag);
        }
        return promptService.getPromptsByUser(userId);
    }
    
    @GetMapping("/tags")
    public List<String> getTags(@RequestParam Long userId) {
        return promptService.getAllTags(userId);
    }

    @GetMapping("/public")
    public List<Prompt> getPublicPrompts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long userId) {
        return promptService.getPublicPrompts(search, userId);
    }

    @PostMapping("/{id}/like")
    public Map<String, Boolean> likePrompt(@PathVariable Long id, @RequestParam Long userId) {
        boolean liked = promptService.toggleLike(id, userId);
        return Map.of("liked", liked);
    }

    @PostMapping("/{id}/use")
    public void usePrompt(@PathVariable Long id) {
        promptService.incrementUsage(id);
    }

    @PostMapping("/{id}/fork")
    public Prompt forkPrompt(@PathVariable Long id, @RequestParam Long userId) {
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
        promptService.createPrompt(prompt);
        return prompt;
    }
    
    @GetMapping("/{id}")
    public Prompt getPrompt(@PathVariable Long id) {
        return promptService.getById(id);
    }
    
    @PutMapping("/{id}")
    public Prompt updatePrompt(@PathVariable Long id, @RequestBody Prompt prompt) {
        prompt.setId(id);
        promptService.updatePrompt(prompt);
        return prompt;
    }
    
    @DeleteMapping("/{id}")
    public void deletePrompt(@PathVariable Long id) {
        promptService.removeById(id);
    }
}
