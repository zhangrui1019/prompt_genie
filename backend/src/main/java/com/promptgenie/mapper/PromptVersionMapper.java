package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.PromptVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface PromptVersionMapper extends BaseMapper<PromptVersion> {
    
    @Select("SELECT * FROM prompt_versions WHERE prompt_id = #{promptId} ORDER BY version_number DESC")
    List<PromptVersion> selectByPromptId(@Param("promptId") Long promptId);

    @Select("SELECT COALESCE(MAX(version_number), 0) FROM prompt_versions WHERE prompt_id = #{promptId}")
    Integer getMaxVersionNumber(@Param("promptId") Long promptId);
}
