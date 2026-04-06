package com.promptgenie.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.auth.entity.Permission;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface PermissionMapper extends BaseMapper<Permission> {
    
    List<Permission> selectByModule(String module);
    
    Permission selectByCode(String code);
}