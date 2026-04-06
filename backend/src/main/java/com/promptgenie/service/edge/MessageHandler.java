package com.promptgenie.service.edge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.promptgenie.dto.AgentState;
import com.promptgenie.service.edge.CommunicationClient.MessageCallback;

import java.util.HashMap;
import java.util.Map;

public class MessageHandler implements MessageCallback {

    private final CommunicationClient communicationClient;
    private final EdgeAgentExecutor edgeAgentExecutor;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MessageHandler(CommunicationClient communicationClient, EdgeAgentExecutor edgeAgentExecutor) {
        this.communicationClient = communicationClient;
        this.edgeAgentExecutor = edgeAgentExecutor;
    }

    @Override
    public void onMessage(String topic, String message, Map<String, Object> headers) {
        System.out.println("Received message on topic " + topic + ": " + message);

        try {
            // 解析消息
            Map<String, Object> messageData = objectMapper.readValue(message, Map.class);
            String action = (String) messageData.get("action");

            switch (action) {
                case "task_assignment":
                    handleTaskAssignment(messageData);
                    break;
                case "task_result":
                    handleTaskResult(messageData);
                    break;
                case "config_update":
                    handleConfigUpdate(messageData);
                    break;
                case "state_sync":
                    handleStateSync(messageData);
                    break;
                case "ping":
                    handlePing(messageData);
                    break;
                default:
                    System.out.println("Unknown action: " + action);
            }
        } catch (Exception e) {
            System.err.println("Failed to handle message: " + e.getMessage());
        }
    }

    @Override
    public void onDisconnect() {
        System.out.println("Communication disconnected");
        // 尝试重新连接
        new Thread(() -> {
            try {
                Thread.sleep(5000);
                communicationClient.connect();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }

    @Override
    public void onConnect() {
        System.out.println("Communication connected");
        // 发送连接确认
        sendConnectConfirmation();
    }

    @Override
    public void onError(Throwable throwable) {
        System.err.println("Communication error: " + throwable.getMessage());
    }

    private void handleTaskAssignment(Map<String, Object> messageData) {
        // 处理中心分配的任务
        try {
            Long agentId = ((Number) messageData.get("agentId")).longValue();
            Long userId = ((Number) messageData.get("userId")).longValue();
            Map<String, Object> variables = (Map<String, Object>) messageData.get("variables");
            String taskId = (String) messageData.get("taskId");

            // 执行任务
            AgentState state = edgeAgentExecutor.runAgent(agentId, userId, variables);

            // 发送任务结果
            sendTaskResult(taskId, state);
        } catch (Exception e) {
            System.err.println("Failed to handle task assignment: " + e.getMessage());
        }
    }

    private void handleTaskResult(Map<String, Object> messageData) {
        // 处理中心返回的任务结果
        try {
            String taskId = (String) messageData.get("taskId");
            Map<String, Object> result = (Map<String, Object>) messageData.get("result");
            String status = (String) messageData.get("status");

            // 处理结果
            System.out.println("Received task result for task " + taskId + ", status: " + status);
            // 这里可以更新本地状态或通知应用
        } catch (Exception e) {
            System.err.println("Failed to handle task result: " + e.getMessage());
        }
    }

    private void handleConfigUpdate(Map<String, Object> messageData) {
        // 处理配置更新
        try {
            Long agentId = ((Number) messageData.get("agentId")).longValue();
            String configJson = (String) messageData.get("configJson");

            // 这里可以更新本地缓存的配置
            System.out.println("Received config update for agent " + agentId);
        } catch (Exception e) {
            System.err.println("Failed to handle config update: " + e.getMessage());
        }
    }

    private void handleStateSync(Map<String, Object> messageData) {
        // 处理状态同步
        try {
            String stateId = (String) messageData.get("stateId");
            Map<String, Object> stateData = (Map<String, Object>) messageData.get("state");

            // 这里可以更新本地状态
            System.out.println("Received state sync for state " + stateId);
        } catch (Exception e) {
            System.err.println("Failed to handle state sync: " + e.getMessage());
        }
    }

    private void handlePing(Map<String, Object> messageData) {
        // 处理 ping 消息
        try {
            String pingId = (String) messageData.get("pingId");
            sendPong(pingId);
        } catch (Exception e) {
            System.err.println("Failed to handle ping: " + e.getMessage());
        }
    }

    private void sendConnectConfirmation() {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("action", "connect_confirmation");
            message.put("clientId", communicationClient.getClientId());
            message.put("timestamp", System.currentTimeMillis());

            String messageJson = objectMapper.writeValueAsString(message);
            communicationClient.sendMessage("edge/connect", messageJson);
        } catch (Exception e) {
            System.err.println("Failed to send connect confirmation: " + e.getMessage());
        }
    }

    private void sendTaskResult(String taskId, AgentState state) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("action", "task_result");
            message.put("taskId", taskId);
            message.put("result", state);
            message.put("status", state.getStatus());
            message.put("timestamp", System.currentTimeMillis());

            String messageJson = objectMapper.writeValueAsString(message);
            communicationClient.sendMessage("edge/task/result", messageJson);
        } catch (Exception e) {
            System.err.println("Failed to send task result: " + e.getMessage());
        }
    }

    private void sendPong(String pingId) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("action", "pong");
            message.put("pingId", pingId);
            message.put("timestamp", System.currentTimeMillis());

            String messageJson = objectMapper.writeValueAsString(message);
            communicationClient.sendMessage("edge/pong", messageJson);
        } catch (Exception e) {
            System.err.println("Failed to send pong: " + e.getMessage());
        }
    }

    /**
     * 发送任务卸载请求
     * @param agentId 智能体ID
     * @param userId 用户ID
     * @param variables 输入变量
     */
    public void sendTaskOffload(Long agentId, Long userId, Map<String, Object> variables) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("action", "task_offload");
            message.put("agentId", agentId);
            message.put("userId", userId);
            message.put("variables", variables);
            message.put("timestamp", System.currentTimeMillis());

            String messageJson = objectMapper.writeValueAsString(message);
            communicationClient.sendMessage("edge/task/offload", messageJson);
        } catch (Exception e) {
            System.err.println("Failed to send task offload: " + e.getMessage());
        }
    }

    /**
     * 发送状态同步请求
     * @param state 执行状态
     */
    public void sendStateSync(AgentState state) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("action", "state_sync");
            message.put("stateId", state.getId());
            message.put("state", state);
            message.put("timestamp", System.currentTimeMillis());

            String messageJson = objectMapper.writeValueAsString(message);
            communicationClient.sendMessage("edge/state/sync", messageJson);
        } catch (Exception e) {
            System.err.println("Failed to send state sync: " + e.getMessage());
        }
    }

    /**
     * 发送配置请求
     * @param agentId 智能体ID
     */
    public void sendConfigRequest(Long agentId) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("action", "config_request");
            message.put("agentId", agentId);
            message.put("timestamp", System.currentTimeMillis());

            String messageJson = objectMapper.writeValueAsString(message);
            communicationClient.sendMessage("edge/config/request", messageJson);
        } catch (Exception e) {
            System.err.println("Failed to send config request: " + e.getMessage());
        }
    }
}