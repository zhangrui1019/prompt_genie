package com.promptgenie.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "genie.dashscope")
public class GenieConfig {
    private String videoSubmitUrl;
    private String taskStatusUrl;
    private PricingConfig pricing;

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
}
