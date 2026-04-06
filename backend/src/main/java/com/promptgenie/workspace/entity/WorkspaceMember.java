package com.promptgenie.workspace.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("workspace_members")
public class WorkspaceMember {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private Long workspaceId;
    private Long userId;
    private String role; // owner, editor, viewer
    
    private LocalDateTime createdAt;
}
