package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.Prompt;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface PromptMapper extends BaseMapper<Prompt> {
    
    @Select("SELECT * FROM prompts WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<Prompt> selectByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    @Select("<script>" +
            "SELECT p.* FROM prompts p " +
            "WHERE p.user_id = #{userId} " +
            "<if test='search != null'>" +
            "AND LOWER(p.title) LIKE LOWER(CONCAT('%', #{search}, '%')) " +
            "</if>" +
            "<if test='tag != null'>" +
            "AND EXISTS (SELECT 1 FROM tags t WHERE t.prompt_id = p.id AND t.name = #{tag}) " +
            "</if>" +
            "ORDER BY p.created_at DESC" +
            "</script>")
    List<Prompt> selectByUserIdAndFilters(@Param("userId") Long userId,
                                          @Param("search") String search,
                                          @Param("tag") String tag);

    @Select("<script>" +
            "SELECT p.* FROM prompts p " +
            "WHERE p.is_public = true " +
            "<if test='search != null'>" +
            "AND LOWER(p.title) LIKE LOWER(CONCAT('%', #{search}, '%')) " +
            "</if>" +
            "ORDER BY p.created_at DESC" +
            "</script>")
    List<Prompt> selectPublicPrompts(@Param("search") String search);
}
