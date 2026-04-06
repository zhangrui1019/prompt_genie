package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdvancedAnalyticsService {
    
    private final Map<String, List<DataPoint>> dataStore = new HashMap<>();
    
    // 初始化高级数据分析服务
    public void init() {
        // 初始化示例数据
        initSampleData();
    }
    
    // 初始化示例数据
    private void initSampleData() {
        // 生成示例用户数据
        List<DataPoint> userData = new ArrayList<>();
        for (int i = 0; i < 365; i++) {
            userData.add(new DataPoint(
                "user",
                "active_users",
                1000 + (int)(Math.random() * 500),
                System.currentTimeMillis() - (i * 24 * 60 * 60 * 1000)
            ));
        }
        dataStore.put("user", userData);
        
        // 生成示例模型使用数据
        List<DataPoint> modelData = new ArrayList<>();
        for (int i = 0; i < 365; i++) {
            modelData.add(new DataPoint(
                "model",
                "usage_count",
                500 + (int)(Math.random() * 300),
                System.currentTimeMillis() - (i * 24 * 60 * 60 * 1000)
            ));
        }
        dataStore.put("model", modelData);
        
        // 生成示例请求数据
        List<DataPoint> requestData = new ArrayList<>();
        for (int i = 0; i < 365; i++) {
            requestData.add(new DataPoint(
                "request",
                "total_requests",
                2000 + (int)(Math.random() * 1000),
                System.currentTimeMillis() - (i * 24 * 60 * 60 * 1000)
            ));
        }
        dataStore.put("request", requestData);
    }
    
    // 存储数据点
    public void storeDataPoint(String category, String metric, double value, long timestamp) {
        DataPoint dataPoint = new DataPoint(category, metric, value, timestamp);
        List<DataPoint> dataPoints = dataStore.computeIfAbsent(category, k -> new ArrayList<>());
        dataPoints.add(dataPoint);
        
        // 限制数据点数量，只保留最近的10000个数据点
        if (dataPoints.size() > 10000) {
            dataPoints.subList(0, dataPoints.size() - 10000).clear();
        }
    }
    
    // 预测分析
    public List<DataPoint> predict(String category, String metric, int days) {
        List<DataPoint> historicalData = dataStore.getOrDefault(category, Collections.emptyList());
        if (historicalData.isEmpty()) {
            return Collections.emptyList();
        }
        
        // 按时间排序
        List<DataPoint> sortedData = historicalData.stream()
            .filter(d -> metric.equals(d.getMetric()))
            .sorted(Comparator.comparing(DataPoint::getTimestamp))
            .collect(Collectors.toList());
        
        if (sortedData.size() < 2) {
            return Collections.emptyList();
        }
        
        // 简单线性回归预测
        List<DataPoint> predictions = new ArrayList<>();
        double[] x = new double[sortedData.size()];
        double[] y = new double[sortedData.size()];
        
        for (int i = 0; i < sortedData.size(); i++) {
            x[i] = i;
            y[i] = sortedData.get(i).getValue();
        }
        
        // 计算回归系数
        double[] coefficients = linearRegression(x, y);
        double slope = coefficients[0];
        double intercept = coefficients[1];
        
        // 生成预测数据
        long lastTimestamp = sortedData.get(sortedData.size() - 1).getTimestamp();
        for (int i = 1; i <= days; i++) {
            long timestamp = lastTimestamp + (i * 24 * 60 * 60 * 1000);
            double predictedValue = slope * (sortedData.size() + i - 1) + intercept;
            predictions.add(new DataPoint(category, metric, predictedValue, timestamp));
        }
        
        return predictions;
    }
    
    // 线性回归
    private double[] linearRegression(double[] x, double[] y) {
        int n = x.length;
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        for (int i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumXX += x[i] * x[i];
        }
        
        double slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        double intercept = (sumY - slope * sumX) / n;
        
        return new double[]{slope, intercept};
    }
    
    // 趋势分析
    public TrendAnalysisResult analyzeTrend(String category, String metric, long startTime, long endTime) {
        List<DataPoint> data = dataStore.getOrDefault(category, Collections.emptyList());
        List<DataPoint> filteredData = data.stream()
            .filter(d -> metric.equals(d.getMetric()))
            .filter(d -> d.getTimestamp() >= startTime && d.getTimestamp() <= endTime)
            .sorted(Comparator.comparing(DataPoint::getTimestamp))
            .collect(Collectors.toList());
        
        if (filteredData.isEmpty()) {
            return new TrendAnalysisResult("no_data", 0, 0, 0);
        }
        
        // 计算趋势
        double firstValue = filteredData.get(0).getValue();
        double lastValue = filteredData.get(filteredData.size() - 1).getValue();
        double change = lastValue - firstValue;
        double percentageChange = (change / firstValue) * 100;
        
        // 确定趋势类型
        String trendType;
        if (percentageChange > 5) {
            trendType = "increasing";
        } else if (percentageChange < -5) {
            trendType = "decreasing";
        } else {
            trendType = "stable";
        }
        
        return new TrendAnalysisResult(trendType, change, percentageChange, lastValue);
    }
    
    // 异常检测
    public List<Anomaly> detectAnomalies(String category, String metric, long startTime, long endTime) {
        List<DataPoint> data = dataStore.getOrDefault(category, Collections.emptyList());
        List<DataPoint> filteredData = data.stream()
            .filter(d -> metric.equals(d.getMetric()))
            .filter(d -> d.getTimestamp() >= startTime && d.getTimestamp() <= endTime)
            .sorted(Comparator.comparing(DataPoint::getTimestamp))
            .collect(Collectors.toList());
        
        List<Anomaly> anomalies = new ArrayList<>();
        
        if (filteredData.size() < 5) {
            return anomalies; // 数据点不足，无法检测异常
        }
        
        // 计算平均值和标准差
        List<Double> values = filteredData.stream()
            .map(DataPoint::getValue)
            .collect(Collectors.toList());
        
        double mean = values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = values.stream().mapToDouble(v -> Math.pow(v - mean, 2)).average().orElse(0.0);
        double stdDev = Math.sqrt(variance);
        
        // 检测异常（超过2个标准差）
        for (DataPoint dataPoint : filteredData) {
            double value = dataPoint.getValue();
            if (Math.abs(value - mean) > 2 * stdDev) {
                anomalies.add(new Anomaly(
                    category,
                    metric,
                    value,
                    dataPoint.getTimestamp(),
                    "Value is " + Math.abs(value - mean) / stdDev + " standard deviations from the mean"
                ));
            }
        }
        
        return anomalies;
    }
    
    // 聚类分析
    public List<Cluster> clusterData(String category, String metric, int k) {
        List<DataPoint> data = dataStore.getOrDefault(category, Collections.emptyList());
        List<DataPoint> filteredData = data.stream()
            .filter(d -> metric.equals(d.getMetric()))
            .collect(Collectors.toList());
        
        if (filteredData.size() < k) {
            return Collections.emptyList(); // 数据点不足，无法聚类
        }
        
        // K-means聚类
        List<Cluster> clusters = kMeansClustering(filteredData, k);
        return clusters;
    }
    
    // K-means聚类
    private List<Cluster> kMeansClustering(List<DataPoint> data, int k) {
        // 初始化聚类中心
        List<Double> centroids = new ArrayList<>();
        Random random = new Random();
        for (int i = 0; i < k; i++) {
            int index = random.nextInt(data.size());
            centroids.add(data.get(index).getValue());
        }
        
        List<Cluster> clusters = new ArrayList<>();
        boolean converged = false;
        
        while (!converged) {
            // 分配数据点到聚类
            clusters.clear();
            for (int i = 0; i < k; i++) {
                clusters.add(new Cluster(i, centroids.get(i)));
            }
            
            for (DataPoint dataPoint : data) {
                double minDistance = Double.MAX_VALUE;
                int closestCluster = 0;
                
                for (int i = 0; i < k; i++) {
                    double distance = Math.abs(dataPoint.getValue() - centroids.get(i));
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCluster = i;
                    }
                }
                
                clusters.get(closestCluster).addDataPoint(dataPoint);
            }
            
            // 更新聚类中心
            List<Double> newCentroids = new ArrayList<>();
            for (Cluster cluster : clusters) {
                double avg = cluster.getDataPoints().stream()
                    .mapToDouble(DataPoint::getValue)
                    .average()
                    .orElse(0.0);
                newCentroids.add(avg);
            }
            
            // 检查收敛
            converged = true;
            for (int i = 0; i < k; i++) {
                if (Math.abs(newCentroids.get(i) - centroids.get(i)) > 0.001) {
                    converged = false;
                    break;
                }
            }
            
            centroids = newCentroids;
        }
        
        return clusters;
    }
    
    // 相关性分析
    public double calculateCorrelation(String category1, String metric1, String category2, String metric2) {
        List<DataPoint> data1 = dataStore.getOrDefault(category1, Collections.emptyList());
        List<DataPoint> data2 = dataStore.getOrDefault(category2, Collections.emptyList());
        
        if (data1.isEmpty() || data2.isEmpty()) {
            return 0.0;
        }
        
        // 按时间匹配数据点
        Map<Long, Double> data1Map = data1.stream()
            .filter(d -> metric1.equals(d.getMetric()))
            .collect(Collectors.toMap(DataPoint::getTimestamp, DataPoint::getValue));
        
        Map<Long, Double> data2Map = data2.stream()
            .filter(d -> metric2.equals(d.getMetric()))
            .collect(Collectors.toMap(DataPoint::getTimestamp, DataPoint::getValue));
        
        // 找出共同的时间戳
        Set<Long> commonTimestamps = new HashSet<>(data1Map.keySet());
        commonTimestamps.retainAll(data2Map.keySet());
        
        if (commonTimestamps.size() < 2) {
            return 0.0; // 数据点不足，无法计算相关性
        }
        
        // 计算相关性
        List<Double> values1 = new ArrayList<>();
        List<Double> values2 = new ArrayList<>();
        
        for (Long timestamp : commonTimestamps) {
            values1.add(data1Map.get(timestamp));
            values2.add(data2Map.get(timestamp));
        }
        
        return calculatePearsonCorrelation(values1, values2);
    }
    
    // 计算皮尔逊相关系数
    private double calculatePearsonCorrelation(List<Double> x, List<Double> y) {
        int n = x.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
        
        for (int i = 0; i < n; i++) {
            sumX += x.get(i);
            sumY += y.get(i);
            sumXY += x.get(i) * y.get(i);
            sumXX += x.get(i) * x.get(i);
            sumYY += y.get(i) * y.get(i);
        }
        
        double numerator = n * sumXY - sumX * sumY;
        double denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
        
        if (denominator == 0) {
            return 0.0;
        }
        
        return numerator / denominator;
    }
    
    // 数据点类
    public static class DataPoint {
        private String category;
        private String metric;
        private double value;
        private long timestamp;
        
        public DataPoint(String category, String metric, double value, long timestamp) {
            this.category = category;
            this.metric = metric;
            this.value = value;
            this.timestamp = timestamp;
        }
        
        // Getters
        public String getCategory() { return category; }
        public String getMetric() { return metric; }
        public double getValue() { return value; }
        public long getTimestamp() { return timestamp; }
    }
    
    // 趋势分析结果类
    public static class TrendAnalysisResult {
        private String trendType; // increasing, decreasing, stable, no_data
        private double change;
        private double percentageChange;
        private double lastValue;
        
        public TrendAnalysisResult(String trendType, double change, double percentageChange, double lastValue) {
            this.trendType = trendType;
            this.change = change;
            this.percentageChange = percentageChange;
            this.lastValue = lastValue;
        }
        
        // Getters
        public String getTrendType() { return trendType; }
        public double getChange() { return change; }
        public double getPercentageChange() { return percentageChange; }
        public double getLastValue() { return lastValue; }
    }
    
    // 异常类
    public static class Anomaly {
        private String category;
        private String metric;
        private double value;
        private long timestamp;
        private String description;
        
        public Anomaly(String category, String metric, double value, long timestamp, String description) {
            this.category = category;
            this.metric = metric;
            this.value = value;
            this.timestamp = timestamp;
            this.description = description;
        }
        
        // Getters
        public String getCategory() { return category; }
        public String getMetric() { return metric; }
        public double getValue() { return value; }
        public long getTimestamp() { return timestamp; }
        public String getDescription() { return description; }
    }
    
    // 聚类类
    public static class Cluster {
        private int id;
        private double centroid;
        private List<DataPoint> dataPoints;
        
        public Cluster(int id, double centroid) {
            this.id = id;
            this.centroid = centroid;
            this.dataPoints = new ArrayList<>();
        }
        
        // Getters and setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public double getCentroid() { return centroid; }
        public void setCentroid(double centroid) { this.centroid = centroid; }
        public List<DataPoint> getDataPoints() { return dataPoints; }
        public void setDataPoints(List<DataPoint> dataPoints) { this.dataPoints = dataPoints; }
        public void addDataPoint(DataPoint dataPoint) { this.dataPoints.add(dataPoint); }
    }
}