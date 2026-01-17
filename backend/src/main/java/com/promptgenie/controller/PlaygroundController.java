package com.promptgenie.controller;

import com.promptgenie.entity.PlaygroundHistory;
import com.promptgenie.entity.User;
import com.promptgenie.service.PlaygroundService;
import com.promptgenie.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playground")
@CrossOrigin(origins = "*")
public class PlaygroundController {

    @Autowired
    private PlaygroundService playgroundService;

    @Autowired
    private UserService userService;

    @PostMapping("/run")
    public Map<String, String> runPrompt(@RequestBody Map<String, Object> request) {
        String prompt = (String) request.get("prompt");
        Map<String, Object> variables = (Map<String, Object>) request.get("variables");
        String modelType = (String) request.getOrDefault("modelType", "text");
        String modelName = (String) request.getOrDefault("modelName", "");
        Map<String, Object> parameters = (Map<String, Object>) request.get("parameters");
        
        Long userId = getCurrentUserId();
        String result = playgroundService.runPrompt(prompt, variables, modelType, modelName, parameters, userId);
        return Map.of("result", result);
    }

    @GetMapping("/history")
    public List<PlaygroundHistory> getHistory() {
        Long userId = getCurrentUserId();
        if (userId == null) return List.of();
        return playgroundService.getHistory(userId);
    }

    @GetMapping("/usage-stats")
    public Map<String, Object> getUsageStats() {
        Long userId = getCurrentUserId();
        if (userId == null) return Map.of();
        return playgroundService.getUsageStats(userId);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
            User user = userService.findByEmail(auth.getName());
            if (user != null) return user.getId();
        }
        return null;
    }
}
