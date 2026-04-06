package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("agents")
public class Agent {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    
    @TableField("name")
    private String name;
    
    @TableField("description")
    private String description;
    
    @TableField("user_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long userId;
    
    @TableField("workspace_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long workspaceId;
    
    @TableField("system_prompt")
    private String systemPrompt;
    
    @TableField("tools")
    private String tools; // JSON array of tool IDs
    
    @TableField("memory_config")
    private String memoryConfig; // JSON configuration
    
    @TableField("is_public")
    private Boolean isPublic = false;
    
    @TableField("status")
    private String status; // "draft", "published", "archived"
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}