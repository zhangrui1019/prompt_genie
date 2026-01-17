package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.User;
import com.promptgenie.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class UserService extends ServiceImpl<UserMapper, User> {
    
    public User findByEmail(String email) {
        return baseMapper.selectByEmail(email);
    }
    
    public boolean existsByEmail(String email) {
        return baseMapper.existsByEmail(email);
    }
}
