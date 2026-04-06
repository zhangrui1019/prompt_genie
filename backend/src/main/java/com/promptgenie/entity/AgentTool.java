package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("agent_tools")
public class AgentTool {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long agentId;
    private Long toolId;
    private String config;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}