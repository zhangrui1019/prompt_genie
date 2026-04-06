package com.promptgenie.prompt.service;

import com.promptgenie.prompt.entity.Prompt;
import com.promptgenie.prompt.service.PromptService;
import com.promptgenie.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdaptivePromptService {
    
    @Autowired
    private PromptService promptService;
    
    @Autowired
    private UserContextService userContextService;
    
    public Prompt optimizePrompt(Prompt prompt, String userInput, String modelResponse) {
        // 分析用户输入和模型响应
        Map<String, Object> analysis = analyzeInteraction(userInput, modelResponse);
        
        // 生成优化建议
        List<String> suggestions = generateSuggestions(analysis);
        
        // 应用优化
        Prompt optimizedPrompt = applyOptimizations(prompt, suggestions);
        
        return optimizedPrompt;
    }
    
    private Map<String, Object> analyzeInteraction(String userInput, String modelResponse) {
        Map<String, Object> analysis = new HashMap<>();
        
        // 分析用户输入长度
        analysis.put("userInputLength", userInput.length());
        
        // 分析模型响应长度
        analysis.put("responseLength", modelResponse.length());
        
        // 分析响应质量（简化实现）
        boolean isHelpful = modelResponse.length() > 50 && modelResponse.contains("\n");
        analysis.put("isHelpful", isHelpful);
        
        return analysis;
    }
    
    private List<String> generateSuggestions(Map<String, Object> analysis) {
        List<String> suggestions = new ArrayList<>();
        
        int userInputLength = (int) analysis.get("userInputLength");
        boolean isHelpful = (boolean) analysis.get("isHelpful");
        
        if (userInputLength < 50) {
            suggestions.add("增加用户输入的详细程度，提供更多上下文信息");
        }
        
        if (!isHelpful) {
            suggestions.add("改进提示词的清晰度和具体性");
            suggestions.add("添加示例来指导模型的输出格式");
        }
        
        return suggestions;
    }
    
    private Prompt applyOptimizations(Prompt prompt, List<String> suggestions) {
        // 创建提示词的新版本
        Prompt optimizedPrompt = new Prompt();
        optimizedPrompt.setTitle(prompt.getTitle() + " (优化版)");
        optimizedPrompt.setContent(prompt.getContent());
        optimizedPrompt.setUserId(prompt.getUserId());
        optimizedPrompt.setTags(prompt.getTags());
        optimizedPrompt.setIsPublic(prompt.getIsPublic());
        
        // 添加优化建议到提示词内容
        if (!suggestions.isEmpty()) {
            StringBuilder optimizedContent = new StringBuilder(prompt.getContent());
            optimizedContent.append("\n\n# 优化建议\n");
            for (int i = 0; i < suggestions.size(); i++) {
                optimizedContent.append((i + 1)).append(". " + suggestions.get(i) + "\n");
            }
            optimizedPrompt.setContent(optimizedContent.toString());
        }
        
        return optimizedPrompt;
    }
    
    public Map<String, Object> analyzePromptPerformance(Prompt prompt, List<Map<String, Object>> interactions) {
        Map<String, Object> performance = new HashMap<>();
        
        if (interactions.isEmpty()) {
            performance.put("averageResponseLength", 0);
            performance.put("helpfulCount", 0);
            performance.put("totalInteractions", 0);
            return performance;
        }
        
        // 计算平均响应长度
        int totalResponseLength = 0;
        int helpfulCount = 0;
        
        for (Map<String, Object> interaction : interactions) {
            String response = (String) interaction.get("response");
            if (response != null) {
                totalResponseLength += response.length();
                // 简化的帮助性判断
                if (response.length() > 100) {
                    helpfulCount++;
                }
            }
        }
        
        double averageResponseLength = (double) totalResponseLength / interactions.size();
        
        performance.put("averageResponseLength", averageResponseLength);
        performance.put("helpfulCount", helpfulCount);
        performance.put("totalInteractions", interactions.size());
        performance.put("helpfulRate", (double) helpfulCount / interactions.size());
        
        return performance;
    }
    
    // 内部类，用于存储优化结果
    public static class PromptOptimizationResult {
        private String optimizedPrompt;
        private List<String> suggestions;
        private Map<String, Object> analysis;
        
        public PromptOptimizationResult(String optimizedPrompt, List<String> suggestions, Map<String, Object> analysis) {
            this.optimizedPrompt = optimizedPrompt;
            this.suggestions = suggestions;
            this.analysis = analysis;
        }
        
        public String getOptimizedPrompt() {
            return optimizedPrompt;
        }
        
        public List<String> getSuggestions() {
            return suggestions;
        }
        
        public Map<String, Object> getAnalysis() {
            return analysis;
        }
    }
    
    public PromptOptimizationResult optimizePromptWithAnalysis(Prompt prompt, String userInput, String modelResponse) {
        // 分析交互
        Map<String, Object> analysis = analyzeInteraction(userInput, modelResponse);
        
        // 生成建议
        List<String> suggestions = generateSuggestions(analysis);
        
        // 应用优化
        Prompt optimizedPrompt = applyOptimizations(prompt, suggestions);
        
        // 返回结果
        return new PromptOptimizationResult(optimizedPrompt.getContent(), suggestions, analysis);
    }
}
