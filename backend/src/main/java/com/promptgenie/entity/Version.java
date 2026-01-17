package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("versions")
public class Version {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    @TableField("prompt_id")
    private Long promptId;
    
    @TableField("version_number")
    private Integer versionNumber;
    
    private String content;
    
    @TableField("change_description")
    private String changeDescription;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
