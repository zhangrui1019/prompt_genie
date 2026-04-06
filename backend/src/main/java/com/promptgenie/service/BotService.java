package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Bot;
import com.promptgenie.entity.Agent;
import com.promptgenie.mapper.BotMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BotService extends ServiceImpl<BotMapper, Bot> {
    
    @Autowired
    private BotMapper botMapper;
    
    @Autowired
    private AgentService agentService;
    
    @Autowired
    private ToolService toolService;
    
    @Autowired
    private MemoryService memoryService;
    
    @Transactional
    public Bot createBot(Long agentId, String name, String description, String config) {
        // 验证智能体是否存在
        Agent agent = agentService.getById(agentId);
        if (agent == null) {
            throw new RuntimeException("Agent not found");
        }
        
        // 生成API key
        String apiKey = UUID.randomUUID().toString();
        
        // 生成endpoint
        String endpoint = "/api/bots/" + UUID.randomUUID().toString();
        
        // 创建Bot
        Bot bot = new Bot();
        bot.setAgentId(agentId);
        bot.setUserId(agent.getUserId());
        bot.setName(name);
        bot.setDescription(description);
        bot.setApiKey(apiKey);
        bot.setEndpoint(endpoint);
        bot.setConfig(config);
        bot.setStatus("active");
        bot.setTotalCalls(0);
        bot.setCreatedAt(LocalDateTime.now());
        bot.setUpdatedAt(LocalDateTime.now());
        
        save(bot);
        return bot;
    }
    
    public List<Bot> getUserBots(Long userId) {
        return botMapper.selectByUserId(userId);
    }
    
    public List<Bot> getAgentBots(Long agentId) {
        return botMapper.selectByAgentId(agentId);
    }
    
    public Bot getBotByApiKey(String apiKey) {
        return botMapper.selectByApiKey(apiKey);
    }
    
    public void updateBot(Bot bot) {
        updateById(bot);
    }
    
    public void activateBot(Long botId) {
        Bot bot = getById(botId);
        if (bot != null) {
            bot.setStatus("active");
            updateById(bot);
        }
    }
    
    public void deactivateBot(Long botId) {
        Bot bot = getById(botId);
        if (bot != null) {
            bot.setStatus("inactive");
            updateById(bot);
        }
    }
    
    public void deleteBot(Long botId) {
        removeById(botId);
    }
    
    @Transactional
    public Object callBot(String apiKey, Object input) {
        // 验证Bot
        Bot bot = getBotByApiKey(apiKey);
        if (bot == null) {
            throw new RuntimeException("Bot not found");
        }
        
        if (!"active".equals(bot.getStatus())) {
            throw new RuntimeException("Bot is not active");
        }
        
        // 记录调用
        bot.setTotalCalls(bot.getTotalCalls() + 1);
        bot.setLastCalledAt(LocalDateTime.now());
        updateById(bot);
        
        // 获取智能体
        Agent agent = agentService.getById(bot.getAgentId());
        if (agent == null) {
            throw new RuntimeException("Agent not found");
        }
        
        // 处理输入
        String inputText = input.toString();
        
        // 构建记忆提示
        String memoryPrompt = memoryService.buildMemoryPrompt(agent.getId(), inputText, 5);
        
        // 构建完整提示
        String fullPrompt = agent.getSystemPrompt() + "\n" + memoryPrompt + "\n用户输入：" + inputText;
        
        // TODO: 调用模型获取响应
        String response = "Bot response to: " + inputText;
        
        // 添加短期记忆
        memoryService.addShortTermMemory(agent.getId(), inputText + "\n" + response, "conversation");
        
        return response;
    }
}