package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Map;

@Data
@TableName(value = "optimizations", autoResultMap = true)
public class Optimization {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    @TableField("prompt_id")
    private Long promptId;
    
    private String model;
    
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> suggestions;
    
    @TableField("improvement_score")
    private BigDecimal improvementScore;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
