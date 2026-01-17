package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.User;
import com.promptgenie.mapper.UserMapper;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import java.util.UUID;

@Service
public class UserService extends ServiceImpl<UserMapper, User> {
    
    public User findByEmail(String email) {
        return baseMapper.selectByEmail(email);
    }
    
    public boolean existsByEmail(String email) {
        return baseMapper.existsByEmail(email);
    }

    public String generateApiKey() {
        return "sk-pg-" + UUID.randomUUID().toString().replace("-", "");
    }

    public User findByApiKey(String apiKey) {
        QueryWrapper<User> query = new QueryWrapper<>();
        query.eq("api_key", apiKey);
        return baseMapper.selectOne(query);
    }

    public void updatePlan(Long userId, String plan) {
        User user = getById(userId);
        if (user != null) {
            user.setPlan(plan);
            updateById(user);
        }
    }
}
