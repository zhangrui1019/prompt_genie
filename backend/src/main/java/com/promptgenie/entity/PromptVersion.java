package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("prompt_versions")
public class PromptVersion {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @TableField("prompt_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long promptId;

    @TableField("version_number")
    private Integer versionNumber;

    private String title;
    
    private String content;

    @TableField("change_note")
    private String changeNote;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
