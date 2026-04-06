package com.promptgenie.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("transactions")
public class Transaction {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    
    @TableField("buyer_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long buyerId;
    
    @TableField("seller_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long sellerId;
    
    @TableField("prompt_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long promptId;
    
    @TableField("amount")
    private Double amount;
    
    @TableField("transaction_type")
    private String transactionType; // "purchase" or "payment"
    
    @TableField("status")
    private String status; // "pending", "completed", "failed"
    
    @TableField("created_at")
    private LocalDateTime createdAt;
    
    @TableField("updated_at")
    private LocalDateTime updatedAt;
}