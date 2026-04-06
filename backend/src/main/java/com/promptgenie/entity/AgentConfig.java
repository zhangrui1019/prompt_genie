package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("agent_configs")
public class AgentConfig {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long agentId;
    private String configJson;
    private String name;
    private String description;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}