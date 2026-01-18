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
        
        String systemPrompt = "You are an expert Prompt Engineer. Your task is to REWRITE and OPTIMIZE the user's prompt to achieve better performance on LLMs.\n" +
                "Optimization Goal: " + type + ".\n\n" +
                "Guidelines:\n" +
                "1. Structure: Use clear sections (e.g., # Role, # Context, # Task, # Constraints, # Output Format).\n" +
                "2. Clarity: Remove ambiguity and use precise action verbs.\n" +
                "3. Enhancement: Add necessary context or few-shot examples placeholders if helpful.\n" +
                "4. Language: The optimized prompt MUST be in the SAME LANGUAGE as the user's original prompt.\n" +
                "5. Content: Do not just copy the original. You must improve it significantly while keeping the core intent.\n\n" +
                "Output Format:\n" +
                "Please strictly follow this format:\n" +
                "---OPTIMIZED_PROMPT_START---\n" +
                "(Put the optimized prompt content here)\n" +
                "---OPTIMIZED_PROMPT_END---\n" +
                "---SUGGESTIONS_START---\n" +
                "- (Suggestion 1)\n" +
                "- (Suggestion 2)\n" +
                "---SUGGESTIONS_END---";

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

        // Robust parsing using markers
        try {
            if (content.contains("---OPTIMIZED_PROMPT_START---") && content.contains("---OPTIMIZED_PROMPT_END---")) {
                int start = content.indexOf("---OPTIMIZED_PROMPT_START---") + "---OPTIMIZED_PROMPT_START---".length();
                int end = content.indexOf("---OPTIMIZED_PROMPT_END---");
                optimizedPrompt = content.substring(start, end).trim();
            }

            if (content.contains("---SUGGESTIONS_START---") && content.contains("---SUGGESTIONS_END---")) {
                int start = content.indexOf("---SUGGESTIONS_START---") + "---SUGGESTIONS_START---".length();
                int end = content.indexOf("---SUGGESTIONS_END---");
                String suggestionsText = content.substring(start, end).trim();
                
                String[] lines = suggestionsText.split("\n");
                for (String line : lines) {
                    line = line.trim();
                    if (!line.isEmpty()) {
                        suggestions.add(line.replaceAll("^[-*\\d.]+\\s*", ""));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing optimization response: " + e.getMessage());
        }
        
        // Fallback to old parsing or raw content if markers are missing
        if (optimizedPrompt.isEmpty()) {
             // ... existing fallback logic or just use content ...
             // Let's try to salvage whatever we can if markers failed but content exists
             if (content.contains("Optimized Prompt:")) {
                 String[] parts = content.split("Suggestions:", 2);
                 optimizedPrompt = parts[0].replace("Optimized Prompt:", "").replace("---OPTIMIZED_PROMPT_START---", "").trim();
                 if (parts.length > 1) {
                     // parse suggestions
                     String[] lines = parts[1].split("\n");
                     for (String line : lines) {
                         if (line.trim().startsWith("-")) suggestions.add(line.trim().substring(1).trim());
                     }
                 }
             } else {
                 optimizedPrompt = content; // Worst case
             }
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
