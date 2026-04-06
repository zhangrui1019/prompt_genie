package com.promptgenie.service.edge;

import com.promptgenie.dto.AgentState;
import com.promptgenie.entity.Agent;
import com.promptgenie.entity.AgentConfig;
import com.promptgenie.core.enums.AgentNodeType;
import com.promptgenie.core.exception.PendingApprovalException;

import java.util.Map;

public interface EdgeAgentExecutor {
    /**
     * 初始化执行器
     */
    void initialize();

    /**
     * 运行智能体
     * @param agentId 智能体ID
     * @param userId 用户ID
     * @param variables 输入变量
     * @return 执行状态
     * @throws PendingApprovalException 需要人工审核时抛出
     */
    AgentState runAgent(Long agentId, Long userId, Map<String, Object> variables) throws PendingApprovalException;

    /**
     * 恢复挂起的智能体执行
     * @param stateId 状态ID
     * @param approvalData 审批数据
     * @return 执行状态
     * @throws PendingApprovalException 可能再次需要人工审核
     */
    AgentState resumeAgent(String stateId, Map<String, Object> approvalData) throws PendingApprovalException;

    /**
     * 评估任务复杂度
     * @param agentId 智能体ID
     * @param variables 输入变量
     * @return 复杂度评估结果
     */
    TaskComplexity evaluateTaskComplexity(Long agentId, Map<String, Object> variables);

    /**
     * 加载智能体配置
     * @param agentId 智能体ID
     * @return 智能体配置
     */
    AgentConfig loadAgentConfig(Long agentId);

    /**
     * 保存执行状态
     * @param state 执行状态
     */
    void saveState(AgentState state);

    /**
     * 加载执行状态
     * @param stateId 状态ID
     * @return 执行状态
     */
    AgentState loadState(String stateId);

    /**
     * 清理过期状态
     */
    void cleanupExpiredStates();

    /**
     * 关闭执行器
     */
    void shutdown();

    /**
     * 任务复杂度评估结果
     */
    class TaskComplexity {
        private boolean canRunLocally; // 是否可以在本地运行
        private int estimatedTimeMs; // 预估执行时间（毫秒）
        private int requiredMemoryMb; // 所需内存（MB）

        public TaskComplexity(boolean canRunLocally, int estimatedTimeMs, int requiredMemoryMb) {
            this.canRunLocally = canRunLocally;
            this.estimatedTimeMs = estimatedTimeMs;
            this.requiredMemoryMb = requiredMemoryMb;
        }

        public boolean isCanRunLocally() {
            return canRunLocally;
        }

        public int getEstimatedTimeMs() {
            return estimatedTimeMs;
        }

        public int getRequiredMemoryMb() {
            return requiredMemoryMb;
        }
    }
}