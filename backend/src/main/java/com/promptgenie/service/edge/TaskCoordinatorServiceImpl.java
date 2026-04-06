package com.promptgenie.service.edge;

import com.promptgenie.dto.AgentState;
import com.promptgenie.service.AgentExecutorService;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class TaskCoordinatorServiceImpl implements TaskCoordinatorService {

    private final Map<String, EdgeDeviceInfo> edgeDevices = new ConcurrentHashMap<>();
    private final Map<String, TaskInfo> tasks = new ConcurrentHashMap<>();
    private final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(1);
    private AgentExecutorService agentExecutorService;

    public void setAgentExecutorService(AgentExecutorService agentExecutorService) {
        this.agentExecutorService = agentExecutorService;
    }

    @Override
    public void initialize() {
        // 启动定期清理任务
        executorService.scheduleAtFixedRate(this::cleanupExpiredTasks, 0, 5, TimeUnit.MINUTES);
        // 启动设备状态检查
        executorService.scheduleAtFixedRate(this::checkDeviceStatus, 0, 1, TimeUnit.MINUTES);
        System.out.println("TaskCoordinatorService initialized");
    }

    @Override
    public String handleTaskOffload(Long agentId, Long userId, Map<String, Object> variables, String clientId) {
        // 生成任务ID
        String taskId = "task-" + UUID.randomUUID().toString();
        
        // 保存任务信息
        TaskInfo taskInfo = new TaskInfo(taskId, agentId, userId, variables, clientId, TaskStatus.PENDING);
        tasks.put(taskId, taskInfo);
        
        // 执行任务
        try {
            AgentState state = agentExecutorService.runAgent(agentId, userId, variables);
            taskInfo.setStatus(TaskStatus.COMPLETED);
            taskInfo.setResult(state);
            
            // 这里可以通知端侧设备任务完成
            System.out.println("Task offload handled: " + taskId);
        } catch (Exception e) {
            taskInfo.setStatus(TaskStatus.FAILED);
            taskInfo.setError(e.getMessage());
            System.err.println("Failed to handle task offload: " + e.getMessage());
        }
        
        return taskId;
    }

    @Override
    public TaskAssignment assignTask(Long agentId, Long userId, Map<String, Object> variables) {
        // 生成任务ID
        String taskId = "task-" + UUID.randomUUID().toString();
        
        // 查找合适的边缘设备
        EdgeDeviceInfo bestDevice = findBestEdgeDevice();
        
        if (bestDevice != null) {
            // 分配到边缘设备
            TaskInfo taskInfo = new TaskInfo(taskId, agentId, userId, variables, bestDevice.getDeviceId(), TaskStatus.PENDING);
            tasks.put(taskId, taskInfo);
            
            // 更新设备状态为忙碌
            bestDevice.setStatus(DeviceStatus.BUSY);
            
            System.out.println("Task assigned to edge device: " + bestDevice.getDeviceId());
            return new TaskAssignment(TaskAssignment.AssignmentType.EDGE, bestDevice.getDeviceId(), taskId);
        } else {
            // 分配到中心服务
            TaskInfo taskInfo = new TaskInfo(taskId, agentId, userId, variables, "center", TaskStatus.PENDING);
            tasks.put(taskId, taskInfo);
            
            // 执行任务
            try {
                AgentState state = agentExecutorService.runAgent(agentId, userId, variables);
                taskInfo.setStatus(TaskStatus.COMPLETED);
                taskInfo.setResult(state);
            } catch (Exception e) {
                taskInfo.setStatus(TaskStatus.FAILED);
                taskInfo.setError(e.getMessage());
            }
            
            System.out.println("Task assigned to center service");
            return new TaskAssignment(TaskAssignment.AssignmentType.CENTER, "center", taskId);
        }
    }

    @Override
    public void handleTaskResult(String taskId, AgentState state, String clientId) {
        TaskInfo taskInfo = tasks.get(taskId);
        if (taskInfo != null) {
            taskInfo.setStatus(TaskStatus.COMPLETED);
            taskInfo.setResult(state);
            
            // 更新设备状态
            if (!"center".equals(clientId)) {
                EdgeDeviceInfo deviceInfo = edgeDevices.get(clientId);
                if (deviceInfo != null) {
                    deviceInfo.setStatus(DeviceStatus.ONLINE);
                }
            }
            
            System.out.println("Task result handled: " + taskId);
        } else {
            System.err.println("Task not found: " + taskId);
        }
    }

    @Override
    public String registerEdgeDevice(Map<String, Object> deviceInfo) {
        String deviceId = "device-" + UUID.randomUUID().toString();
        String deviceName = (String) deviceInfo.getOrDefault("deviceName", "Unknown Device");
        String ipAddress = (String) deviceInfo.getOrDefault("ipAddress", "127.0.0.1");
        int availableMemoryMb = ((Number) deviceInfo.getOrDefault("availableMemoryMb", 1024)).intValue();
        int cpuCores = ((Number) deviceInfo.getOrDefault("cpuCores", 2)).intValue();
        
        EdgeDeviceInfo edgeDeviceInfo = new EdgeDeviceInfo(deviceId, deviceName, ipAddress, availableMemoryMb, cpuCores);
        edgeDevices.put(deviceId, edgeDeviceInfo);
        
        System.out.println("Edge device registered: " + deviceId);
        return deviceId;
    }

    @Override
    public void unregisterEdgeDevice(String deviceId) {
        edgeDevices.remove(deviceId);
        System.out.println("Edge device unregistered: " + deviceId);
    }

    @Override
    public void updateDeviceStatus(String deviceId, DeviceStatus status) {
        EdgeDeviceInfo deviceInfo = edgeDevices.get(deviceId);
        if (deviceInfo != null) {
            deviceInfo.setStatus(status);
            deviceInfo.updateHeartbeat();
            System.out.println("Device status updated: " + deviceId + " -> " + status);
        }
    }

    @Override
    public Map<String, EdgeDeviceInfo> getEdgeDevices() {
        return edgeDevices;
    }

    @Override
    public void shutdown() {
        executorService.shutdown();
        edgeDevices.clear();
        tasks.clear();
        System.out.println("TaskCoordinatorService shutdown");
    }

    private EdgeDeviceInfo findBestEdgeDevice() {
        EdgeDeviceInfo bestDevice = null;
        int bestScore = Integer.MIN_VALUE;
        
        long now = System.currentTimeMillis();
        for (EdgeDeviceInfo device : edgeDevices.values()) {
            // 检查设备是否在线且不忙碌
            if (device.getStatus() == DeviceStatus.ONLINE && (now - device.getLastHeartbeat()) < 300000) { // 5分钟内有心跳
                // 计算设备得分：内存 + CPU核心数 * 100
                int score = device.getAvailableMemoryMb() + device.getCpuCores() * 100;
                if (score > bestScore) {
                    bestScore = score;
                    bestDevice = device;
                }
            }
        }
        
        return bestDevice;
    }

    private void cleanupExpiredTasks() {
        long now = System.currentTimeMillis();
        tasks.entrySet().removeIf(entry -> {
            TaskInfo task = entry.getValue();
            // 清理24小时前的完成或失败任务
            return (task.getStatus() == TaskStatus.COMPLETED || task.getStatus() == TaskStatus.FAILED) && 
                   (now - task.getCreatedAt() > 24 * 60 * 60 * 1000);
        });
    }

    private void checkDeviceStatus() {
        long now = System.currentTimeMillis();
        for (EdgeDeviceInfo device : edgeDevices.values()) {
            // 检查设备是否离线（5分钟无心跳）
            if ((now - device.getLastHeartbeat()) > 300000) {
                device.setStatus(DeviceStatus.OFFLINE);
                System.out.println("Device marked as offline: " + device.getDeviceId());
            }
        }
    }

    /**
     * 任务信息
     */
    private static class TaskInfo {
        private final String taskId;
        private final Long agentId;
        private final Long userId;
        private final Map<String, Object> variables;
        private final String assignedTo;
        private TaskStatus status;
        private AgentState result;
        private String error;
        private final long createdAt;
        private long updatedAt;

        public TaskInfo(String taskId, Long agentId, Long userId, Map<String, Object> variables, String assignedTo, TaskStatus status) {
            this.taskId = taskId;
            this.agentId = agentId;
            this.userId = userId;
            this.variables = variables;
            this.assignedTo = assignedTo;
            this.status = status;
            this.createdAt = System.currentTimeMillis();
            this.updatedAt = System.currentTimeMillis();
        }

        public String getTaskId() {
            return taskId;
        }

        public Long getAgentId() {
            return agentId;
        }

        public Long getUserId() {
            return userId;
        }

        public Map<String, Object> getVariables() {
            return variables;
        }

        public String getAssignedTo() {
            return assignedTo;
        }

        public TaskStatus getStatus() {
            return status;
        }

        public void setStatus(TaskStatus status) {
            this.status = status;
            this.updatedAt = System.currentTimeMillis();
        }

        public AgentState getResult() {
            return result;
        }

        public void setResult(AgentState result) {
            this.result = result;
            this.updatedAt = System.currentTimeMillis();
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
            this.updatedAt = System.currentTimeMillis();
        }

        public long getCreatedAt() {
            return createdAt;
        }

        public long getUpdatedAt() {
            return updatedAt;
        }
    }

    /**
     * 任务状态
     */
    private enum TaskStatus {
        PENDING, // 待处理
        RUNNING, // 运行中
        COMPLETED, // 完成
        FAILED // 失败
    }
}