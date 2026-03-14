package com.promptgenie.controller;

import com.promptgenie.config.GenieConfig;
import com.promptgenie.config.ProvidersConfig;
import com.promptgenie.entity.PlaygroundHistory;
import com.promptgenie.entity.User;
import com.promptgenie.service.PlaygroundService;
import com.promptgenie.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/playground")
@CrossOrigin(origins = "*")
public class PlaygroundController {

    @Autowired
    private PlaygroundService playgroundService;

    @Autowired
    private UserService userService;

    @Autowired
    private GenieConfig genieConfig;
    
    @Autowired
    private ProvidersConfig providersConfig;

    @GetMapping("/models")
    public Map<String, List<Map<String, String>>> getModels() {
        Map<String, Map<String, String>> configured = genieConfig.getModels();
        Map<String, Map<String, String>> models = new LinkedHashMap<>();
        
        if (configured != null && !configured.isEmpty()) {
            for (Map.Entry<String, Map<String, String>> entry : configured.entrySet()) {
                models.put(entry.getKey(), new LinkedHashMap<>(entry.getValue()));
            }
        } else {
            models = defaultModels();
        }

        // Merge OpenAI compatible models
        if (providersConfig.getOpenai() != null) {
            for (Map.Entry<String, ProvidersConfig.OpenAiConfig> entry : providersConfig.getOpenai().entrySet()) {
                String providerName = entry.getKey();
                ProvidersConfig.OpenAiConfig config = entry.getValue();
                String type = config.getModelType() != null ? config.getModelType() : "text";
                
                models.putIfAbsent(type, new LinkedHashMap<>());
                Map<String, String> typeModels = models.get(type);
                
                if (config.getModels() != null) {
                    for (String model : config.getModels()) {
                        typeModels.put(model, model + " (" + providerName + ")");
                    }
                }
            }
        }

        return models.entrySet().stream().collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> e.getValue().entrySet().stream()
                        .map(m -> Map.of("id", m.getKey(), "name", m.getValue()))
                        .collect(Collectors.toList())
        ));
    }

    private Map<String, Map<String, String>> defaultModels() {
        Map<String, Map<String, String>> models = new LinkedHashMap<>();

        Map<String, String> text = new LinkedHashMap<>();
        text.put("qwen-turbo", "Qwen Turbo");
        text.put("qwen-plus", "Qwen Plus");
        text.put("qwen-max", "Qwen Max");
        models.put("text", text);

        Map<String, String> image = new LinkedHashMap<>();
        image.put("wanx-v1", "Wanx V1");
        image.put("wanx-sketch-to-image-v1", "Wanx Sketch");
        models.put("image", image);

        Map<String, String> video = new LinkedHashMap<>();
        video.put("wan2.6-t2v", "Wan 2.6 (1080P)");
        video.put("wanx2.1-t2v-turbo", "Wanx 2.1 Turbo (720P)");
        video.put("wanx2.1-t2v-plus", "Wanx 2.1 Plus (720P)");
        models.put("video", video);

        return models;
    }

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
