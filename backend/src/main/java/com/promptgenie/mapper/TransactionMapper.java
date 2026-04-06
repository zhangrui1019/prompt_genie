package com.promptgenie.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.promptgenie.entity.Transaction;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TransactionMapper extends BaseMapper<Transaction> {
    
    @Select("SELECT * FROM transactions WHERE buyer_id = #{userId} OR seller_id = #{userId}")
    List<Transaction> selectByUserId(@Param("userId") Long userId);
    
    @Select("SELECT * FROM transactions WHERE buyer_id = #{userId}")
    List<Transaction> selectByBuyerId(@Param("userId") Long userId);
    
    @Select("SELECT * FROM transactions WHERE seller_id = #{userId}")
    List<Transaction> selectBySellerId(@Param("userId") Long userId);
    
    @Select("SELECT * FROM transactions WHERE prompt_id = #{promptId}")
    List<Transaction> selectByPromptId(@Param("promptId") Long promptId);
    
    @Select("SELECT * FROM transactions WHERE status = #{status}")
    List<Transaction> selectByStatus(@Param("status") String status);
}
