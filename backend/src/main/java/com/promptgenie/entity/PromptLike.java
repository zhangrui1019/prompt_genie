package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("prompt_likes")
public class PromptLike {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    @TableField("prompt_id")
    private Long promptId;

    @TableField("user_id")
    private Long userId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
