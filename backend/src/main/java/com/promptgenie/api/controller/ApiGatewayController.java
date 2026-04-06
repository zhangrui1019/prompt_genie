package com.promptgenie.api.controller;

import com.promptgenie.prompt.entity.Prompt;
import com.promptgenie.auth.entity.User;
import com.promptgenie.prompt.service.PromptService;
import com.promptgenie.auth.service.UserService;
import com.promptgenie.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class ApiGatewayController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PromptService promptService;
    
    @Autowired
    private UserContextService userContextService;
    
    // Simple in-memory rate limiter (for MVP)
    private final Map<String, Long> apiKeyLastCall = new ConcurrentHashMap<>();
    private final Map<String, Integer> apiKeyQpsLimit = new ConcurrentHashMap<>();
    
    @PostMapping("/run/{promptId}")
    public Map<String, Object> runPrompt(@PathVariable Long promptId, @RequestBody Map<String, Object> request, @RequestHeader("Authorization") String authHeader) {
        // Validate API key
        String apiKey = extractApiKey(authHeader);
        if (apiKey == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid API key");
        }
        
        // Check rate limit
        if (!checkRateLimit(apiKey)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded");
        }
        
        // Validate user
        User user = userService.findByApiKey(apiKey);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid API key");
        }
        
        // Validate prompt
        Prompt prompt = promptService.getById(promptId);
        if (prompt == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Prompt not found");
        }
        
        // Check access (prompt must be owned by user or public)
        if (!prompt.getIsPublic() && !prompt.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        // Extract variables from request
        Map<String, Object> variables = (Map<String, Object>) request.get("variables");
        if (variables == null) {
            variables = Map.of();
        }
        
        // Run prompt (simplified for MVP)
        // In a real implementation, this would call the same service as the playground
        String result = "Prompt executed successfully"; // Placeholder
        
        // Return result
        return Map.of(
            "result", result,
            "promptId", promptId,
            "userId", user.getId()
        );
    }
    
    @PostMapping("/api-keys/generate")
    public Map<String, String> generateApiKey() {
        // Get current user
        User user = getCurrentUser();
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        // Generate new API key
        String apiKey = userService.generateApiKey();
        user.setApiKey(apiKey);
        userService.updateById(user);
        
        return Map.of("apiKey", apiKey);
    }
    
    @PostMapping("/api-keys/revoke")
    public void revokeApiKey() {
        // Get current user
        User user = getCurrentUser();
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        // Revoke API key
        user.setApiKey(null);
        userService.updateById(user);
    }
    
    @PostMapping("/api-keys/set-qps")
    public void setQpsLimit(@RequestBody Map<String, Integer> request) {
        // Get current user
        User user = getCurrentUser();
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        // Set QPS limit
        Integer qps = request.get("qps");
        if (qps != null && qps > 0) {
            apiKeyQpsLimit.put(user.getApiKey(), qps);
        }
    }
    
    private String extractApiKey(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }
    
    private boolean checkRateLimit(String apiKey) {
        // Simple rate limiting (1 request per second by default)
        long now = System.currentTimeMillis();
        long lastCall = apiKeyLastCall.getOrDefault(apiKey, 0L);
        int qpsLimit = apiKeyQpsLimit.getOrDefault(apiKey, 1);
        long minInterval = 1000 / qpsLimit;
        
        if (now - lastCall < minInterval) {
            return false;
        }
        
        apiKeyLastCall.put(apiKey, now);
        return true;
    }
    
    private User getCurrentUser() {
        return userContextService.getCurrentUser();
    }
}