package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Prompt;
import com.promptgenie.mapper.PromptMapper;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PromptService extends ServiceImpl<PromptMapper, Prompt> {
    
    public List<Prompt> getPromptsByUser(Long userId) {
        return baseMapper.selectByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Prompt> searchPrompts(Long userId, String search, String tag) {
        return baseMapper.selectByUserIdAndFilters(userId, search, tag);
    }
}
