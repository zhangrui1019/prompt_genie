package com.promptgenie.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "genie")
@Data
public class GenieConfig {

    private DashScopeConfig dashscope;
    private PricingConfig pricing;
    private QuotaConfig quota;

    @Data
    public static class DashScopeConfig {
        private String videoSubmitUrl;
        private String taskStatusUrl;
        private Map<String, Map<String, String>> models;
    }

    @Data
    public static class PricingConfig {
        private Map<String, TextPrice> text;
        private Map<String, Double> image;
        private Map<String, Double> video;
    }

    @Data
    public static class TextPrice {
        private Double input;
        private Double output;
    }

    @Data
    public static class QuotaConfig {
        private QuotaLimits free;
        private QuotaLimits pro;
    }

    @Data
    public static class QuotaLimits {
        private Integer dailyPrompts; // e.g. 50
        private Integer maxBatchRows; // e.g. 10 vs 1000
        private Integer maxChainSteps; // e.g. 3 vs 20
        private Integer maxEvaluationRows; // e.g. 10 vs 500
        
        // KB Limits
        private Integer maxKbDocs; // e.g. 3 vs 50
        private Integer maxKbContextChars; // e.g. 2000 vs 50000
    }
}
