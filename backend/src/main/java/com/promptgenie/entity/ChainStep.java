package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

@Data
@TableName("chain_steps")
public class ChainStep {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @TableField("chain_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long chainId;

    @TableField("prompt_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long promptId;

    @TableField("step_order")
    private Integer stepOrder;
    
    // The variable name in the NEXT prompt that will receive this step's output
    @TableField("target_variable")
    private String targetVariable;

    @TableField("model_type")
    private String modelType; // text, image, video

    @TableField("model_name")
    private String modelName;

    // JSON string for parameters
    @TableField("parameters")
    private String parameters;
    
    @TableField(exist = false)
    private Prompt prompt; // Loaded prompt details
}
