package com.promptgenie.service.impl;

import cn.hutool.captcha.CaptchaUtil;
import cn.hutool.captcha.LineCaptcha;
import cn.hutool.core.lang.UUID;
import cn.hutool.core.util.StrUtil;
import com.promptgenie.service.CaptchaService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class CaptchaServiceImpl implements CaptchaService {

    // Use in-memory storage instead of Redis
    private final Map<String, CaptchaInfo> captchaStore = new ConcurrentHashMap<>();
    
    private static final long EXPIRATION_MINUTES = 5;
    private static final String CAPTCHA_PREFIX = "captcha:";

    @Override
    public CaptchaService.CaptchaResponse generateCaptcha() {
        LineCaptcha lineCaptcha = CaptchaUtil.createLineCaptcha(200, 100, 4, 20);
        String code = lineCaptcha.getCode();
        String uuid = UUID.randomUUID().toString();
        String imageBase64 = lineCaptcha.getImageBase64Data();
        // Ensure the base64 string has the correct prefix
        if (!imageBase64.startsWith("data:image/png;base64,")) {
            imageBase64 = "data:image/png;base64," + imageBase64;
        }

        // Store in memory with expiration
        captchaStore.put(uuid, new CaptchaInfo(code, System.currentTimeMillis() + EXPIRATION_MINUTES * 60 * 1000));

        return new CaptchaService.CaptchaResponse(uuid, imageBase64);
    }

    @Override
    public boolean validateCaptcha(String uuid, String code) {
        if (StrUtil.isBlank(uuid) || StrUtil.isBlank(code)) {
            return false;
        }
        
        CaptchaInfo captchaInfo = captchaStore.get(uuid);
        
        if (captchaInfo == null || System.currentTimeMillis() > captchaInfo.getExpirationTime()) {
            // Remove expired captcha
            captchaStore.remove(uuid);
            return false;
        }

        boolean isValid = captchaInfo.getCode().equalsIgnoreCase(code);
        if (isValid) {
            // Invalidate after successful use to prevent replay
            captchaStore.remove(uuid);
        }
        return isValid;
    }

    // Inner class to store captcha information
    private static class CaptchaInfo {
        private final String code;
        private final long expirationTime;

        public CaptchaInfo(String code, long expirationTime) {
            this.code = code;
            this.expirationTime = expirationTime;
        }

        public String getCode() {
            return code;
        }

        public long getExpirationTime() {
            return expirationTime;
        }
    }
}
