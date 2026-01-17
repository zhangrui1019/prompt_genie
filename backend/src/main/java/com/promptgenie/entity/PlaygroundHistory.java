package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("playground_history")
public class PlaygroundHistory {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @TableField("user_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long userId;

    private String prompt;

    // JSON string
    @TableField("variables")
    private String variables;

    @TableField("model_type")
    private String modelType;

    @TableField("model_name")
    private String modelName;

    // JSON string
    @TableField("parameters")
    private String parameters;

    private String result;

    @TableField("input_tokens")
    private Integer inputTokens;

    @TableField("output_tokens")
    private Integer outputTokens;

    @TableField("cost")
    private Double cost;

    @TableField("created_at")
    private LocalDateTime createdAt;
}
