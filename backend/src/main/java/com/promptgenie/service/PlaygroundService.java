package com.promptgenie.service;

import com.promptgenie.entity.PlaygroundHistory;
import com.promptgenie.mapper.PlaygroundHistoryMapper;
import com.promptgenie.service.strategy.GenerationOutput;
import com.promptgenie.service.strategy.GenerationStrategy;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class PlaygroundService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PlaygroundHistoryMapper historyMapper;
    
    @Autowired
    private KnowledgeService knowledgeService;

    @Autowired
    private List<GenerationStrategy> strategies;

    public String runPrompt(String promptTemplate, Map<String, Object> variables) {
        return runPrompt(promptTemplate, variables, "text", "qwen-turbo");
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
        double cost = 0.0;

        try {
            GenerationStrategy strategy = strategies.stream()
                .filter(s -> s.supports(modelType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported model type: " + modelType));

            GenerationOutput output = strategy.generate(finalPrompt, modelName, parameters);
            result = output.getContent();
            inputTokens = output.getInputTokens();
            outputTokens = output.getOutputTokens();
            
            cost = strategy.calculateCost(modelName, inputTokens, outputTokens, parameters);
            
        } catch (Exception e) {
            e.printStackTrace();
            result = "Error calling AI: " + e.getMessage();
        }

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
}
