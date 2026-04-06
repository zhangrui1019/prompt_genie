package com.promptgenie.core.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "genie.providers")
public class ProvidersConfig {

    private Map<String, OpenAiConfig> openai;

    @Data
    public static class OpenAiConfig {
        private String baseUrl;
        private String apiKey;
        private List<String> models;
        private String modelType; // text, image, etc.
    }
}