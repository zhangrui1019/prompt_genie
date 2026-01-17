package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.Tag;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface TagMapper extends BaseMapper<Tag> {
    
    @Select("SELECT * FROM tags WHERE prompt_id = #{promptId}")
    List<Tag> selectByPromptId(@Param("promptId") Long promptId);

    @Select("SELECT DISTINCT name FROM tags WHERE prompt_id IN (SELECT id FROM prompts WHERE user_id = #{userId})")
    List<String> selectDistinctTagsByUserId(@Param("userId") Long userId);
    
    @Delete("DELETE FROM tags WHERE prompt_id = #{promptId}")
    void deleteByPromptId(@Param("promptId") Long promptId);
}
