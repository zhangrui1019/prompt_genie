package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("tags")
public class Tag {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    @TableField("prompt_id")
    private Long promptId;
    
    private String name;
    
    private String color;
}
