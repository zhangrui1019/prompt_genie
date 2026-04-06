package com.promptgenie.workspace.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.workspace.entity.WorkspaceMember;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Delete;

import java.util.List;

@Mapper
public interface WorkspaceMemberMapper extends BaseMapper<WorkspaceMember> {
    
    @Select("SELECT * FROM workspace_members WHERE workspace_id = #{workspaceId}")
    List<WorkspaceMember> selectByWorkspaceId(@Param("workspaceId") Long workspaceId);
    
    @Select("SELECT * FROM workspace_members WHERE workspace_id = #{workspaceId} AND user_id = #{userId}")
    WorkspaceMember selectByWorkspaceIdAndUserId(@Param("workspaceId") Long workspaceId, @Param("userId") Long userId);
    
    @Delete("DELETE FROM workspace_members WHERE workspace_id = #{workspaceId}")
    void deleteByWorkspaceId(@Param("workspaceId") Long workspaceId);
    
    @Delete("DELETE FROM workspace_members WHERE workspace_id = #{workspaceId} AND user_id = #{userId}")
    void deleteByWorkspaceIdAndUserId(@Param("workspaceId") Long workspaceId, @Param("userId") Long userId);
}
