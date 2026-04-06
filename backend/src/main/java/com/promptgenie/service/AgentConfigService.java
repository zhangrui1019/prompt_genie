package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.promptgenie.entity.AgentConfig;

public interface AgentConfigService extends IService<AgentConfig> {
    AgentConfig getLatestConfig(Long agentId);
    AgentConfig createConfig(Long agentId, String configJson, String name, String description);
    AgentConfig updateConfig(Long configId, String configJson, String name, String description);
}