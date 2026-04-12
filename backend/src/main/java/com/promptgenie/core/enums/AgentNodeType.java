package com.promptgenie.core.enums;

public enum AgentNodeType {
    LLM_NODE("llm"),
    TOOL_NODE("tool"),
    HUMAN_APPROVAL_NODE("human_approval"),
    CONDITION_NODE("condition"),
    LOOP_NODE("loop"),
    ERROR_RETRY_NODE("error_retry");
    
    private final String value;
    
    AgentNodeType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    public static AgentNodeType fromValue(String value) {
        for (AgentNodeType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown node type: " + value);
    }
}