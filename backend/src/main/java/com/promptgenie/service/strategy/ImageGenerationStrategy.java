package com.promptgenie.service.strategy;

import com.alibaba.dashscope.aigc.imagesynthesis.ImageSynthesis;
import com.alibaba.dashscope.aigc.imagesynthesis.ImageSynthesisParam;
import com.alibaba.dashscope.aigc.imagesynthesis.ImageSynthesisResult;
import com.promptgenie.config.GenieConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImageGenerationStrategy implements GenerationStrategy {

    @Value("${dashscope.api-key:}")
    private String apiKey;

    private final GenieConfig genieConfig;

    @Override
    public GenerationOutput generate(String prompt, String modelName, Map<String, Object> parameters) throws Exception {
        if (apiKey == null || apiKey.isEmpty()) {
            return GenerationOutput.builder()
                    .content("[Mock Image URL]")
                    .inputTokens(0)
                    .outputTokens(0)
                    .build();
        }

        String size = "1024*1024";
        int n = 1;
        
        if (parameters != null) {
            if (parameters.containsKey("size")) size = (String) parameters.get("size");
            if (parameters.containsKey("n")) n = Integer.parseInt(String.valueOf(parameters.get("n")));
        }

        ImageSynthesis is = new ImageSynthesis();
        ImageSynthesisParam param = ImageSynthesisParam.builder()
                .apiKey(apiKey)
                .model(modelName != null && !modelName.isEmpty() ? modelName : "wanx-v1")
                .prompt(prompt)
                .n(n)
                .size(size)
                .build();

        ImageSynthesisResult result = is.call(param);
        String url = result.getOutput().getResults().get(0).get("url");

        return GenerationOutput.builder()
                .content(url)
                .inputTokens(0)
                .outputTokens(0)
                .build();
    }

    @Override
    public boolean supports(String modelType) {
        return "image".equalsIgnoreCase(modelType);
    }

    @Override
    public double calculateCost(String modelName, int inputTokens, int outputTokens, Map<String, Object> parameters) {
        String name = modelName != null ? modelName.toLowerCase() : "wanx-v1";
        Map<String, Double> prices = genieConfig.getPricing().getImage();
        
        Double pricePerImage = prices.getOrDefault(name, prices.get("wanx-v1"));
        if (pricePerImage == null) pricePerImage = 0.2;

        int n = 1;
        if (parameters != null && parameters.containsKey("n")) {
            try {
                n = Integer.parseInt(String.valueOf(parameters.get("n")));
            } catch (NumberFormatException e) { n = 1; }
        }
        
        return n * pricePerImage;
    }
}
