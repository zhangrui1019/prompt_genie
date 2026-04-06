package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("bots")
public class Bot {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    
    @TableField("agent_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long agentId;
    
    @TableField("user_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long userId;
    
    @TableField("name")
    private String name;
    
    @TableField("description")
    private String description;
    
    @TableField("api_key")
    private String apiKey;
    
    @TableField("endpoint")
    private String endpoint;
    
    @TableField("config")
    private String config; // JSON configuration
    
    @TableField("status")
    private String status; // "active", "inactive", "suspended"
    
    @TableField("total_calls")
    private Integer totalCalls = 0;
    
    @TableField("last_called_at")
    private LocalDateTime lastCalledAt;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}