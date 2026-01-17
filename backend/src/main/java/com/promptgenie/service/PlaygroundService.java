package com.promptgenie.service;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.aigc.imagesynthesis.ImageSynthesis;
import com.alibaba.dashscope.aigc.imagesynthesis.ImageSynthesisParam;
import com.alibaba.dashscope.aigc.imagesynthesis.ImageSynthesisResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.promptgenie.entity.PlaygroundHistory;
import com.promptgenie.mapper.PlaygroundHistoryMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class PlaygroundService {

    @Value("${dashscope.api-key:}")
    private String apiKey;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PlaygroundHistoryMapper historyMapper;
    
    @Autowired
    private KnowledgeService knowledgeService;

    public String runPrompt(String promptTemplate, Map<String, Object> variables) {
        return runPrompt(promptTemplate, variables, "text", Generation.Models.QWEN_TURBO);
    }

    public String runPrompt(String promptTemplate, Map<String, Object> variables, String modelType, String modelName) {
        return runPrompt(promptTemplate, variables, modelType, modelName, null);
    }

    public String runPrompt(String promptTemplate, Map<String, Object> variables, String modelType, String modelName, Map<String, Object> parameters) {
        return runPrompt(promptTemplate, variables, modelType, modelName, parameters, null);
    }

    public String runPrompt(String promptTemplate, Map<String, Object> variables, String modelType, String modelName, Map<String, Object> parameters, Long userId) {
        System.out.println("runPrompt called. Type: " + modelType + ", Model: " + modelName);
        String finalPrompt = substituteVariables(promptTemplate, variables);
        
        // Append Knowledge Base Context if kbId is present
        if (parameters != null && parameters.containsKey("kbId")) {
            try {
                String kbIdStr = String.valueOf(parameters.get("kbId"));
                if (!kbIdStr.isEmpty()) {
                    Long kbId = Long.parseLong(kbIdStr);
                    String context = knowledgeService.getKnowledgeContext(kbId);
                    if (context != null && !context.isEmpty()) {
                        finalPrompt = "You have access to the following knowledge base documents:\n\n" + context + "\n\nUser Query/Prompt:\n" + finalPrompt;
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to append KB context: " + e.getMessage());
            }
        }
        
        String result = null;
        Integer inputTokens = 0;
        Integer outputTokens = 0;

        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                if ("image".equalsIgnoreCase(modelType)) {
                    result = callDashScopeImage(finalPrompt, modelName, parameters);
                } else if ("video".equalsIgnoreCase(modelType)) {
                    System.out.println("Invoking callDashScopeVideo...");
                    result = callDashScopeVideo(finalPrompt, modelName, parameters);
                } else {
                    GenerationResult genResult = callDashScopeText(finalPrompt, modelName, parameters);
                    result = genResult.getOutput().getChoices().get(0).getMessage().getContent();
                    if (genResult.getUsage() != null) {
                        inputTokens = genResult.getUsage().getInputTokens();
                        outputTokens = genResult.getUsage().getOutputTokens();
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                result = "Error calling AI: " + e.getMessage();
            }
        } else {
            System.out.println("API Key missing, returning mock.");
            result = mockRun(finalPrompt);
        }
        
        double cost = calculateCost(modelType, modelName, inputTokens, outputTokens, parameters);

        if (userId != null) {
            try {
                PlaygroundHistory history = new PlaygroundHistory();
                history.setUserId(userId);
                history.setPrompt(promptTemplate);
                history.setModelType(modelType);
                history.setModelName(modelName);
                history.setResult(result);
                history.setCreatedAt(LocalDateTime.now());
                
                history.setInputTokens(inputTokens);
                history.setOutputTokens(outputTokens);
                history.setCost(cost);
                
                if (variables != null) history.setVariables(objectMapper.writeValueAsString(variables));
                if (parameters != null) history.setParameters(objectMapper.writeValueAsString(parameters));
                
                historyMapper.insert(history);
            } catch (Exception e) {
                System.err.println("Failed to save history: " + e.getMessage());
            }
        }
        
        return result;
    }

    public List<PlaygroundHistory> getHistory(Long userId) {
        QueryWrapper<PlaygroundHistory> query = new QueryWrapper<>();
        query.eq("user_id", userId).orderByDesc("created_at").last("LIMIT 50");
        return historyMapper.selectList(query);
    }

    public Map<String, Object> getUsageStats(Long userId) {
        QueryWrapper<PlaygroundHistory> query = new QueryWrapper<>();
        query.select(
            "IFNULL(SUM(cost), 0) as total_cost", 
            "IFNULL(SUM(input_tokens), 0) as total_input_tokens", 
            "IFNULL(SUM(output_tokens), 0) as total_output_tokens",
            "COUNT(CASE WHEN model_type = 'image' THEN 1 END) as total_images",
            "COUNT(CASE WHEN model_type = 'video' THEN 1 END) as total_videos"
        ).eq("user_id", userId);
        
        List<Map<String, Object>> result = historyMapper.selectMaps(query);
        if (result != null && !result.isEmpty()) {
            return result.get(0);
        }
        return Map.of(
            "total_cost", 0,
            "total_input_tokens", 0,
            "total_output_tokens", 0,
            "total_images", 0,
            "total_videos", 0
        );
    }

    private String substituteVariables(String template, Map<String, Object> variables) {
        if (variables == null || variables.isEmpty()) {
            return template;
        }
        
        String result = template;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String key = "\\{\\{" + entry.getKey() + "\\}\\}";
            String value = String.valueOf(entry.getValue());
            result = result.replaceAll(key, value);
        }
        return result;
    }

    private GenerationResult callDashScopeText(String prompt, String modelName, Map<String, Object> parameters) throws NoApiKeyException, InputRequiredException {
        Generation gen = new Generation();
        Message userMsg = Message.builder().role(Role.USER.getValue()).content(prompt).build();
        
        float topP = 0.8f;
        
        if (parameters != null) {
             if (parameters.containsKey("top_p")) topP = Float.parseFloat(String.valueOf(parameters.get("top_p")));
        }

        GenerationParam.GenerationParamBuilder paramBuilder = GenerationParam.builder()
                .apiKey(apiKey)
                .model(modelName != null && !modelName.isEmpty() ? modelName : Generation.Models.QWEN_TURBO)
                .messages(Arrays.asList(userMsg))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .topP((double) topP);
        
        // Add temperature if supported
        // paramBuilder.temperature((float)temperature); 

        return gen.call(paramBuilder.build());
    }

    private String callDashScopeImage(String prompt, String modelName, Map<String, Object> parameters) throws NoApiKeyException {
        String size = "1024*1024";
        int n = 1;
        
        if (parameters != null) {
            if (parameters.containsKey("size")) size = (String) parameters.get("size");
            if (parameters.containsKey("n")) n = Integer.parseInt(String.valueOf(parameters.get("n")));
        }

        ImageSynthesis is = new ImageSynthesis();
        ImageSynthesisParam param = ImageSynthesisParam.builder()
                .apiKey(apiKey)
                .model(modelName != null && !modelName.isEmpty() ? modelName : "wanx-v1")
                .prompt(prompt)
                .n(n)
                .size(size)
                .build();

        ImageSynthesisResult result = is.call(param);
        // Return URL
        return result.getOutput().getResults().get(0).get("url");
    }

    private String callDashScopeVideo(String prompt, String modelName, Map<String, Object> parameters) throws Exception {
        String model = (modelName != null && !modelName.isEmpty()) ? modelName : "wanx2.1-t2v-turbo";
        
        HttpClient client = HttpClient.newHttpClient();
        
        // 1. Submit Task
        String submitUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis";
        
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

        HttpRequest submitReq = HttpRequest.newBuilder()
                .uri(URI.create(submitUrl))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("X-DashScope-Async", "enable")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> submitRes = client.send(submitReq, HttpResponse.BodyHandlers.ofString());
        System.out.println("Video Submit Response: " + submitRes.body());
        JsonNode submitNode = objectMapper.readTree(submitRes.body());
        
        if (submitNode.has("code") && !submitNode.get("code").isNull()) {
             throw new RuntimeException("Submission failed: " + (submitNode.has("message") ? submitNode.get("message").asText() : submitNode.toString()));
        }
        
        if (!submitNode.has("output") || !submitNode.get("output").has("task_id")) {
             throw new RuntimeException("Submission failed: No task_id returned. " + submitRes.body());
        }

        String taskId = submitNode.get("output").get("task_id").asText();
        
        // 2. Poll Status
        int maxRetries = 60; // 15 minutes (15s interval)
        for (int i = 0; i < maxRetries; i++) {
            Thread.sleep(15000); // Wait 15 seconds
            
            HttpRequest pollReq = HttpRequest.newBuilder()
                    .uri(URI.create("https://dashscope.aliyuncs.com/api/v1/tasks/" + taskId))
                    .header("Authorization", "Bearer " + apiKey)
                    .GET()
                    .build();

            HttpResponse<String> pollRes = client.send(pollReq, HttpResponse.BodyHandlers.ofString());
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

    private String mockRun(String prompt) {
        return "[Mock AI Output]\nI received your prompt:\n\n" + prompt + "\n\n(To see real AI output, please configure DASHSCOPE_API_KEY)";
    }
    
    private double calculateCost(String modelType, String modelName, int inputTokens, int outputTokens, Map<String, Object> parameters) {
        if (modelType == null) return 0.0;
        
        if ("text".equalsIgnoreCase(modelType)) {
             double inputPrice = 0.0;
             double outputPrice = 0.0;
             
             String name = modelName != null ? modelName.toLowerCase() : "qwen-turbo";
             
             // Prices in CNY per 1k tokens (Approximation)
             if (name.contains("qwen-turbo")) {
                 inputPrice = 0.002; outputPrice = 0.006;
             } else if (name.contains("qwen-plus")) {
                 inputPrice = 0.004; outputPrice = 0.012;
             } else if (name.contains("qwen-max")) {
                 inputPrice = 0.04; outputPrice = 0.12;
             } else {
                 // Default fallback
                 inputPrice = 0.002; outputPrice = 0.006;
             }
             
             return (inputTokens / 1000.0 * inputPrice) + (outputTokens / 1000.0 * outputPrice);
             
        } else if ("image".equalsIgnoreCase(modelType)) {
             // Wanx-v1 ~0.2 CNY per image?
             int n = 1;
             if (parameters != null && parameters.containsKey("n")) {
                 try {
                    n = Integer.parseInt(String.valueOf(parameters.get("n")));
                 } catch (NumberFormatException e) { n = 1; }
             }
             return n * 0.2; 
             
        } else if ("video".equalsIgnoreCase(modelType)) {
             // Wanx Video ~2.0 CNY per generation?
             return 2.0; 
        }
        return 0.0;
    }
}
