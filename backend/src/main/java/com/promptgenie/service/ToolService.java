package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Tool;
import com.promptgenie.mapper.ToolMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ToolService extends ServiceImpl<ToolMapper, Tool> {
    
    @Autowired
    private ToolMapper toolMapper;
    
    public List<Tool> getBuiltInTools() {
        return toolMapper.selectByType("built_in");
    }
    
    public List<Tool> getCustomTools(Long userId) {
        return toolMapper.selectByUserId(userId);
    }
    
    public List<Tool> getPublicTools() {
        return toolMapper.selectPublicTools();
    }
    
    public List<Tool> getToolsByCategory(String category) {
        return toolMapper.selectByCategory(category);
    }
    
    public Tool createCustomTool(Tool tool) {
        tool.setType("custom");
        save(tool);
        return tool;
    }
    
    public void updateTool(Tool tool) {
        updateById(tool);
    }
    
    public void deleteTool(Long toolId) {
        removeById(toolId);
    }
    
    // 工具调用方法，需要根据工具类型和配置执行不同的操作
    public Object executeTool(Long toolId, Object input) {
        Tool tool = getById(toolId);
        if (tool == null) {
            throw new RuntimeException("Tool not found");
        }
        
        if (!"enabled".equals(tool.getStatus())) {
            throw new RuntimeException("Tool is disabled");
        }
        
        // 根据工具类型执行不同的操作
        // TODO: 实现具体的工具执行逻辑
        return "Tool executed successfully";
    }
    
    // 获取智能体的工具列表
    public List<Tool> getAgentTools(Long agentId) {
        // TODO: 实现从 agent_tools 表查询工具列表的逻辑
        // 简化实现，实际应该通过 SQL 关联查询
        return null;
    }
}