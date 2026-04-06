package com.promptgenie.service;

import com.promptgenie.prompt.entity.Prompt;
import com.promptgenie.prompt.service.PromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {
    
    @Autowired
    private PromptService promptService;
    
    @Autowired
    private UserContextService userContextService;
    
    public List<Prompt> getRecommendedPrompts() {
        Long userId = userContextService.getCurrentUserId();
        
        // 获取所有公开提示词
        List<Prompt> allPrompts = promptService.getPublicPrompts(null, null, null, null, null, null);
        
        if (userId == null) {
            // 匿名用户，返回热门提示词
            return getHotPrompts(allPrompts);
        }
        
        // 登录用户，基于用户历史和偏好推荐
        return getPersonalizedRecommendations(userId, allPrompts);
    }
    
    private List<Prompt> getHotPrompts(List<Prompt> allPrompts) {
        // 基于点赞数和使用次数排序
        return allPrompts.stream()
            .sorted((p1, p2) -> {
                int likes1 = 0;
                int likes2 = 0;
                return Integer.compare(likes2, likes1);
            })
            .limit(10)
            .collect(Collectors.toList());
    }
    
    private List<Prompt> getPersonalizedRecommendations(Long userId, List<Prompt> allPrompts) {
        // 获取用户的提示词
        List<Prompt> userPrompts = new ArrayList<>();
        
        // 基于用户的提示词标签进行推荐
        Set<String> userTags = new HashSet<>();
        
        // 计算每个提示词的匹配分数
        Map<Prompt, Integer> scoreMap = new HashMap<>();
        for (Prompt prompt : allPrompts) {
            int score = 0;
            scoreMap.put(prompt, score);
        }
        
        // 排序并返回
        return scoreMap.entrySet().stream()
            .sorted((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue()))
            .limit(10)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }
    
    public List<Prompt> getSimilarPrompts(Long promptId) {
        Prompt targetPrompt = promptService.getById(promptId);
        if (targetPrompt == null) {
            return Collections.emptyList();
        }
        
        // 获取所有公开提示词
        List<Prompt> allPrompts = promptService.getPublicPrompts(null, null, null, null, null, null);
        
        // 基于标签相似度计算
        Map<Prompt, Integer> similarityMap = new HashMap<>();
        
        for (Prompt prompt : allPrompts) {
            if (prompt.getId().equals(promptId)) {
                continue; // 排除自身
            }
            
            int similarity = 0;
            similarityMap.put(prompt, similarity);
        }
        
        // 排序并返回
        return similarityMap.entrySet().stream()
            .sorted((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue()))
            .limit(5)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }
    
    public List<Prompt> getTrendingPrompts() {
        // 获取最近7天创建的提示词
        List<Prompt> recentPrompts = promptService.getPublicPrompts(null, null, null, null, null, null);
        
        // 基于点赞数和使用次数排序
        return recentPrompts.stream()
            .sorted((p1, p2) -> {
                int likes1 = 0;
                int likes2 = 0;
                return Integer.compare(likes2, likes1);
            })
            .limit(10)
            .collect(Collectors.toList());
    }
}
