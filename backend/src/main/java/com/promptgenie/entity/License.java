package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("licenses")
public class License {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    
    @TableField("prompt_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long promptId;
    
    @TableField("user_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long userId;
    
    @TableField("transaction_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long transactionId;
    
    @TableField("license_key")
    private String licenseKey;
    
    @TableField("usage_count")
    private Integer usageCount = 0;
    
    @TableField("max_usage")
    private Integer maxUsage;
    
    @TableField("expires_at")
    private LocalDateTime expiresAt;
    
    @TableField("status")
    private String status; // "active", "expired", "revoked"
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}