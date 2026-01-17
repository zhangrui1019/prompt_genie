package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

@Data
@TableName("tags")
public class Tag {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    
    @TableField("prompt_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long promptId;
    
    private String name;
    
    private String color;
}
