package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.Bot;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface BotMapper extends BaseMapper<Bot> {
    
    List<Bot> selectByUserId(Long userId);
    
    List<Bot> selectByAgentId(Long agentId);
    
    Bot selectByApiKey(String apiKey);
    
    List<Bot> selectByStatus(String status);
}