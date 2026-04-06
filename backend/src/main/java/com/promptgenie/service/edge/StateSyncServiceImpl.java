package com.promptgenie.service.edge;

import com.promptgenie.dto.AgentState;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class StateSyncServiceImpl implements StateSyncService {

    private final Map<String, AgentState> states = new ConcurrentHashMap<>();
    private final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(1);
    private CommunicationClient communicationClient;

    public void setCommunicationClient(CommunicationClient communicationClient) {
        this.communicationClient = communicationClient;
    }

    @Override
    public void initialize() {
        // 启动定期清理任务
        executorService.scheduleAtFixedRate(this::cleanupExpiredStates, 0, 10, TimeUnit.MINUTES);
        System.out.println("StateSyncService initialized");
    }

    @Override
    public void syncStateToCenter(AgentState state, String deviceId) {
        // 保存状态到中心
        saveState(state);
        
        // 通知中心服务状态更新
        if (communicationClient != null && communicationClient.isConnected()) {
            // 构建状态同步消息
            Map<String, Object> message = new java.util.HashMap<>();
            message.put("action", "state_sync");
            message.put("stateId", state.getId());
            message.put("state", state);
            message.put("deviceId", deviceId);
            message.put("timestamp", System.currentTimeMillis());
            
            try {
                String messageJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(message);
                communicationClient.sendMessage("center/state/sync", messageJson);
                System.out.println("State synced to center: " + state.getId());
            } catch (Exception e) {
                System.err.println("Failed to sync state to center: " + e.getMessage());
            }
        }
    }

    @Override
    public void syncStateToEdge(AgentState state, String deviceId) {
        // 保存状态
        saveState(state);
        
        // 通知端侧设备状态更新
        if (communicationClient != null && communicationClient.isConnected()) {
            // 构建状态同步消息
            Map<String, Object> message = new java.util.HashMap<>();
            message.put("action", "state_sync");
            message.put("stateId", state.getId());
            message.put("state", state);
            message.put("timestamp", System.currentTimeMillis());
            
            try {
                String messageJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(message);
                communicationClient.sendMessage("edge/" + deviceId + "/state/sync", messageJson);
                System.out.println("State synced to edge device: " + deviceId);
            } catch (Exception e) {
                System.err.println("Failed to sync state to edge: " + e.getMessage());
            }
        }
    }

    @Override
    public AgentState getState(String stateId) {
        return states.get(stateId);
    }

    @Override
    public void saveState(AgentState state) {
        states.put(state.getId(), state);
        System.out.println("State saved: " + state.getId());
    }

    @Override
    public void deleteState(String stateId) {
        states.remove(stateId);
        System.out.println("State deleted: " + stateId);
    }

    @Override
    public void cleanupExpiredStates() {
        long now = System.currentTimeMillis();
        states.entrySet().removeIf(entry -> {
            AgentState state = entry.getValue();
            // 清理24小时前的状态
            return now - state.getCreatedAt() > 24 * 60 * 60 * 1000;
        });
        System.out.println("Expired states cleaned up");
    }

    @Override
    public void shutdown() {
        executorService.shutdown();
        states.clear();
        System.out.println("StateSyncService shutdown");
    }
}