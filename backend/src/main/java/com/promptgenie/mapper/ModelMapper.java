package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.Model;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ModelMapper extends BaseMapper<Model> {
    
    @Select("SELECT * FROM models WHERE status = #{status}")
    List<Model> selectByStatus(@Param("status") String status);
    
    @Select("SELECT * FROM models WHERE name = #{name}")
    Model selectByName(@Param("name") String name);
    
    @Select("SELECT * FROM models WHERE provider = #{provider}")
    List<Model> selectByProvider(@Param("provider") String provider);
}
