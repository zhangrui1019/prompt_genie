package com.promptgenie.prompt.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@TableName("prompt_chains")
public class PromptChain {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @TableField("user_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long userId;
    
    private Long workspaceId;
    
    private String title;
    
    private String description;

    // Legacy linear steps (keeping for backwards compatibility)
    @TableField(exist = false)
    private List<ChainStep> steps = new ArrayList<>();

    // React Flow visual data
    private String reactFlowNodes; // JSON string
    private String reactFlowEdges; // JSON string

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
