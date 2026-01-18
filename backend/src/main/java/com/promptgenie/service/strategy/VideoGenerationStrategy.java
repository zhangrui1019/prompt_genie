package com.promptgenie.service.strategy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.promptgenie.config.GenieConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class VideoGenerationStrategy implements GenerationStrategy {

    @Value("${dashscope.api-key:}")
    private String apiKey;

    private final GenieConfig genieConfig;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public GenerationOutput generate(String prompt, String modelName, Map<String, Object> parameters) throws Exception {
        if (apiKey == null || apiKey.isEmpty()) {
            return GenerationOutput.builder()
                    .content("[Mock Video URL]")
                    .inputTokens(0)
                    .outputTokens(0)
                    .build();
        }

        String model = (modelName != null && !modelName.isEmpty()) ? modelName : "wanx2.1-t2v-turbo";
        String submitUrl = genieConfig.getVideoSubmitUrl();
        
        // 1. Prepare Request Body
        ObjectNode inputNode = objectMapper.createObjectNode();
        inputNode.put("prompt", prompt);
        
        ObjectNode paramsNode = objectMapper.createObjectNode();
        
        // Defaults
        String size = "1280*720";
        int duration = 5;
        boolean promptExtend = true;
        
        if (parameters != null) {
            if (parameters.containsKey("size")) size = (String) parameters.get("size");
            if (parameters.containsKey("duration")) duration = Integer.parseInt(String.valueOf(parameters.get("duration")));
            if (parameters.containsKey("prompt_extend")) promptExtend = Boolean.parseBoolean(String.valueOf(parameters.get("prompt_extend")));
        }
        
        paramsNode.put("size", size);
        paramsNode.put("duration", duration);
        paramsNode.put("prompt_extend", promptExtend);
        
        if (model.startsWith("wan2.6")) {
             String shotType = "single";
             if (parameters != null && parameters.containsKey("shot_type")) {
                 shotType = (String) parameters.get("shot_type");
             }
            paramsNode.put("shot_type", shotType);
        }
        
        ObjectNode bodyNode = objectMapper.createObjectNode();
        bodyNode.put("model", model);
        bodyNode.set("input", inputNode);
        bodyNode.set("parameters", paramsNode);
        
        String jsonBody = bodyNode.toString();

        // 2. Submit Task
        HttpRequest submitReq = HttpRequest.newBuilder()
                .uri(URI.create(submitUrl))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("X-DashScope-Async", "enable")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> submitRes = httpClient.send(submitReq, HttpResponse.BodyHandlers.ofString());
        log.info("Video Submit Response: {}", submitRes.body());
        JsonNode submitNode = objectMapper.readTree(submitRes.body());
        
        if (submitNode.has("code") && !submitNode.get("code").isNull()) {
             throw new RuntimeException("Submission failed: " + (submitNode.has("message") ? submitNode.get("message").asText() : submitNode.toString()));
        }
        
        if (!submitNode.has("output") || !submitNode.get("output").has("task_id")) {
             throw new RuntimeException("Submission failed: No task_id returned. " + submitRes.body());
        }

        String taskId = submitNode.get("output").get("task_id").asText();
        
        // 3. Poll Status
        String videoUrl = pollStatus(taskId);
        
        return GenerationOutput.builder()
                .content(videoUrl)
                .inputTokens(0)
                .outputTokens(0)
                .build();
    }

    private String pollStatus(String taskId) throws Exception {
        int maxRetries = 60; // 15 minutes
        String statusUrl = genieConfig.getTaskStatusUrl() + taskId;

        for (int i = 0; i < maxRetries; i++) {
            Thread.sleep(15000); // Wait 15 seconds
            
            HttpRequest pollReq = HttpRequest.newBuilder()
                    .uri(URI.create(statusUrl))
                    .header("Authorization", "Bearer " + apiKey)
                    .GET()
                    .build();

            HttpResponse<String> pollRes = httpClient.send(pollReq, HttpResponse.BodyHandlers.ofString());
            JsonNode pollNode = objectMapper.readTree(pollRes.body());
            
            String status = pollNode.get("output").get("task_status").asText();
            
            if ("SUCCEEDED".equals(status)) {
                return pollNode.get("output").get("video_url").asText();
            } else if ("FAILED".equals(status) || "CANCELED".equals(status)) {
                throw new RuntimeException("Video generation failed: " + (pollNode.get("output").has("message") ? pollNode.get("output").get("message").asText() : "Unknown error"));
            }
        }
        return "Video generation is taking longer than expected. Task ID: " + taskId;
    }

    @Override
    public boolean supports(String modelType) {
        return "video".equalsIgnoreCase(modelType);
    }

    @Override
    public double calculateCost(String modelName, int inputTokens, int outputTokens, Map<String, Object> parameters) {
        String name = modelName != null ? modelName.toLowerCase() : "wanx2.1-t2v-turbo";
        Map<String, Double> prices = genieConfig.getPricing().getVideo();
        
        Double price = prices.getOrDefault(name, prices.get("default"));
        if (price == null) price = 2.0;
        
        return price;
    }
}
