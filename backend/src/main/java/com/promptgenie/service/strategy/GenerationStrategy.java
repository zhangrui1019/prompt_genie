package com.promptgenie.service.strategy;

import java.util.Map;

public interface GenerationStrategy {
    /**
     * Executes the generation request.
     *
     * @param prompt      The user prompt/input
     * @param modelName   The specific model name (e.g., qwen-max, wanx-v1)
     * @param parameters  Additional parameters (e.g., size, n, top_p)
     * @return The generation output containing content/url and usage info
     * @throws Exception If generation fails
     */
    GenerationOutput generate(String prompt, String modelName, Map<String, Object> parameters) throws Exception;

    /**
     * Checks if this strategy supports the given model type.
     *
     * @param modelType The model type (text, image, video)
     * @return true if supported
     */
    boolean supports(String modelType);

    /**
     * Calculates the estimated cost of the generation.
     *
     * @param modelName    The specific model name
     * @param inputTokens  Number of input tokens (for text)
     * @param outputTokens Number of output tokens (for text)
     * @param parameters   Additional parameters (e.g., n images)
     * @return Estimated cost in CNY
     */
    double calculateCost(String modelName, int inputTokens, int outputTokens, Map<String, Object> parameters);
}
