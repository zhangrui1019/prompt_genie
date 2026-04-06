package com.promptgenie.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.AgentConfig;
import com.promptgenie.mapper.AgentConfigMapper;
import com.promptgenie.service.AgentConfigService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AgentConfigServiceImpl extends ServiceImpl<AgentConfigMapper, AgentConfig> implements AgentConfigService {

    @Override
    public AgentConfig getLatestConfig(Long agentId) {
        QueryWrapper<AgentConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("agent_id", agentId)
                .orderByDesc("version")
                .last("LIMIT 1");
        return getOne(queryWrapper);
    }

    @Override
    public AgentConfig createConfig(Long agentId, String configJson, String name, String description) {
        // 获取当前最大版本号
        QueryWrapper<AgentConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("agent_id", agentId)
                .orderByDesc("version")
                .last("LIMIT 1");
        AgentConfig latestConfig = getOne(queryWrapper);
        int version = latestConfig != null ? latestConfig.getVersion() + 1 : 1;

        AgentConfig config = new AgentConfig();
        config.setAgentId(agentId);
        config.setConfigJson(configJson);
        config.setName(name);
        config.setDescription(description);
        config.setVersion(version);
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());

        save(config);
        return config;
    }

    @Override
    public AgentConfig updateConfig(Long configId, String configJson, String name, String description) {
        AgentConfig config = getById(configId);
        if (config == null) {
            throw new RuntimeException("Agent config not found");
        }

        config.setConfigJson(configJson);
        config.setName(name);
        config.setDescription(description);
        config.setUpdatedAt(LocalDateTime.now());

        updateById(config);
        return config;
    }
}