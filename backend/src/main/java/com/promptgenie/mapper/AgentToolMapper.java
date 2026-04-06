package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.AgentTool;

public interface AgentToolMapper extends BaseMapper<AgentTool> {
    void deleteByAgentId(Long agentId);
}