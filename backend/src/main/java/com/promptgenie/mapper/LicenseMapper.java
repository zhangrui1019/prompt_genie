package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.License;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface LicenseMapper extends BaseMapper<License> {
    
    List<License> selectByUserId(Long userId);
    
    List<License> selectByPromptId(Long promptId);
    
    License selectByLicenseKey(String licenseKey);
    
    List<License> selectActiveByUserIdAndPromptId(Long userId, Long promptId);
}