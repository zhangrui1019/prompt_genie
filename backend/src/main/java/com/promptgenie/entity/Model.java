package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("models")
public class Model {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String name;
    
    private String provider;
    
    private String modelType;
    
    private String apiKey;
    
    private String baseUrl;
    
    private String description;
    
    private String status;
    
    private Long currentVersionId;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
