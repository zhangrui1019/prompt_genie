package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.TemplateEvent;
import com.promptgenie.mapper.TemplateEventMapper;
import org.springframework.stereotype.Service;

@Service
public class TemplateEventService extends ServiceImpl<TemplateEventMapper, TemplateEvent> {
}
