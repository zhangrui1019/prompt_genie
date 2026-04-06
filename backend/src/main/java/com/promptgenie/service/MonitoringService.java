package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class MonitoringService {
    
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final Map<String, Double> metrics = new HashMap<>();
    private final Map<String, Double> thresholds = new HashMap<>();
    
    // 初始化监控
    public void init() {
        // 设置默认阈值
        thresholds.put("cpu_usage", 80.0);
        thresholds.put("memory_usage", 80.0);
        thresholds.put("disk_usage", 80.0);
        thresholds.put("response_time", 1000.0);
        thresholds.put("error_rate", 5.0);
        
        // 启动监控任务
        scheduler.scheduleAtFixedRate(this::collectMetrics, 0, 1, TimeUnit.MINUTES);
    }
    
    // 收集监控指标
    private void collectMetrics() {
        // 收集系统指标
        collectSystemMetrics();
        
        // 收集应用指标
        collectApplicationMetrics();
        
        // 检查告警
        checkAlerts();
    }
    
    // 收集系统指标
    private void collectSystemMetrics() {
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        
        // CPU使用率
        double cpuUsage = osBean.getSystemLoadAverage();
        metrics.put("cpu_usage", cpuUsage);
        
        // 内存使用率
        long heapMemoryUsed = memoryBean.getHeapMemoryUsage().getUsed();
        long heapMemoryMax = memoryBean.getHeapMemoryUsage().getMax();
        double memoryUsage = (double) heapMemoryUsed / heapMemoryMax * 100;
        metrics.put("memory_usage", memoryUsage);
        
        // TODO: 收集磁盘使用率
    }
    
    // 收集应用指标
    private void collectApplicationMetrics() {
        // TODO: 收集API调用次数、响应时间、错误率等
        // 这里可以从请求拦截器或日志中收集数据
    }
    
    // 检查告警
    private void checkAlerts() {
        for (Map.Entry<String, Double> entry : metrics.entrySet()) {
            String metric = entry.getKey();
            double value = entry.getValue();
            double threshold = thresholds.getOrDefault(metric, 0.0);
            
            if (value > threshold) {
                sendAlert(metric, value, threshold);
            }
        }
    }
    
    // 发送告警
    private void sendAlert(String metric, double value, double threshold) {
        // TODO: 实现告警发送逻辑
        // 可以发送邮件、短信或推送通知
        System.out.println("Alert: " + metric + " = " + value + " exceeds threshold " + threshold);
    }
    
    // 获取监控指标
    public Map<String, Double> getMetrics() {
        return metrics;
    }
    
    // 设置告警阈值
    public void setThreshold(String metric, double threshold) {
        thresholds.put(metric, threshold);
    }
    
    // 获取告警阈值
    public Map<String, Double> getThresholds() {
        return thresholds;
    }
    
    // 关闭监控
    public void shutdown() {
        scheduler.shutdown();
    }
}