package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Agent;
import com.promptgenie.entity.AgentTool;
import com.promptgenie.entity.Tool;
import com.promptgenie.mapper.AgentMapper;
import com.promptgenie.mapper.AgentToolMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AgentService extends ServiceImpl<AgentMapper, Agent> {
    
    @Autowired
    private AgentMapper agentMapper;
    
    @Autowired
    private AgentToolMapper agentToolMapper;
    
    @Autowired
    private ToolService toolService;
    
    public List<Agent> getUserAgents(Long userId) {
        return agentMapper.selectByUserId(userId);
    }
    
    public List<Agent> getWorkspaceAgents(Long workspaceId) {
        return agentMapper.selectByWorkspaceId(workspaceId);
    }
    
    public List<Agent> getPublicAgents() {
        return agentMapper.selectPublicAgents();
    }
    
    public Agent createAgent(Agent agent) {
        agent.setStatus("draft");
        save(agent);
        return agent;
    }
    
    public void updateAgent(Agent agent) {
        updateById(agent);
    }
    
    public void publishAgent(Long agentId) {
        Agent agent = getById(agentId);
        if (agent != null) {
            agent.setStatus("published");
            updateById(agent);
        }
    }
    
    public void archiveAgent(Long agentId) {
        Agent agent = getById(agentId);
        if (agent != null) {
            agent.setStatus("archived");
            updateById(agent);
        }
    }
    
    public void deleteAgent(Long agentId) {
        removeById(agentId);
    }
    
    // 挂载工具到智能体
    public void mountTools(Long agentId, List<Long> toolIds) {
        Agent agent = getById(agentId);
        if (agent == null) {
            throw new RuntimeException("Agent not found");
        }
        
        // 验证工具是否存在
        for (Long toolId : toolIds) {
            Tool tool = toolService.getById(toolId);
            if (tool == null) {
                throw new RuntimeException("Tool not found: " + toolId);
            }
        }
        
        // 删除现有的工具关联
        agentToolMapper.deleteByAgentId(agentId);
        
        // 创建新的工具关联
        for (Long toolId : toolIds) {
            AgentTool agentTool = new AgentTool();
            agentTool.setAgentId(agentId);
            agentTool.setToolId(toolId);
            agentTool.setConfig(null); // 可以根据需要设置工具配置
            agentToolMapper.insert(agentTool);
        }
    }
    
    // 获取智能体的工具列表
    public List<Tool> getAgentTools(Long agentId) {
        return toolService.getAgentTools(agentId);
    }
    
    // 配置智能体记忆
    public void configureMemory(Long agentId, String memoryConfig) {
        Agent agent = getById(agentId);
        if (agent != null) {
            agent.setMemoryConfig(memoryConfig);
            updateById(agent);
        }
    }
}