package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("playground_history")
public class PlaygroundHistory {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    private String prompt;
    private String modelType;
    private String modelName;
    private String result;
    private Integer inputTokens;
    private Integer outputTokens;
    private Double cost;
    private String variables;
    private String parameters;
    private LocalDateTime createdAt;
    
}
