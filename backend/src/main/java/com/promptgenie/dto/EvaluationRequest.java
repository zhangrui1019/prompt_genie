package com.promptgenie.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class EvaluationRequest {
    private String name;
    private Long promptId;
    // We handle file separately in Multipart request
    private List<Map<String, Object>> modelConfigs; // e.g., [{"model": "qwen-turbo"}, {"model": "qwen-max"}]
    private List<String> evaluationDimensions; // e.g., ["accuracy", "creativity"]
}
