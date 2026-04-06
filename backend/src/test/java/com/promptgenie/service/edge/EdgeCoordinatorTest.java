package com.promptgenie.service.edge;

import com.promptgenie.dto.AgentState;
import com.promptgenie.service.AgentExecutorService;
import com.promptgenie.service.edge.TaskCoordinatorService.TaskAssignment;
import com.promptgenie.service.edge.TaskCoordinatorService.TaskAssignment.AssignmentType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

public class EdgeCoordinatorTest {

    private EdgeAgentExecutor edgeAgentExecutor;
    private CommunicationClient communicationClient;
    private MessageHandler messageHandler;
    private TaskCoordinatorService taskCoordinatorService;
    private StateSyncService stateSyncService;
    private SecurityService securityService;

    @BeforeEach
    public void setUp() {
        // 初始化组件
        edgeAgentExecutor = new EdgeAgentExecutorImpl(2048, 4); // 2GB内存，4核心CPU
        communicationClient = new MqttCommunicationClient("tcp://localhost:1883");
        messageHandler = new MessageHandler(communicationClient, edgeAgentExecutor);
        taskCoordinatorService = new TaskCoordinatorServiceImpl();
        stateSyncService = new StateSyncServiceImpl();
        securityService = new SecurityServiceImpl();

        // 初始化服务
        communicationClient.initialize();
        edgeAgentExecutor.initialize();
        taskCoordinatorService.initialize();
        stateSyncService.initialize();
        securityService.initialize();

        // 设置依赖
        ((StateSyncServiceImpl) stateSyncService).setCommunicationClient(communicationClient);
        ((TaskCoordinatorServiceImpl) taskCoordinatorService).setAgentExecutorService(new AgentExecutorService() {
            @Override
            public AgentState runAgent(Long agentId, Long userId, Map<String, Object> variables) {
                // 模拟智能体执行
                AgentState state = new AgentState();
                state.setId("test-state-1");
                state.setAgentId(agentId);
                state.setUserId(userId);
                state.setStatus("COMPLETED");
                state.setCreatedAt(System.currentTimeMillis());
                state.setUpdatedAt(System.currentTimeMillis());
                return state;
            }

            @Override
            public AgentState resumeAgent(String stateId, Map<String, Object> approvalData) {
                return null;
            }
        });
    }

    @Test
    public void testEdgeAgentExecutor() {
        System.out.println("Testing EdgeAgentExecutor...");
        
        // 测试任务复杂度评估
        Map<String, Object> variables = new HashMap<>();
        variables.put("test", "value");
        
        EdgeAgentExecutor.TaskComplexity complexity = edgeAgentExecutor.evaluateTaskComplexity(1L, variables);
        System.out.println("Task complexity: canRunLocally=" + complexity.isCanRunLocally() + ", estimatedTimeMs=" + complexity.getEstimatedTimeMs() + ", requiredMemoryMb=" + complexity.getRequiredMemoryMb());
        
        // 测试状态管理
        AgentState state = new AgentState();
        state.setId("test-state-1");
        state.setAgentId(1L);
        state.setUserId(1L);
        state.setStatus("RUNNING");
        
        edgeAgentExecutor.saveState(state);
        AgentState savedState = edgeAgentExecutor.loadState("test-state-1");
        System.out.println("Saved state: " + savedState.getId() + ", status=" + savedState.getStatus());
        
        // 清理过期状态
        edgeAgentExecutor.cleanupExpiredStates();
        System.out.println("EdgeAgentExecutor test completed");
    }

    @Test
    public void testCommunicationClient() {
        System.out.println("Testing CommunicationClient...");
        
        // 测试连接
        communicationClient.connect();
        System.out.println("Connected: " + communicationClient.isConnected());
        
        // 测试订阅
        communicationClient.subscribe("test/topic", new CommunicationClient.MessageCallback() {
            @Override
            public void onMessage(String topic, String message, Map<String, Object> headers) {
                System.out.println("Received message: " + message);
            }

            @Override
            public void onDisconnect() {
                System.out.println("Disconnected");
            }

            @Override
            public void onConnect() {
                System.out.println("Connected");
            }

            @Override
            public void onError(Throwable throwable) {
                System.err.println("Error: " + throwable.getMessage());
            }
        });
        
        // 测试发送消息
        communicationClient.sendMessage("test/topic", "Hello from test");
        
        // 测试断开连接
        communicationClient.disconnect();
        System.out.println("Connected: " + communicationClient.isConnected());
        
        System.out.println("CommunicationClient test completed");
    }

    @Test
    public void testTaskCoordinator() {
        System.out.println("Testing TaskCoordinatorService...");
        
        // 测试设备注册
        Map<String, Object> deviceInfo = new HashMap<>();
        deviceInfo.put("deviceName", "Test Device");
        deviceInfo.put("ipAddress", "192.168.1.100");
        deviceInfo.put("availableMemoryMb", 2048);
        deviceInfo.put("cpuCores", 4);
        
        String deviceId = taskCoordinatorService.registerEdgeDevice(deviceInfo);
        System.out.println("Registered device: " + deviceId);
        
        // 测试任务分配
        Map<String, Object> variables = new HashMap<>();
        variables.put("test", "value");
        
        TaskAssignment assignment = taskCoordinatorService.assignTask(1L, 1L, variables);
        System.out.println("Task assignment: type=" + assignment.getType() + ", targetId=" + assignment.getTargetId() + ", taskId=" + assignment.getTaskId());
        
        // 测试设备状态更新
        taskCoordinatorService.updateDeviceStatus(deviceId, TaskCoordinatorService.DeviceStatus.ONLINE);
        System.out.println("Device status updated");
        
        // 测试设备列表
        System.out.println("Edge devices: " + taskCoordinatorService.getEdgeDevices().size());
        
        // 测试设备注销
        taskCoordinatorService.unregisterEdgeDevice(deviceId);
        System.out.println("Device unregistered");
        
        System.out.println("TaskCoordinatorService test completed");
    }

    @Test
    public void testStateSync() {
        System.out.println("Testing StateSyncService...");
        
        // 测试状态保存
        AgentState state = new AgentState();
        state.setId("test-state-1");
        state.setAgentId(1L);
        state.setUserId(1L);
        state.setStatus("RUNNING");
        state.setCreatedAt(System.currentTimeMillis());
        state.setUpdatedAt(System.currentTimeMillis());
        
        stateSyncService.saveState(state);
        AgentState savedState = stateSyncService.getState("test-state-1");
        System.out.println("Saved state: " + savedState.getId() + ", status=" + savedState.getStatus());
        
        // 测试状态同步
        stateSyncService.syncStateToCenter(state, "device-1");
        stateSyncService.syncStateToEdge(state, "device-1");
        
        // 测试状态删除
        stateSyncService.deleteState("test-state-1");
        System.out.println("State deleted");
        
        // 测试清理过期状态
        stateSyncService.cleanupExpiredStates();
        System.out.println("Expired states cleaned up");
        
        System.out.println("StateSyncService test completed");
    }

    @Test
    public void testSecurityService() {
        System.out.println("Testing SecurityService...");
        
        // 测试密钥对生成
        java.security.KeyPair keyPair = securityService.generateKeyPair();
        System.out.println("Generated key pair");
        
        // 测试加密和解密
        byte[] data = "Hello, World!".getBytes();
        byte[] encryptedData = securityService.encrypt(data, keyPair.getPublic().getEncoded());
        byte[] decryptedData = securityService.decrypt(encryptedData, keyPair.getPrivate().getEncoded());
        System.out.println("Decrypted data: " + new String(decryptedData));
        
        // 测试签名和验证
        byte[] signature = securityService.sign(data, keyPair.getPrivate().getEncoded());
        boolean verified = securityService.verify(data, signature, keyPair.getPublic().getEncoded());
        System.out.println("Signature verified: " + verified);
        
        // 测试设备认证
        Map<String, Object> deviceInfo = new HashMap<>();
        deviceInfo.put("deviceName", "Test Device");
        String token = securityService.generateDeviceToken("device-1", deviceInfo);
        boolean authenticated = securityService.authenticateDevice("device-1", token);
        System.out.println("Device authenticated: " + authenticated);
        
        // 测试数据脱敏
        Map<String, Object> sensitiveData = new HashMap<>();
        sensitiveData.put("name", "John Doe");
        sensitiveData.put("email", "john@example.com");
        sensitiveData.put("phone", "1234567890");
        Map<String, Object> maskedData = securityService.maskSensitiveData(sensitiveData, new String[]{"email", "phone"});
        System.out.println("Masked data: " + maskedData);
        
        // 测试权限检查
        ((SecurityServiceImpl) securityService).addPermission("device-1", "read", "agents");
        boolean hasPermission = securityService.checkPermission("device-1", "read", "agents");
        System.out.println("Has permission: " + hasPermission);
        
        System.out.println("SecurityService test completed");
    }

    @Test
    public void testEndToEnd() {
        System.out.println("Testing end-to-end scenario...");
        
        // 1. 注册设备
        Map<String, Object> deviceInfo = new HashMap<>();
        deviceInfo.put("deviceName", "Test Device");
        deviceInfo.put("ipAddress", "192.168.1.100");
        deviceInfo.put("availableMemoryMb", 2048);
        deviceInfo.put("cpuCores", 4);
        
        String deviceId = taskCoordinatorService.registerEdgeDevice(deviceInfo);
        System.out.println("1. Registered device: " + deviceId);
        
        // 2. 分配任务
        Map<String, Object> variables = new HashMap<>();
        variables.put("test", "value");
        
        TaskAssignment assignment = taskCoordinatorService.assignTask(1L, 1L, variables);
        System.out.println("2. Task assigned: type=" + assignment.getType() + ", taskId=" + assignment.getTaskId());
        
        // 3. 执行任务（模拟）
        AgentState state = new AgentState();
        state.setId("test-state-1");
        state.setAgentId(1L);
        state.setUserId(1L);
        state.setStatus("COMPLETED");
        state.setCreatedAt(System.currentTimeMillis());
        state.setUpdatedAt(System.currentTimeMillis());
        
        // 4. 处理任务结果
        taskCoordinatorService.handleTaskResult(assignment.getTaskId(), state, deviceId);
        System.out.println("3. Task result handled");
        
        // 5. 同步状态
        stateSyncService.syncStateToCenter(state, deviceId);
        System.out.println("4. State synced to center");
        
        // 6. 清理
        taskCoordinatorService.unregisterEdgeDevice(deviceId);
        stateSyncService.deleteState("test-state-1");
        System.out.println("5. Cleanup completed");
        
        System.out.println("End-to-end test completed");
    }
}
