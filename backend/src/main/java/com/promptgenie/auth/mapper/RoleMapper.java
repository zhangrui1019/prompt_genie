package com.promptgenie.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.auth.entity.Role;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RoleMapper extends BaseMapper<Role> {
    
    @Select("SELECT r.* FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = #{userId}")
    List<Role> selectByUserId(@Param("userId") Long userId);
    
    @Select("SELECT * FROM roles WHERE name = #{name}")
    Role selectByName(@Param("name") String name);
}
