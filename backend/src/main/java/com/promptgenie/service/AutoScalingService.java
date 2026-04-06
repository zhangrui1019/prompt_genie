package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class AutoScalingService {
    
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final List<ScalingEvent> scalingEvents = new ArrayList<>();
    private final Map<String, ServiceInstance> serviceInstances = new HashMap<>();
    
    // 扩缩容配置
    private int minInstances = 2;
    private int maxInstances = 10;
    private double scaleUpThreshold = 70.0; // CPU使用率超过70%时扩容
    private double scaleDownThreshold = 30.0; // CPU使用率低于30%时缩容
    private int cooldownPeriod = 5; // 冷却期（分钟）
    
    // 初始化自动扩缩容服务
    public void init() {
        // 初始化服务实例
        initializeServiceInstances();
        
        // 启动定时任务
        scheduler.scheduleAtFixedRate(this::checkScalingConditions, 0, 1, TimeUnit.MINUTES);
    }
    
    // 初始化服务实例
    private void initializeServiceInstances() {
        // 初始化最小数量的实例
        for (int i = 1; i <= minInstances; i++) {
            String instanceId = "instance-" + i;
            ServiceInstance instance = new ServiceInstance(
                instanceId,
                "running",
                System.currentTimeMillis(),
                0.0
            );
            serviceInstances.put(instanceId, instance);
        }
    }
    
    // 检查扩缩容条件
    private void checkScalingConditions() {
        // 获取当前系统负载
        double cpuUsage = getCurrentCpuUsage();
        int currentInstances = serviceInstances.size();
        
        // 检查是否需要扩容
        if (cpuUsage > scaleUpThreshold && currentInstances < maxInstances) {
            // 检查冷却期
            if (canScaleUp()) {
                scaleUp();
            }
        }
        
        // 检查是否需要缩容
        if (cpuUsage < scaleDownThreshold && currentInstances > minInstances) {
            // 检查冷却期
            if (canScaleDown()) {
                scaleDown();
            }
        }
    }
    
    // 获取当前CPU使用率
    private double getCurrentCpuUsage() {
        // 模拟CPU使用率
        // 实际应用中，这里应该从监控系统获取真实的CPU使用率
        return 30 + (Math.random() * 50); // 30% to 80%
    }
    
    // 检查是否可以扩容
    private boolean canScaleUp() {
        // 检查最近的扩缩容事件
        long now = System.currentTimeMillis();
        long cooldownMillis = cooldownPeriod * 60 * 1000;
        
        // 查找最近的扩缩容事件
        ScalingEvent recentEvent = scalingEvents.stream()
            .filter(event -> now - event.getTimestamp() < cooldownMillis)
            .findFirst()
            .orElse(null);
        
        // 如果没有最近的事件，或者最近的事件是缩容，则可以扩容
        return recentEvent == null || "scale_down".equals(recentEvent.getType());
    }
    
    // 检查是否可以缩容
    private boolean canScaleDown() {
        // 检查最近的扩缩容事件
        long now = System.currentTimeMillis();
        long cooldownMillis = cooldownPeriod * 60 * 1000;
        
        // 查找最近的扩缩容事件
        ScalingEvent recentEvent = scalingEvents.stream()
            .filter(event -> now - event.getTimestamp() < cooldownMillis)
            .findFirst()
            .orElse(null);
        
        // 如果没有最近的事件，或者最近的事件是扩容，则可以缩容
        return recentEvent == null || "scale_up".equals(recentEvent.getType());
    }
    
    // 扩容
    private void scaleUp() {
        // 创建新实例
        String instanceId = "instance-" + (serviceInstances.size() + 1);
        ServiceInstance instance = new ServiceInstance(
            instanceId,
            "starting",
            System.currentTimeMillis(),
            0.0
        );
        
        // 模拟实例启动
        serviceInstances.put(instanceId, instance);
        
        // 模拟启动延迟
        new Thread(() -> {
            try {
                Thread.sleep(10000); // 10秒启动时间
                instance.setStatus("running");
                instance.setCpuUsage(10.0); // 初始CPU使用率
                
                // 记录扩容事件
                ScalingEvent event = new ScalingEvent(
                    "scale_up",
                    "Added instance " + instanceId,
                    serviceInstances.size(),
                    System.currentTimeMillis()
                );
                scalingEvents.add(event);
                
                System.out.println("Scaled up to " + serviceInstances.size() + " instances");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
    
    // 缩容
    private void scaleDown() {
        // 找出负载最低的实例
        ServiceInstance instanceToRemove = serviceInstances.values().stream()
            .filter(instance -> "running".equals(instance.getStatus()))
            .min(Comparator.comparingDouble(ServiceInstance::getCpuUsage))
            .orElse(null);
        
        if (instanceToRemove != null) {
            // 标记实例为正在停止
            instanceToRemove.setStatus("stopping");
            
            // 模拟实例停止
            final String instanceId = instanceToRemove.getId();
            new Thread(() -> {
                try {
                    Thread.sleep(5000); // 5秒停止时间
                    serviceInstances.remove(instanceId);
                    
                    // 记录缩容事件
                    ScalingEvent event = new ScalingEvent(
                        "scale_down",
                        "Removed instance " + instanceId,
                        serviceInstances.size(),
                        System.currentTimeMillis()
                    );
                    scalingEvents.add(event);
                    
                    System.out.println("Scaled down to " + serviceInstances.size() + " instances");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }).start();
        }
    }
    
    // 获取服务实例列表
    public List<ServiceInstance> getServiceInstances() {
        return new ArrayList<>(serviceInstances.values());
    }
    
    // 获取扩缩容事件历史
    public List<ScalingEvent> getScalingEvents() {
        return scalingEvents;
    }
    
    // 获取扩缩容配置
    public Map<String, Object> getScalingConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("minInstances", minInstances);
        config.put("maxInstances", maxInstances);
        config.put("scaleUpThreshold", scaleUpThreshold);
        config.put("scaleDownThreshold", scaleDownThreshold);
        config.put("cooldownPeriod", cooldownPeriod);
        return config;
    }
    
    // 更新扩缩容配置
    public void updateScalingConfig(Map<String, Object> config) {
        if (config.containsKey("minInstances")) {
            minInstances = (int) config.get("minInstances");
        }
        if (config.containsKey("maxInstances")) {
            maxInstances = (int) config.get("maxInstances");
        }
        if (config.containsKey("scaleUpThreshold")) {
            scaleUpThreshold = (double) config.get("scaleUpThreshold");
        }
        if (config.containsKey("scaleDownThreshold")) {
            scaleDownThreshold = (double) config.get("scaleDownThreshold");
        }
        if (config.containsKey("cooldownPeriod")) {
            cooldownPeriod = (int) config.get("cooldownPeriod");
        }
    }
    
    // 手动触发扩容
    public void manualScaleUp() {
        if (serviceInstances.size() < maxInstances) {
            scaleUp();
        }
    }
    
    // 手动触发缩容
    public void manualScaleDown() {
        if (serviceInstances.size() > minInstances) {
            scaleDown();
        }
    }
    
    // 关闭自动扩缩容服务
    public void shutdown() {
        scheduler.shutdown();
    }
    
    // 服务实例类
    public static class ServiceInstance {
        private String id;
        private String status; // starting, running, stopping
        private long startTime;
        private double cpuUsage;
        
        public ServiceInstance(String id, String status, long startTime, double cpuUsage) {
            this.id = id;
            this.status = status;
            this.startTime = startTime;
            this.cpuUsage = cpuUsage;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getStartTime() { return startTime; }
        public double getCpuUsage() { return cpuUsage; }
        public void setCpuUsage(double cpuUsage) { this.cpuUsage = cpuUsage; }
    }
    
    // 扩缩容事件类
    public static class ScalingEvent {
        private String type; // scale_up, scale_down
        private String message;
        private int instanceCount;
        private long timestamp;
        
        public ScalingEvent(String type, String message, int instanceCount, long timestamp) {
            this.type = type;
            this.message = message;
            this.instanceCount = instanceCount;
            this.timestamp = timestamp;
        }
        
        // Getters
        public String getType() { return type; }
        public String getMessage() { return message; }
        public int getInstanceCount() { return instanceCount; }
        public long getTimestamp() { return timestamp; }
    }
}