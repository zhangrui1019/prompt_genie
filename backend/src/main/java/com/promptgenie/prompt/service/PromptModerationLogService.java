package com.promptgenie.prompt.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.prompt.entity.PromptModerationLog;
import com.promptgenie.prompt.mapper.PromptModerationLogMapper;
import org.springframework.stereotype.Service;

@Service
public class PromptModerationLogService extends ServiceImpl<PromptModerationLogMapper, PromptModerationLog> {
}
