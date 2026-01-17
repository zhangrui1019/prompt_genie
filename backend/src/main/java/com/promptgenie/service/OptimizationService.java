package com.promptgenie.service;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OptimizationService {

    @Value("${dashscope.api-key:}")
    private String apiKey;

    public Map<String, Object> optimize(String prompt, String type) {
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                return callDashScope(prompt, type);
            } catch (Exception e) {
                System.err.println("DashScope call failed: " + e.getMessage());
                // Fallback to mock if API call fails
            }
        }

        // Mock Implementation (Fallback)
        return mockOptimize(prompt, type);
    }

    private Map<String, Object> callDashScope(String prompt, String type) throws NoApiKeyException, InputRequiredException {
        Generation gen = new Generation();
        
        String systemPrompt = "You are an expert Prompt Engineer. Your task is to optimize the user's prompt based on the requested goal: " + type + ". " +
                "You must return the response in a structured format containing the optimized prompt and a list of improvements made. " +
                "Output format should be roughly:\n" +
                "Optimized Prompt: [The optimized text]\n" +
                "Suggestions: \n- [Point 1]\n- [Point 2]";

        Message systemMsg = Message.builder().role(Role.SYSTEM.getValue()).content(systemPrompt).build();
        Message userMsg = Message.builder().role(Role.USER.getValue()).content(prompt).build();

        GenerationParam param = GenerationParam.builder()
                .apiKey(apiKey)
                .model(Generation.Models.QWEN_TURBO)
                .messages(Arrays.asList(systemMsg, userMsg))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .build();

        GenerationResult result = gen.call(param);
        String content = result.getOutput().getChoices().get(0).getMessage().getContent();

        return parseResponse(content, prompt);
    }

    private Map<String, Object> parseResponse(String content, String originalPrompt) {
        Map<String, Object> response = new HashMap<>();
        String optimizedPrompt = "";
        List<String> suggestions = new ArrayList<>();

        // Simple parsing logic assuming the model follows instructions roughly
        // Looking for "Optimized Prompt:" and "Suggestions:" markers
        
        String[] parts = content.split("Suggestions:", 2);
        
        if (parts.length > 0) {
            optimizedPrompt = parts[0].replace("Optimized Prompt:", "").trim();
        }
        
        if (parts.length > 1) {
            String suggestionsText = parts[1].trim();
            String[] lines = suggestionsText.split("\n");
            for (String line : lines) {
                line = line.trim();
                if (line.startsWith("-") || line.startsWith("*") || line.matches("^\\d+\\..*")) {
                    suggestions.add(line.replaceAll("^[-*\\d.]+\\s*", ""));
                }
            }
        }
        
        if (optimizedPrompt.isEmpty()) {
            optimizedPrompt = content; // Fallback if parsing fails
        }

        response.put("optimizedPrompt", optimizedPrompt);
        response.put("suggestions", suggestions);
        response.put("originalPrompt", originalPrompt);
        return response;
    }

    private Map<String, Object> mockOptimize(String prompt, String type) {
        Map<String, Object> response = new HashMap<>();
        String optimizedPrompt = prompt;
        List<String> suggestions = new ArrayList<>();

        if (prompt == null || prompt.isEmpty()) {
             response.put("optimizedPrompt", "");
             response.put("suggestions", List.of("Please provide a prompt to optimize."));
             return response;
        }

        if ("clarity".equalsIgnoreCase(type)) {
            optimizedPrompt = "Act as an expert in the relevant field. " + prompt + "\nPlease ensure the output is clear, concise, and easy to understand.";
            suggestions.add("Added role definition ('Act as an expert').");
            suggestions.add("Added instruction for clarity and conciseness.");
        } else if ("creativity".equalsIgnoreCase(type)) {
            optimizedPrompt = "You are a creative visionary. " + prompt + "\nPlease think outside the box and provide unique, innovative responses.";
            suggestions.add("Set persona to 'creative visionary'.");
            suggestions.add("Encouraged innovative thinking.");
        } else if ("structure".equalsIgnoreCase(type)) {
            optimizedPrompt = prompt + "\n\nOutput Format:\n1. [Section 1]\n2. [Section 2]\n...";
            suggestions.add("Added structure/formatting instructions.");
        } else {
            optimizedPrompt = "Role: Expert Assistant\nTask: " + prompt + "\nContext: [Add context here if needed]\nConstraints: Be specific and avoid ambiguity.";
            suggestions.add("Restructured into Role-Task-Context-Constraints format.");
            suggestions.add("Added constraint to avoid ambiguity.");
        }

        response.put("optimizedPrompt", optimizedPrompt);
        response.put("suggestions", suggestions);
        response.put("originalPrompt", prompt);
        
        return response;
    }
}
