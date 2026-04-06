package com.promptgenie.prompt.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.prompt.entity.Prompt;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface PromptMapper extends BaseMapper<Prompt> {
    
    @Select("SELECT * FROM prompts WHERE workspace_id = #{workspaceId} ORDER BY created_at DESC")
    List<Prompt> selectByWorkspaceId(Long workspaceId);

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

    @Select("<script>" +
            "SELECT p.* FROM prompts p " +
            "WHERE p.is_public = true AND p.status = 'PUBLISHED' " +
            "<if test='search != null and search != \"\"'>" +
            "AND (LOWER(p.title) LIKE LOWER(CONCAT('%', #{search}, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', #{search}, '%'))) " +
            "</if>" +
            "<if test='category != null and category != \"\"'>" +
            "AND p.category = #{category} " +
            "</if>" +
            "<if test='scene != null and scene != \"\"'>" +
            "AND p.scene = #{scene} " +
            "</if>" +
            "<if test='assetType != null and assetType != \"\"'>" +
            "AND p.asset_type = #{assetType} " +
            "</if>" +
            "<choose>" +
            "<when test='sort != null and sort == \"featured\"'>" +
            "ORDER BY p.is_featured DESC, p.featured_rank ASC NULLS LAST, p.published_at DESC, p.created_at DESC " +
            "</when>" +
            "<when test='sort != null and sort == \"trending\"'>" +
            "ORDER BY (0.5 * LN(1 + COALESCE(p.forks_count, 0)) + 0.3 * LN(1 + COALESCE(p.likes_count, 0)) + 0.2 * LN(1 + COALESCE(p.usage_count, 0)) - 0.1 * (EXTRACT(EPOCH FROM (NOW() - COALESCE(p.published_at, p.created_at))) / 86400.0)) DESC, p.created_at DESC " +
            "</when>" +
            "<otherwise>" +
            "ORDER BY COALESCE(p.published_at, p.created_at) DESC, p.created_at DESC " +
            "</otherwise>" +
            "</choose>" +
            "</script>")
    List<Prompt> selectPublicPromptsAdvanced(@Param("search") String search,
                                            @Param("category") String category,
                                            @Param("scene") String scene,
                                            @Param("assetType") String assetType,
                                            @Param("sort") String sort);

    @Select("SELECT DISTINCT category FROM prompts WHERE is_public = true AND status = 'PUBLISHED' AND category IS NOT NULL AND category <> '' ORDER BY category")
    List<String> selectDistinctPublicCategories();

    @Select("<script>" +
            "SELECT DISTINCT scene FROM prompts WHERE is_public = true AND status = 'PUBLISHED' AND scene IS NOT NULL AND scene != '' " +
            "<if test='category != null and category != \"\"'> AND category = #{category} </if>" +
            "ORDER BY scene" +
            "</script>")
    List<String> selectDistinctPublicScenes(@Param("category") String category);

    @Select("<script>" +
            "SELECT DISTINCT asset_type FROM prompts WHERE is_public = true AND status = 'PUBLISHED' AND asset_type IS NOT NULL AND asset_type != '' " +
            "<if test='category != null and category != \"\"'> AND category = #{category} </if>" +
            "<if test='scene != null and scene != \"\"'> AND scene = #{scene} </if>" +
            "ORDER BY asset_type" +
            "</script>")
    List<String> selectDistinctPublicAssetTypes(@Param("category") String category, @Param("scene") String scene);

    @Select("SELECT * FROM prompts WHERE user_id = #{userId} AND is_public = true ORDER BY created_at DESC")
    List<Prompt> selectPublicPromptsByUserId(@Param("userId") Long userId);
}
