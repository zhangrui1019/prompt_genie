package com.promptgenie.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.auth.entity.UserRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Delete;

import java.util.List;

@Mapper
public interface UserRoleMapper extends BaseMapper<UserRole> {
    
    @Select("SELECT * FROM user_roles WHERE user_id = #{userId}")
    List<UserRole> selectByUserId(@Param("userId") Long userId);
    
    @Select("SELECT * FROM user_roles WHERE user_id = #{userId} AND role_id = #{roleId}")
    UserRole selectByUserIdAndRoleId(@Param("userId") Long userId, @Param("roleId") Long roleId);
    
    @Delete("DELETE FROM user_roles WHERE user_id = #{userId} AND role_id = #{roleId}")
    void deleteByUserIdAndRoleId(@Param("userId") Long userId, @Param("roleId") Long roleId);
}
