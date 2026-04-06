package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("model_versions")
public class ModelVersion {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long modelId;
    
    private String versionName;
    
    private String versionCode;
    
    private String description;
    
    private String modelPath;
    
    private String modelConfig;
    
    private String status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
