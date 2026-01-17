package com.promptgenie.controller;

import com.promptgenie.entity.Prompt;
import com.promptgenie.service.PromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    
    @PostMapping
    public Prompt createPrompt(@RequestBody Prompt prompt) {
        promptService.save(prompt);
        return prompt;
    }
    
    @GetMapping("/{id}")
    public Prompt getPrompt(@PathVariable Long id) {
        return promptService.getById(id);
    }
    
    @PutMapping("/{id}")
    public Prompt updatePrompt(@PathVariable Long id, @RequestBody Prompt prompt) {
        prompt.setId(id);
        promptService.updateById(prompt);
        return prompt;
    }
    
    @DeleteMapping("/{id}")
    public void deletePrompt(@PathVariable Long id) {
        promptService.removeById(id);
    }
}
