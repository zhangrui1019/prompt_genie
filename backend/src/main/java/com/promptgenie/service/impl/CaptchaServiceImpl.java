package com.promptgenie.service.impl;

import cn.hutool.captcha.CaptchaUtil;
import cn.hutool.captcha.LineCaptcha;
import cn.hutool.core.lang.UUID;
import cn.hutool.core.util.StrUtil;
import com.promptgenie.service.CaptchaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class CaptchaServiceImpl implements CaptchaService {

    @Autowired
    private StringRedisTemplate redisTemplate;
    
    private static final long EXPIRATION_MINUTES = 5;
    private static final String CAPTCHA_PREFIX = "captcha:";

    @Override
    public CaptchaResponse generateCaptcha() {
        LineCaptcha lineCaptcha = CaptchaUtil.createLineCaptcha(200, 100, 4, 20);
        String code = lineCaptcha.getCode();
        String uuid = UUID.randomUUID().toString();
        String imageBase64 = lineCaptcha.getImageBase64Data();

        // Store in Redis with expiration
        redisTemplate.opsForValue().set(CAPTCHA_PREFIX + uuid, code, EXPIRATION_MINUTES, TimeUnit.MINUTES);

        return new CaptchaResponse(uuid, "data:image/png;base64," + imageBase64);
    }

    @Override
    public boolean validateCaptcha(String uuid, String code) {
        if (StrUtil.isBlank(uuid) || StrUtil.isBlank(code)) {
            return false;
        }
        
        String key = CAPTCHA_PREFIX + uuid;
        String storedCode = redisTemplate.opsForValue().get(key);
        
        if (storedCode == null) {
            return false;
        }

        boolean isValid = storedCode.equalsIgnoreCase(code);
        if (isValid) {
            // Invalidate after successful use to prevent replay
            redisTemplate.delete(key);
        }
        return isValid;
    }
}
