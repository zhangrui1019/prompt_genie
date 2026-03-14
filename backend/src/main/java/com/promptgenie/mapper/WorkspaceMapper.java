package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.Workspace;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface WorkspaceMapper extends BaseMapper<Workspace> {
    
    @Select("SELECT w.* FROM workspaces w " +
            "INNER JOIN workspace_members wm ON w.id = wm.workspace_id " +
            "WHERE wm.user_id = #{userId}")
    List<Workspace> selectByUserId(Long userId);
}
