package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("comments")
public class Comment {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @TableField("prompt_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long promptId;

    @TableField("user_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long userId;

    private String content;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    // Auxiliary field for display, not in DB table directly usually, 
    // but if we want to populate it via join or separate query.
    // For simplicity with MP, we use exist=false and fill it in service.
    @TableField(exist = false)
    private String username;
    
    @TableField(exist = false)
    private String userAvatar; // If we had avatar
}
