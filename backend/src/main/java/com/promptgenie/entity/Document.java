package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("documents")
public class Document {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @TableField("kb_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long kbId;

    private String filename;

    @TableField("file_type")
    private String fileType;

    private String content;

    @TableField("file_size")
    private Long fileSize;

    @TableField("created_at")
    private LocalDateTime createdAt;
}
