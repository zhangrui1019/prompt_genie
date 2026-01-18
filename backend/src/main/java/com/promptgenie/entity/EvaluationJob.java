package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

@Data
@TableName(value = "evaluation_jobs", autoResultMap = true)
public class EvaluationJob {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @TableField("user_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long userId;

    @TableField("prompt_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long promptId;

    private String name;
    
    private String status; // PENDING, RUNNING, COMPLETED, FAILED

    @TableField("dataset_path")
    private String datasetPath;

    @TableField(value = "model_configs", typeHandler = JacksonTypeHandler.class)
    private List<Map<String, Object>> modelConfigs;

    @TableField(value = "evaluation_dimensions", typeHandler = JacksonTypeHandler.class)
    private List<String> evaluationDimensions;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
