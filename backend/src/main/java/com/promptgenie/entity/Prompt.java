package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@Data
@TableName(value = "prompts", autoResultMap = true)
public class Prompt {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    
    @TableField("user_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long userId;
    
    private String title;
    
    private String content;
    
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> variables = new HashMap<>();

    @TableField(exist = false)
    private List<Tag> tags = new ArrayList<>();
    
    @TableField("is_public")
    private Boolean isPublic = false;

    @TableField("likes_count")
    private Integer likesCount = 0;

    @TableField("usage_count")
    private Integer usageCount = 0;

    @TableField(exist = false)
    private Boolean isLiked = false;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
