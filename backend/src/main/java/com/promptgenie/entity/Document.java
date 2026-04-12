package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("documents")
public class Document {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long kbId;
    private String filename;
    private String fileType;
    private String content;
    private Long fileSize;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
}
