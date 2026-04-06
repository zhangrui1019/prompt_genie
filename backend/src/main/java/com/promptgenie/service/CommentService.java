package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Comment;
import com.promptgenie.auth.entity.User;
import com.promptgenie.mapper.CommentMapper;
import com.promptgenie.auth.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService extends ServiceImpl<CommentMapper, Comment> {
    
    @Autowired
    private CommentMapper commentMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    public List<Comment> getCommentsByPrompt(Long promptId) {
        List<Comment> comments = commentMapper.selectByPromptId(promptId);
        // 填充用户名
        for (Comment comment : comments) {
            User user = userMapper.selectById(comment.getUserId());
            if (user != null) {
                comment.setUsername(user.getName());
            }
        }
        return comments;
    }
    
    public Comment createComment(Comment comment) {
        save(comment);
        // 填充用户名
        User user = userMapper.selectById(comment.getUserId());
        if (user != null) {
            comment.setUsername(user.getName());
        }
        return comment;
    }
    
    public void deleteComment(Long commentId) {
        removeById(commentId);
    }
}
