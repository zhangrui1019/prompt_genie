package com.promptgenie.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.Map;
import java.util.List;
import com.promptgenie.entity.Tag;

@Data
public class PromptRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    private Map<String, Object> variables;
    
    private List<Tag> tags;
    
    private Boolean isPublic;
}
