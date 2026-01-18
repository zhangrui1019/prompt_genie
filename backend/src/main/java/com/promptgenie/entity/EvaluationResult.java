package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@TableName(value = "evaluation_results", autoResultMap = true)
public class EvaluationResult {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @TableField("job_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long jobId;

    @TableField(value = "input_data", typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> inputData;

    @TableField(value = "model_outputs", typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> modelOutputs; // Key: ModelName, Value: Output String

    @TableField(value = "scores", typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> scores; // Key: ModelName, Value: Score/Analysis

    private Long latency; // Total execution time in ms

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
