package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.AuditLog;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface AuditLogMapper extends BaseMapper<AuditLog> {
    
    List<AuditLog> selectByWorkspaceId(Long workspaceId);
    
    List<AuditLog> selectByResourceIdAndType(Long resourceId, String resourceType);
    
    List<AuditLog> selectByUserId(Long userId);
}