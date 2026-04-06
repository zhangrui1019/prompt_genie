package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MemoryService {
    
    // 短期记忆存储（会话级）
    private final Map<Long, List<MemoryEntry>> shortTermMemory = new ConcurrentHashMap<>();
    
    // 长期记忆存储（知识库级）
    private final Map<Long, List<MemoryEntry>> longTermMemory = new ConcurrentHashMap<>();
    
    // 记忆条目
    public static class MemoryEntry {
        private String content;
        private String metadata;
        private long timestamp;
        private double relevance;
        
        public MemoryEntry(String content, String metadata, double relevance) {
            this.content = content;
            this.metadata = metadata;
            this.timestamp = System.currentTimeMillis();
            this.relevance = relevance;
        }
        
        // Getters and setters
        public String getContent() { return content; }
        public String getMetadata() { return metadata; }
        public long getTimestamp() { return timestamp; }
        public double getRelevance() { return relevance; }
        public void setRelevance(double relevance) { this.relevance = relevance; }
    }
    
    // 添加短期记忆
    public void addShortTermMemory(Long agentId, String content, String metadata) {
        List<MemoryEntry> memories = shortTermMemory.computeIfAbsent(agentId, k -> new ArrayList<>());
        memories.add(new MemoryEntry(content, metadata, 1.0));
        
        // 限制短期记忆大小
        if (memories.size() > 100) {
            memories.subList(0, memories.size() - 100).clear();
        }
    }
    
    // 添加长期记忆
    public void addLongTermMemory(Long agentId, String content, String metadata, double relevance) {
        List<MemoryEntry> memories = longTermMemory.computeIfAbsent(agentId, k -> new ArrayList<>());
        memories.add(new MemoryEntry(content, metadata, relevance));
        
        // 限制长期记忆大小
        if (memories.size() > 1000) {
            // 按相关性排序，保留相关性高的记忆
            memories.sort(Comparator.comparingDouble(MemoryEntry::getRelevance).reversed());
            memories.subList(1000, memories.size()).clear();
        }
    }
    
    // 检索相关记忆
    public List<MemoryEntry> retrieveMemories(Long agentId, String query, int limit) {
        List<MemoryEntry> allMemories = new ArrayList<>();
        
        // 首先检索短期记忆
        if (shortTermMemory.containsKey(agentId)) {
            allMemories.addAll(shortTermMemory.get(agentId));
        }
        
        // 然后检索长期记忆
        if (longTermMemory.containsKey(agentId)) {
            allMemories.addAll(longTermMemory.get(agentId));
        }
        
        // 计算与查询的相关性
        for (MemoryEntry entry : allMemories) {
            double relevance = calculateRelevance(entry.getContent(), query);
            entry.setRelevance(relevance);
        }
        
        // 按相关性排序并限制数量
        allMemories.sort(Comparator.comparingDouble(MemoryEntry::getRelevance).reversed());
        return allMemories.subList(0, Math.min(limit, allMemories.size()));
    }
    
    // 计算相关性
    private double calculateRelevance(String content, String query) {
        // 简单的相关性计算，实际应该使用更复杂的算法
        String[] contentWords = content.toLowerCase().split("\\s+");
        String[] queryWords = query.toLowerCase().split("\\s+");
        
        Set<String> contentSet = new HashSet<>(Arrays.asList(contentWords));
        Set<String> querySet = new HashSet<>(Arrays.asList(queryWords));
        
        // 计算交集大小
        contentSet.retainAll(querySet);
        double intersectionSize = contentSet.size();
        
        // 计算并集大小
        Set<String> unionSet = new HashSet<>(Arrays.asList(contentWords));
        unionSet.addAll(Arrays.asList(queryWords));
        double unionSize = unionSet.size();
        
        // 返回Jaccard相似度
        return unionSize > 0 ? intersectionSize / unionSize : 0.0;
    }
    
    // 清理过期的短期记忆
    public void cleanShortTermMemory(Long agentId, long maxAgeMs) {
        if (shortTermMemory.containsKey(agentId)) {
            List<MemoryEntry> memories = shortTermMemory.get(agentId);
            long cutoffTime = System.currentTimeMillis() - maxAgeMs;
            memories.removeIf(entry -> entry.getTimestamp() < cutoffTime);
        }
    }
    
    // 清理长期记忆
    public void cleanLongTermMemory(Long agentId, double minRelevance) {
        if (longTermMemory.containsKey(agentId)) {
            List<MemoryEntry> memories = longTermMemory.get(agentId);
            memories.removeIf(entry -> entry.getRelevance() < minRelevance);
        }
    }
    
    // 构建记忆提示
    public String buildMemoryPrompt(Long agentId, String query, int limit) {
        List<MemoryEntry> relevantMemories = retrieveMemories(agentId, query, limit);
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("相关记忆：\n");
        
        for (MemoryEntry entry : relevantMemories) {
            prompt.append("- " + entry.getContent() + "\n");
        }
        
        return prompt.toString();
    }
}