package com.promptgenie.service.strategy;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GenerationOutput {
    private String content; // Text content or URL
    private Integer inputTokens;
    private Integer outputTokens;
}
