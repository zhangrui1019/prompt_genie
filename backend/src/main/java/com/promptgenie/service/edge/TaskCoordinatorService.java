package com.promptgenie.service.edge;

import com.promptgenie.dto.AgentState;

import java.util.Map;

public interface TaskCoordinatorService {
    /**
     * 初始化任务协调服务
     */
    void initialize();

    /**
     * 处理端侧任务卸载请求
     * @param agentId 智能体ID
     * @param userId 用户ID
     * @param variables 输入变量
     * @param clientId 客户端ID
     * @return 任务ID
     */
    String handleTaskOffload(Long agentId, Long userId, Map<String, Object> variables, String clientId);

    /**
     * 分配任务
     * @param agentId 智能体ID
     * @param userId 用户ID
     * @param variables 输入变量
     * @return 任务分配结果
     */
    TaskAssignment assignTask(Long agentId, Long userId, Map<String, Object> variables);

    /**
     * 处理任务结果
     * @param taskId 任务ID
     * @param state 执行状态
     * @param clientId 客户端ID
     */
    void handleTaskResult(String taskId, AgentState state, String clientId);

    /**
     * 注册边缘设备
     * @param deviceInfo 设备信息
     * @return 设备ID
     */
    String registerEdgeDevice(Map<String, Object> deviceInfo);

    /**
     * 注销边缘设备
     * @param deviceId 设备ID
     */
    void unregisterEdgeDevice(String deviceId);

    /**
     * 更新设备状态
     * @param deviceId 设备ID
     * @param status 设备状态
     */
    void updateDeviceStatus(String deviceId, DeviceStatus status);

    /**
     * 获取设备列表
     * @return 设备列表
     */
    Map<String, EdgeDeviceInfo> getEdgeDevices();

    /**
     * 关闭任务协调服务
     */
    void shutdown();

    /**
     * 任务分配结果
     */
    class TaskAssignment {
        private AssignmentType type; // 分配类型：EDGE或CENTER
        private String targetId; // 目标ID：设备ID或中心服务ID
        private String taskId; // 任务ID

        public TaskAssignment(AssignmentType type, String targetId, String taskId) {
            this.type = type;
            this.targetId = targetId;
            this.taskId = taskId;
        }

        public AssignmentType getType() {
            return type;
        }

        public String getTargetId() {
            return targetId;
        }

        public String getTaskId() {
            return taskId;
        }

        public enum AssignmentType {
            EDGE, // 分配到边缘设备
            CENTER // 分配到中心服务
        }
    }

    /**
     * 边缘设备信息
     */
    class EdgeDeviceInfo {
        private String deviceId;
        private String deviceName;
        private String ipAddress;
        private int availableMemoryMb;
        private int cpuCores;
        private DeviceStatus status;
        private long lastHeartbeat;

        public EdgeDeviceInfo(String deviceId, String deviceName, String ipAddress, int availableMemoryMb, int cpuCores) {
            this.deviceId = deviceId;
            this.deviceName = deviceName;
            this.ipAddress = ipAddress;
            this.availableMemoryMb = availableMemoryMb;
            this.cpuCores = cpuCores;
            this.status = DeviceStatus.ONLINE;
            this.lastHeartbeat = System.currentTimeMillis();
        }

        public String getDeviceId() {
            return deviceId;
        }

        public String getDeviceName() {
            return deviceName;
        }

        public String getIpAddress() {
            return ipAddress;
        }

        public int getAvailableMemoryMb() {
            return availableMemoryMb;
        }

        public int getCpuCores() {
            return cpuCores;
        }

        public DeviceStatus getStatus() {
            return status;
        }

        public void setStatus(DeviceStatus status) {
            this.status = status;
        }

        public long getLastHeartbeat() {
            return lastHeartbeat;
        }

        public void updateHeartbeat() {
            this.lastHeartbeat = System.currentTimeMillis();
        }
    }

    /**
     * 设备状态
     */
    enum DeviceStatus {
        ONLINE, // 在线
        OFFLINE, // 离线
        BUSY, // 忙碌
        ERROR // 错误
    }
}