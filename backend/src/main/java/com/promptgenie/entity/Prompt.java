package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@Data
@TableName(value = "prompts", autoResultMap = true)
public class Prompt {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    private String title;
    
    private String content;
    
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> variables = new HashMap<>();
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
