package com.promptgenie.service.strategy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.promptgenie.core.config.GenieConfig;
import com.promptgenie.core.config.ProvidersConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class OpenAICompatibleStrategy implements GenerationStrategy {

    private final ProvidersConfig providersConfig;
    private final GenieConfig genieConfig;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public GenerationOutput generate(String prompt, String modelName, Map<String, Object> parameters) throws Exception {
        ProvidersConfig.OpenAiConfig config = findProviderConfig(modelName);
        if (config == null) {
            throw new IllegalArgumentException("No provider configuration found for model: " + modelName);
        }

        String url = config.getBaseUrl();
        if (url == null) throw new IllegalArgumentException("Base URL not configured for model: " + modelName);
        
        if (!url.endsWith("/")) url += "/";
        if (!url.endsWith("chat/completions")) url += "chat/completions";

        ObjectNode root = objectMapper.createObjectNode();
        root.put("model", modelName);
        
        ArrayNode messages = root.putArray("messages");
        ObjectNode userMessage = messages.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);

        if (parameters != null) {
            if (parameters.containsKey("temperature")) {
                try {
                    root.put("temperature", Double.parseDouble(String.valueOf(parameters.get("temperature"))));
                } catch (NumberFormatException e) {
                    // Ignore
                }
            }
            if (parameters.containsKey("top_p")) {
                try {
                    root.put("top_p", Double.parseDouble(String.valueOf(parameters.get("top_p"))));
                } catch (NumberFormatException e) {
                    // Ignore
                }
            }
            if (parameters.containsKey("max_tokens")) {
                 try {
                    root.put("max_tokens", Integer.parseInt(String.valueOf(parameters.get("max_tokens"))));
                } catch (NumberFormatException e) {
                    // Ignore
                }
            }
        }

        String requestBody = objectMapper.writeValueAsString(root);
        
        HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json");
        
        if (config.getApiKey() != null && !config.getApiKey().isEmpty()) {
            reqBuilder.header("Authorization", "Bearer " + config.getApiKey());
        }
                
        HttpRequest request = reqBuilder.POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() >= 400) {
            throw new RuntimeException("Provider returned error: " + response.statusCode() + " " + response.body());
        }

        JsonNode responseNode = objectMapper.readTree(response.body());
        
        if (!responseNode.has("choices") || responseNode.get("choices").isEmpty()) {
             throw new RuntimeException("Invalid response from provider: " + response.body());
        }
        
        String content = responseNode.path("choices").get(0).path("message").path("content").asText();
        
        int inputTokens = responseNode.path("usage").path("prompt_tokens").asInt(0);
        int outputTokens = responseNode.path("usage").path("completion_tokens").asInt(0);

        return GenerationOutput.builder()
                .content(content)
                .inputTokens(inputTokens)
                .outputTokens(outputTokens)
                .build();
    }

    @Override
    public boolean supports(String modelType, String modelName) {
        if (!"text".equalsIgnoreCase(modelType)) return false;
        if (modelName == null || modelName.isEmpty()) return false;
        return findProviderConfig(modelName) != null;
    }

    @Override
    public double calculateCost(String modelName, int inputTokens, int outputTokens, Map<String, Object> parameters) {
        String name = modelName != null ? modelName.toLowerCase() : "";
        
        // 1. Try unified pricing config
        Map<String, GenieConfig.TextPrice> prices = genieConfig.getPricing().getText();
        if (prices != null) {
            GenieConfig.TextPrice price = prices.get(name);
            if (price != null) {
                 double inputPrice = price.getInput() != null ? price.getInput() : 0.0;
                 double outputPrice = price.getOutput() != null ? price.getOutput() : 0.0;
                 return (inputTokens / 1000.0 * inputPrice) + (outputTokens / 1000.0 * outputPrice);
            }
        }
        
        return 0.0;
    }

    private ProvidersConfig.OpenAiConfig findProviderConfig(String modelName) {
        if (providersConfig.getOpenai() == null) return null;
        
        for (ProvidersConfig.OpenAiConfig config : providersConfig.getOpenai().values()) {
            if (config.getModels() != null && config.getModels().contains(modelName)) {
                return config;
            }
        }
        return null;
    }
}
