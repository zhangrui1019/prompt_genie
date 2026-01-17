package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.PromptLike;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface PromptLikeMapper extends BaseMapper<PromptLike> {
    @Select("SELECT COUNT(*) > 0 FROM prompt_likes WHERE prompt_id = #{promptId} AND user_id = #{userId}")
    boolean existsByPromptIdAndUserId(@Param("promptId") Long promptId, @Param("userId") Long userId);
}
