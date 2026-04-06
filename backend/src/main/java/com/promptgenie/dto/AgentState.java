package com.promptgenie.dto;

import java.util.Map;
import java.util.List;

public class AgentState {
    private String id;
    private Long agentId;
    private Long userId;
    private List<Message> messages;
    private Map<String, Object> variables;
    private Map<String, Object> intermediateResults;
    private String currentNodeId;
    private String status; // RUNNING, PAUSED, COMPLETED, FAILED
    private String errorMessage;
    private long createdAt;
    private long updatedAt;
    
    public static class Message {
        private String role;
        private String content;
        private long timestamp;
        
        public Message() {
        }
        
        public Message(String role, String content) {
            this.role = role;
            this.content = content;
            this.timestamp = System.currentTimeMillis();
        }
        
        // Getters and setters
        public String getRole() {
            return role;
        }
        public void setRole(String role) {
            this.role = role;
        }
        public String getContent() {
            return content;
        }
        public void setContent(String content) {
            this.content = content;
        }
        public long getTimestamp() {
            return timestamp;
        }
        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }
    }
    
    // Getters and setters
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public Long getAgentId() {
        return agentId;
    }
    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public List<Message> getMessages() {
        return messages;
    }
    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }
    public Map<String, Object> getVariables() {
        return variables;
    }
    public void setVariables(Map<String, Object> variables) {
        this.variables = variables;
    }
    public Map<String, Object> getIntermediateResults() {
        return intermediateResults;
    }
    public void setIntermediateResults(Map<String, Object> intermediateResults) {
        this.intermediateResults = intermediateResults;
    }
    public String getCurrentNodeId() {
        return currentNodeId;
    }
    public void setCurrentNodeId(String currentNodeId) {
        this.currentNodeId = currentNodeId;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getErrorMessage() {
        return errorMessage;
    }
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    public long getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
    public long getUpdatedAt() {
        return updatedAt;
    }
    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }
}