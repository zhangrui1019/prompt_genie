package com.promptgenie.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.auth.entity.Mfa;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MfaMapper extends BaseMapper<Mfa> {
    
    Mfa selectByUserId(Long userId);
}