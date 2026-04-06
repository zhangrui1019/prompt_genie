package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.License;
import com.promptgenie.mapper.LicenseMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LicenseService extends ServiceImpl<LicenseMapper, License> {
    
    @Autowired
    private LicenseMapper licenseMapper;
    
    private final SecureRandom secureRandom = new SecureRandom();
    private final Base64.Encoder base64Encoder = Base64.getUrlEncoder();
    
    public License createLicense(License license) {
        // 生成许可证密钥
        String licenseKey = generateLicenseKey();
        license.setLicenseKey(licenseKey);
        save(license);
        return license;
    }
    
    private String generateLicenseKey() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return base64Encoder.encodeToString(randomBytes);
    }
    
    public License getLicenseByKey(String licenseKey) {
        return licenseMapper.selectByLicenseKey(licenseKey);
    }
    
    public List<License> getUserLicenses(Long userId) {
        return licenseMapper.selectByUserId(userId);
    }
    
    public List<License> getPromptLicenses(Long promptId) {
        return licenseMapper.selectByPromptId(promptId);
    }
    
    public void updateLicenseStatus(Long licenseId, String status) {
        License license = getById(licenseId);
        if (license != null) {
            license.setStatus(status);
            updateById(license);
        }
    }
    
    public boolean validateLicense(String licenseKey) {
        License license = getLicenseByKey(licenseKey);
        if (license == null) {
            return false;
        }
        
        // 检查状态
        if (!"active".equals(license.getStatus())) {
            return false;
        }
        
        // 检查过期时间
        if (license.getExpiresAt() != null && license.getExpiresAt().isBefore(LocalDateTime.now())) {
            // 更新为过期状态
            updateLicenseStatus(license.getId(), "expired");
            return false;
        }
        
        // 检查使用次数
        if (license.getMaxUsage() != null && license.getUsageCount() >= license.getMaxUsage()) {
            return false;
        }
        
        return true;
    }
    
    public void recordLicenseUsage(String licenseKey) {
        License license = getLicenseByKey(licenseKey);
        if (license != null) {
            license.setUsageCount(license.getUsageCount() + 1);
            updateById(license);
        }
    }
}
