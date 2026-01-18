package com.promptgenie.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Comment;
import com.promptgenie.entity.User;
import com.promptgenie.mapper.CommentMapper;
import com.promptgenie.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService extends ServiceImpl<CommentMapper, Comment> {
    
    @Autowired
    private UserMapper userMapper;

    public List<Comment> getCommentsByPrompt(Long promptId) {
        QueryWrapper<Comment> query = new QueryWrapper<>();
        query.eq("prompt_id", promptId)
             .orderByDesc("created_at");
        
        List<Comment> comments = baseMapper.selectList(query);
        
        // Populate username
        for (Comment comment : comments) {
            User user = userMapper.selectById(comment.getUserId());
            if (user != null) {
                comment.setUsername(user.getName());
                // comment.setUserAvatar(user.getAvatar());
            } else {
                comment.setUsername("Unknown User");
            }
        }
        return comments;
    }
}
