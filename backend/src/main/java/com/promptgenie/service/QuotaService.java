package com.promptgenie.service;

import com.promptgenie.config.GenieConfig;
import com.promptgenie.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QuotaService {

    @Autowired
    private GenieConfig genieConfig;

    @Autowired
    private UserService userService;

    public void checkBatchQuota(Long userId, int rowCount) {
        GenieConfig.QuotaLimits limits = getLimits(userId);
        Integer max = limits.getMaxBatchRows();
        if (max != null && rowCount > max) {
            throw new RuntimeException("Batch size exceeds limit for your plan. Max allowed: " + max + ", Requested: " + rowCount);
        }
    }

    public void checkChainQuota(Long userId, int stepCount) {
        GenieConfig.QuotaLimits limits = getLimits(userId);
        Integer max = limits.getMaxChainSteps();
        if (max != null && stepCount > max) {
            throw new RuntimeException("Chain steps exceed limit for your plan. Max allowed: " + max + ", Requested: " + stepCount);
        }
    }

    public void checkEvaluationQuota(Long userId, int rowCount) {
        GenieConfig.QuotaLimits limits = getLimits(userId);
        Integer max = limits.getMaxEvaluationRows();
        if (max != null && rowCount > max) {
            throw new RuntimeException("Evaluation dataset size exceeds limit for your plan. Max allowed: " + max + ", Requested: " + rowCount);
        }
    }
    
    public GenieConfig.QuotaLimits getKbLimits(Long userId) {
        return getLimits(userId);
    }

    // TODO: Implement daily prompts check (requires Redis or DB tracking)
    // public void checkDailyPrompts(Long userId) { ... }

    private GenieConfig.QuotaLimits getLimits(Long userId) {
        User user = userService.getById(userId);
        String plan = user != null ? user.getPlan() : "free";
        
        GenieConfig.QuotaConfig quotaConfig = genieConfig.getQuota();
        if (quotaConfig == null) {
            // Fallback defaults if config is missing
            GenieConfig.QuotaLimits defaults = new GenieConfig.QuotaLimits();
            defaults.setMaxBatchRows(10);
            defaults.setMaxChainSteps(5);
            defaults.setMaxEvaluationRows(10);
            return defaults;
        }

        if ("pro".equalsIgnoreCase(plan) && quotaConfig.getPro() != null) {
            return quotaConfig.getPro();
        }
        return quotaConfig.getFree() != null ? quotaConfig.getFree() : new GenieConfig.QuotaLimits();
    }
}
