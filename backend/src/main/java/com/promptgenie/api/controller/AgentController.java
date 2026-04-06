package com.promptgenie.api.controller;

import com.promptgenie.core.exception.PendingApprovalException;
import com.promptgenie.dto.AgentState;
import com.promptgenie.entity.Agent;
import com.promptgenie.entity.AgentConfig;
import com.promptgenie.entity.Tool;
import com.promptgenie.service.AgentConfigService;
import com.promptgenie.service.AgentExecutorService;
import com.promptgenie.service.AgentService;
import com.promptgenie.service.ToolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agents")
public class AgentController {
    
    @Autowired
    private AgentService agentService;
    
    @Autowired
    private ToolService toolService;
    
    @Autowired
    private AgentExecutorService agentExecutorService;
    
    @Autowired
    private AgentConfigService agentConfigService;
    
    // 获取用户的智能体列表
    @GetMapping("/user/{userId}")
    public List<Agent> getUserAgents(@PathVariable Long userId) {
        return agentService.getUserAgents(userId);
    }
    
    // 获取工作区的智能体列表
    @GetMapping("/workspace/{workspaceId}")
    public List<Agent> getWorkspaceAgents(@PathVariable Long workspaceId) {
        return agentService.getWorkspaceAgents(workspaceId);
    }
    
    // 获取公开的智能体列表
    @GetMapping("/public")
    public List<Agent> getPublicAgents() {
        return agentService.getPublicAgents();
    }
    
    // 获取智能体详情
    @GetMapping("/{id}")
    public Agent getAgent(@PathVariable Long id) {
        return agentService.getById(id);
    }
    
    // 创建智能体
    @PostMapping
    public Agent createAgent(@RequestBody Agent agent) {
        return agentService.createAgent(agent);
    }
    
    // 更新智能体
    @PutMapping("/{id}")
    public void updateAgent(@PathVariable Long id, @RequestBody Agent agent) {
        agent.setId(id);
        agentService.updateAgent(agent);
    }
    
    // 发布智能体
    @PostMapping("/{id}/publish")
    public void publishAgent(@PathVariable Long id) {
        agentService.publishAgent(id);
    }
    
    // 归档智能体
    @PostMapping("/{id}/archive")
    public void archiveAgent(@PathVariable Long id) {
        agentService.archiveAgent(id);
    }
    
    // 删除智能体
    @DeleteMapping("/{id}")
    public void deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
    }
    
    // 挂载工具到智能体
    @PostMapping("/{id}/tools")
    public void mountTools(@PathVariable Long id, @RequestBody List<Long> toolIds) {
        agentService.mountTools(id, toolIds);
    }
    
    // 获取智能体的工具列表
    @GetMapping("/{id}/tools")
    public List<Tool> getAgentTools(@PathVariable Long id) {
        return agentService.getAgentTools(id);
    }
    
    // 配置智能体记忆
    @PostMapping("/{id}/memory")
    public void configureMemory(@PathVariable Long id, @RequestBody String memoryConfig) {
        agentService.configureMemory(id, memoryConfig);
    }
    
    // 获取系统内置工具列表
    @GetMapping("/tools/built-in")
    public List<Tool> getBuiltInTools() {
        return toolService.getBuiltInTools();
    }
    
    // 获取公开工具列表
    @GetMapping("/tools/public")
    public List<Tool> getPublicTools() {
        return toolService.getPublicTools();
    }
    
    // 创建自定义工具
    @PostMapping("/tools")
    public Tool createTool(@RequestBody Tool tool) {
        return toolService.createCustomTool(tool);
    }
    
    // 启动/继续执行 Agent
    @PostMapping("/{id}/run")
    public AgentState runAgent(@PathVariable Long id, @RequestBody Map<String, Object> variables) {
        // 从当前请求中获取用户 ID
        // 简化实现，实际应该从 JWT token 中提取
        Long userId = 1L;
        
        try {
            return agentExecutorService.runAgent(id, userId, variables);
        } catch (PendingApprovalException e) {
            // 遇到人工审核节点，返回暂停状态
            return e.getAgentState();
        }
    }
    
    // 当人工审核完成后，恢复挂起的执行流
    @PostMapping("/resume/{stateId}")
    public AgentState resumeAgent(@PathVariable String stateId, @RequestBody Map<String, Object> approvalData) {
        try {
            return agentExecutorService.resumeAgent(stateId, approvalData);
        } catch (PendingApprovalException e) {
            // 可能再次遇到人工审核节点
            return e.getAgentState();
        }
    }
    
    // 创建智能体配置
    @PostMapping("/{id}/config")
    public AgentConfig createConfig(@PathVariable Long id, @RequestBody Map<String, Object> configData) {
        String configJson = configData.get("configJson").toString();
        String name = configData.getOrDefault("name", "Default Config").toString();
        String description = configData.getOrDefault("description", "").toString();
        return agentConfigService.createConfig(id, configJson, name, description);
    }
    
    // 获取智能体的最新配置
    @GetMapping("/{id}/config")
    public AgentConfig getLatestConfig(@PathVariable Long id) {
        return agentConfigService.getLatestConfig(id);
    }
    
    // 更新智能体配置
    @PutMapping("/config/{configId}")
    public AgentConfig updateConfig(@PathVariable Long configId, @RequestBody Map<String, Object> configData) {
        String configJson = configData.get("configJson").toString();
        String name = configData.getOrDefault("name", "Default Config").toString();
        String description = configData.getOrDefault("description", "").toString();
        return agentConfigService.updateConfig(configId, configJson, name, description);
    }
}