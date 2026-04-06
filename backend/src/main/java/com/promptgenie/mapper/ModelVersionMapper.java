package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.ModelVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ModelVersionMapper extends BaseMapper<ModelVersion> {
    
    @Select("SELECT * FROM model_versions WHERE model_id = #{modelId} ORDER BY created_at DESC")
    List<ModelVersion> selectByModelId(@Param("modelId") Long modelId);
    
    @Select("SELECT * FROM model_versions WHERE version_code = #{versionCode}")
    ModelVersion selectByVersionCode(@Param("versionCode") String versionCode);
}
