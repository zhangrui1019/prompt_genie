package com.promptgenie.service;

import cn.hutool.captcha.ICaptcha;

public interface CaptchaService {
    /**
     * Generate a new captcha
     * @return A map containing 'uuid' and 'image' (base64)
     */
    CaptchaResponse generateCaptcha();

    /**
     * Validate the captcha
     * @param uuid The uuid returned during generation
     * @param code The code entered by the user
     * @return true if valid
     */
    boolean validateCaptcha(String uuid, String code);
    
    record CaptchaResponse(String uuid, String imageBase64) {}
}
