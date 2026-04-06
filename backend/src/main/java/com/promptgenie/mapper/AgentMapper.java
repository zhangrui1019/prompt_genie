package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.Agent;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface AgentMapper extends BaseMapper<Agent> {
    
    List<Agent> selectByUserId(Long userId);
    
    List<Agent> selectByWorkspaceId(Long workspaceId);
    
    List<Agent> selectPublicAgents();
    
    List<Agent> selectByStatus(String status);
}