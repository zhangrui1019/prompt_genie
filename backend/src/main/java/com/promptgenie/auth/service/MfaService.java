package com.promptgenie.auth.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.auth.entity.Mfa;
import com.promptgenie.auth.mapper.MfaMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class MfaService extends ServiceImpl<MfaMapper, Mfa> {
    
    @Autowired
    private MfaMapper mfaMapper;
    
    private static final String HMAC_SHA1_ALGORITHM = "HmacSHA1";
    private static final int TOTP_DIGITS = 6;
    private static final int TOTP_TIME_STEP = 30; // 30 seconds
    
    // 生成TOTP密钥
    public Mfa generateTotp(Long userId) {
        // 生成随机密钥
        byte[] secret = new byte[20];
        new SecureRandom().nextBytes(secret);
        String base32Secret = Base64.getEncoder().encodeToString(secret);
        
        // 生成恢复代码
        List<String> recoveryCodes = generateRecoveryCodes(10);
        String recoveryCodesJson = "[" + String.join(",", recoveryCodes.stream().map(c -> "\"" + c + "\"").toList()) + "]";
        
        // 创建MFA记录
        Mfa mfa = new Mfa();
        mfa.setUserId(userId);
        mfa.setType("totp");
        mfa.setSecret(base32Secret);
        mfa.setIsEnabled(false);
        mfa.setRecoveryCodes(recoveryCodesJson);
        
        save(mfa);
        return mfa;
    }
    
    // 验证TOTP码
    public boolean verifyTotp(Long userId, String code) {
        Mfa mfa = mfaMapper.selectByUserId(userId);
        if (mfa == null || !mfa.getIsEnabled()) {
            return false;
        }
        
        try {
            byte[] secret = Base64.getDecoder().decode(mfa.getSecret());
            long currentTime = System.currentTimeMillis() / 1000;
            long timeStep = currentTime / TOTP_TIME_STEP;
            
            // 验证当前时间步和前后各一个时间步的验证码
            for (int i = -1; i <= 1; i++) {
                long time = timeStep + i;
                if (generateTotpCode(secret, time).equals(code)) {
                    return true;
                }
            }
            
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // 启用MFA
    public void enableMfa(Long userId, String code) {
        Mfa mfa = mfaMapper.selectByUserId(userId);
        if (mfa != null && verifyTotp(userId, code)) {
            mfa.setIsEnabled(true);
            updateById(mfa);
        }
    }
    
    // 禁用MFA
    public void disableMfa(Long userId, String recoveryCode) {
        Mfa mfa = mfaMapper.selectByUserId(userId);
        if (mfa != null && verifyRecoveryCode(mfa, recoveryCode)) {
            mfa.setIsEnabled(false);
            updateById(mfa);
        }
    }
    
    // 验证恢复代码
    public boolean verifyRecoveryCode(Mfa mfa, String recoveryCode) {
        // TODO: 实现恢复代码验证逻辑
        return false;
    }
    
    // 生成恢复代码
    private List<String> generateRecoveryCodes(int count) {
        List<String> codes = new ArrayList<>();
        SecureRandom random = new SecureRandom();
        
        for (int i = 0; i < count; i++) {
            StringBuilder code = new StringBuilder();
            for (int j = 0; j < 8; j++) {
                code.append(random.nextInt(10));
            }
            codes.add(code.toString());
        }
        
        return codes;
    }
    
    // 生成TOTP码
    private String generateTotpCode(byte[] secret, long time) throws NoSuchAlgorithmException, InvalidKeyException {
        byte[] timeBytes = new byte[8];
        for (int i = 7; i >= 0; i--) {
            timeBytes[i] = (byte) (time & 0xFF);
            time >>= 8;
        }
        
        Mac hmac = Mac.getInstance(HMAC_SHA1_ALGORITHM);
        hmac.init(new SecretKeySpec(secret, HMAC_SHA1_ALGORITHM));
        byte[] hash = hmac.doFinal(timeBytes);
        
        int offset = hash[hash.length - 1] & 0xF;
        int code = ((hash[offset] & 0x7F) << 24) |
                   ((hash[offset + 1] & 0xFF) << 16) |
                   ((hash[offset + 2] & 0xFF) << 8) |
                   (hash[offset + 3] & 0xFF);
        
        code %= Math.pow(10, TOTP_DIGITS);
        return String.format("%0" + TOTP_DIGITS + "d", code);
    }
    
    // 获取用户的MFA信息
    public Mfa getMfaByUserId(Long userId) {
        return mfaMapper.selectByUserId(userId);
    }
}