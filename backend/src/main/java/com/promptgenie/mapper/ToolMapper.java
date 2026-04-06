package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.Tool;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface ToolMapper extends BaseMapper<Tool> {
    
    List<Tool> selectByType(String type);
    
    List<Tool> selectByCategory(String category);
    
    List<Tool> selectPublicTools();
    
    List<Tool> selectByUserId(Long userId);
}