package com.promptgenie.core.exception;

import com.promptgenie.dto.AgentState;

public class PendingApprovalException extends RuntimeException {
    private final AgentState agentState;
    
    public PendingApprovalException(String message, AgentState agentState) {
        super(message);
        this.agentState = agentState;
    }
    
    public AgentState getAgentState() {
        return agentState;
    }
}