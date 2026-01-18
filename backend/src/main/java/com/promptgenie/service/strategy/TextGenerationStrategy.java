package com.promptgenie.service.strategy;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.promptgenie.config.GenieConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class TextGenerationStrategy implements GenerationStrategy {

    @Value("${dashscope.api-key:}")
    private String apiKey;

    private final GenieConfig genieConfig;

    @Override
    public GenerationOutput generate(String prompt, String modelName, Map<String, Object> parameters) throws Exception {
        if (apiKey == null || apiKey.isEmpty()) {
            return GenerationOutput.builder()
                    .content("[Mock Text] " + prompt)
                    .inputTokens(0)
                    .outputTokens(0)
                    .build();
        }

        Generation gen = new Generation();
        Message userMsg = Message.builder().role(Role.USER.getValue()).content(prompt).build();
        
        float topP = 0.8f;
        if (parameters != null && parameters.containsKey("top_p")) {
            topP = Float.parseFloat(String.valueOf(parameters.get("top_p")));
        }

        Float temperature = null;
        if (parameters != null && parameters.containsKey("temperature")) {
            temperature = Float.parseFloat(String.valueOf(parameters.get("temperature")));
        }

        boolean enableSearch = false;
        if (parameters != null && parameters.containsKey("enable_search")) {
            enableSearch = Boolean.parseBoolean(String.valueOf(parameters.get("enable_search")));
        }

        GenerationParam.GenerationParamBuilder paramBuilder = GenerationParam.builder()
                .apiKey(apiKey)
                .model(modelName != null && !modelName.isEmpty() ? modelName : Generation.Models.QWEN_TURBO)
                .messages(Arrays.asList(userMsg))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .topP((double) topP)
                .enableSearch(enableSearch);
                
        if (temperature != null) {
             paramBuilder.temperature(temperature);
        }

        GenerationResult result = gen.call(paramBuilder.build());
        
        String content = result.getOutput().getChoices().get(0).getMessage().getContent();
        int inputTokens = 0;
        int outputTokens = 0;
        
        if (result.getUsage() != null) {
            inputTokens = result.getUsage().getInputTokens();
            outputTokens = result.getUsage().getOutputTokens();
        }
        
        return GenerationOutput.builder()
                .content(content)
                .inputTokens(inputTokens)
                .outputTokens(outputTokens)
                .build();
    }

    @Override
    public boolean supports(String modelType) {
        return "text".equalsIgnoreCase(modelType);
    }

    @Override
    public double calculateCost(String modelName, int inputTokens, int outputTokens, Map<String, Object> parameters) {
        String name = modelName != null ? modelName.toLowerCase() : "qwen-turbo";
        Map<String, GenieConfig.TextPrice> prices = genieConfig.getPricing().getText();
        
        // Find matching price or default
        GenieConfig.TextPrice price = prices.get(name);
        if (price == null) {
            // Try partial match or default
            if (name.contains("qwen-max")) price = prices.get("qwen-max");
            else if (name.contains("qwen-plus")) price = prices.get("qwen-plus");
            else price = prices.get("qwen-turbo");
        }
        
        if (price == null) return 0.0;
        
        // Handle null values in config just in case
        double inputPrice = price.getInput() != null ? price.getInput() : 0.002;
        double outputPrice = price.getOutput() != null ? price.getOutput() : 0.006;
        
        return (inputTokens / 1000.0 * inputPrice) + (outputTokens / 1000.0 * outputPrice);
    }
}
