package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Feedback;
import com.promptgenie.mapper.FeedbackMapper;
import com.promptgenie.prompt.service.PromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FeedbackService extends ServiceImpl<FeedbackMapper, Feedback> {
    
    @Autowired
    private FeedbackMapper feedbackMapper;
    
    @Autowired
    private PromptService promptService;
    
    @Autowired
    private ModelService modelService;
    
    public Feedback createFeedback(Feedback feedback) {
        save(feedback);
        return feedback;
    }
    
    public List<Feedback> getUserFeedbacks(Long userId) {
        return feedbackMapper.selectByUserId(userId);
    }
    
    public List<Feedback> getPromptFeedbacks(Long promptId) {
        return feedbackMapper.selectByPromptId(promptId);
    }
    
    public List<Feedback> getModelFeedbacks(Long modelId) {
        return feedbackMapper.selectByModelId(modelId);
    }
    
    public List<Feedback> getConversationFeedbacks(String conversationId) {
        return feedbackMapper.selectByConversationId(conversationId);
    }
    
    // 分析Prompt的反馈
    public Map<String, Object> analyzePromptFeedback(Long promptId) {
        List<Feedback> feedbacks = getPromptFeedbacks(promptId);
        if (feedbacks.isEmpty()) {
            return Map.of(
                "totalFeedbacks", 0,
                "averageRating", 0.0,
                "positiveCount", 0,
                "negativeCount", 0
            );
        }
        
        // 计算平均评分
        double averageRating = feedbacks.stream()
            .filter(f -> f.getRating() != null)
            .mapToInt(Feedback::getRating)
            .average()
            .orElse(0.0);
        
        // 计算正面和负面反馈数量
        long positiveCount = feedbacks.stream()
            .filter(f -> f.getRating() != null && f.getRating() >= 4)
            .count();
        
        long negativeCount = feedbacks.stream()
            .filter(f -> f.getRating() != null && f.getRating() <= 2)
            .count();
        
        return Map.of(
            "totalFeedbacks", feedbacks.size(),
            "averageRating", averageRating,
            "positiveCount", positiveCount,
            "negativeCount", negativeCount
        );
    }
    
    // 分析模型的反馈
    public Map<String, Object> analyzeModelFeedback(Long modelId) {
        List<Feedback> feedbacks = getModelFeedbacks(modelId);
        if (feedbacks.isEmpty()) {
            return Map.of(
                "totalFeedbacks", 0,
                "averageRating", 0.0,
                "successRate", 0.0
            );
        }
        
        // 计算平均评分
        double averageRating = feedbacks.stream()
            .filter(f -> f.getRating() != null)
            .mapToInt(Feedback::getRating)
            .average()
            .orElse(0.0);
        
        // 计算成功率
        long successCount = feedbacks.stream()
            .filter(f -> f.getRating() != null && f.getRating() >= 3)
            .count();
        double successRate = (double) successCount / feedbacks.size() * 100;
        
        return Map.of(
            "totalFeedbacks", feedbacks.size(),
            "averageRating", averageRating,
            "successRate", successRate
        );
    }
}
