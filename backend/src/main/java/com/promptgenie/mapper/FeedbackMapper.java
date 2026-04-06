package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.Feedback;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface FeedbackMapper extends BaseMapper<Feedback> {
    
    List<Feedback> selectByUserId(Long userId);
    
    List<Feedback> selectByPromptId(Long promptId);
    
    List<Feedback> selectByModelId(Long modelId);
    
    List<Feedback> selectByConversationId(String conversationId);
    
    List<Feedback> selectByType(String type);
}