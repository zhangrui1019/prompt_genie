package com.promptgenie.controller;

import com.promptgenie.entity.Prompt;
import com.promptgenie.entity.User;
import com.promptgenie.service.PlaygroundService;
import com.promptgenie.service.PromptService;
import com.promptgenie.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class ExternalPromptController {

    @Autowired
    private UserService userService;

    @Autowired
    private PromptService promptService;

    @Autowired
    private PlaygroundService playgroundService;

    @PostMapping("/run/{promptId}")
    public ResponseEntity<?> runPrompt(
            @PathVariable Long promptId,
            @RequestHeader(value = "X-API-KEY", required = false) String apiKeyHeader,
            @RequestBody Map<String, Object> body) {
        
        // 1. Validate API Key
        if (apiKeyHeader == null || apiKeyHeader.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing API Key"));
        }
        
        User user = userService.findByApiKey(apiKeyHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid API Key"));
        }

        // 2. Check Plan (Freemium logic)
        // If plan is not 'pro', deny access to API
        if (!"pro".equalsIgnoreCase(user.getPlan())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "API access is available only for Pro users.",
                "upgrade_url", "/profile"
            ));
        }

        // 3. Get Prompt
        Prompt prompt = promptService.getById(promptId);
        if (prompt == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Prompt not found"));
        }

        // 4. Check Ownership (or public access?)
        // Strict mode: Only run your own prompts
        if (!prompt.getUserId().equals(user.getId())) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You do not have permission to access this prompt"));
        }

        // 5. Run Prompt
        try {
            Map<String, Object> variables = (Map<String, Object>) body.get("variables");
            String result = playgroundService.runPrompt(prompt.getContent(), variables);
            
            // Track usage
            promptService.incrementUsage(promptId);
            
            return ResponseEntity.ok(Map.of(
                "result", result,
                "prompt_id", promptId,
                "model", "qwen-turbo"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
