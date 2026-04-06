package com.promptgenie.service.edge;

import com.promptgenie.dto.AgentState;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public interface StateSyncService {
    /**
     * 初始化状态同步服务
     */
    void initialize();

    /**
     * 同步端侧状态到中心
     * @param state 执行状态
     * @param deviceId 设备ID
     */
    void syncStateToCenter(AgentState state, String deviceId);

    /**
     * 同步中心状态到端侧
     * @param state 执行状态
     * @param deviceId 设备ID
     */
    void syncStateToEdge(AgentState state, String deviceId);

    /**
     * 获取状态
     * @param stateId 状态ID
     * @return 执行状态
     */
    AgentState getState(String stateId);

    /**
     * 保存状态
     * @param state 执行状态
     */
    void saveState(AgentState state);

    /**
     * 删除状态
     * @param stateId 状态ID
     */
    void deleteState(String stateId);

    /**
     * 清理过期状态
     */
    void cleanupExpiredStates();

    /**
     * 关闭状态同步服务
     */
    void shutdown();
}