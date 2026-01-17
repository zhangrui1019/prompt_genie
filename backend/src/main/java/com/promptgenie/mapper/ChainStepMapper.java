package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.ChainStep;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface ChainStepMapper extends BaseMapper<ChainStep> {
    @Select("SELECT * FROM chain_steps WHERE chain_id = #{chainId} ORDER BY step_order ASC")
    List<ChainStep> selectByChainId(Long chainId);
}
