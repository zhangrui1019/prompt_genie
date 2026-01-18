package com.promptgenie.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.promptgenie.entity.PlaygroundHistory;
import com.promptgenie.mapper.PlaygroundHistoryMapper;
import com.promptgenie.service.strategy.GenerationOutput;
import com.promptgenie.service.strategy.GenerationStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PlaygroundServiceTest {

    @Mock
    private PlaygroundHistoryMapper historyMapper;
    
    @Mock
    private KnowledgeService knowledgeService;

    @Mock
    private GenerationStrategy textStrategy;

    @Mock
    private GenerationStrategy imageStrategy;
    
    @Mock
    private ObjectMapper objectMapper;

    @Spy
    private List<GenerationStrategy> strategies = new ArrayList<>();

    @InjectMocks
    private PlaygroundService playgroundService;

    @BeforeEach
    void setUp() {
        strategies.add(textStrategy);
        strategies.add(imageStrategy);
        
        // Setup strategy supports
        lenient().when(textStrategy.supports("text")).thenReturn(true);
        lenient().when(imageStrategy.supports("image")).thenReturn(true);
    }

    @Test
    void runPrompt_ShouldUseTextStrategy_WhenModelTypeIsText() throws Exception {
        // Arrange
        String prompt = "Hello AI";
        Map<String, Object> vars = new HashMap<>();
        
        GenerationOutput mockOutput = GenerationOutput.builder()
                .content("AI Response")
                .inputTokens(10)
                .outputTokens(5)
                .build();
        
        when(textStrategy.generate(anyString(), anyString(), any())).thenReturn(mockOutput);
        when(textStrategy.calculateCost(anyString(), anyInt(), anyInt(), any())).thenReturn(0.001);

        // Act
        String result = playgroundService.runPrompt(prompt, vars, "text", "qwen-turbo", null, 1L);

        // Assert
        assertEquals("AI Response", result);
        verify(textStrategy, times(1)).generate(anyString(), eq("qwen-turbo"), any());
        verify(imageStrategy, never()).generate(anyString(), anyString(), any());
        verify(historyMapper, times(1)).insert(any(PlaygroundHistory.class));
    }

    @Test
    void runPrompt_ShouldSubstituteVariables() throws Exception {
        // Arrange
        String template = "Hello {{name}}";
        Map<String, Object> vars = new HashMap<>();
        vars.put("name", "World");
        
        GenerationOutput mockOutput = GenerationOutput.builder().content("Hi").build();
        when(textStrategy.generate(eq("Hello World"), anyString(), any())).thenReturn(mockOutput);

        // Act
        playgroundService.runPrompt(template, vars, "text", "qwen-turbo", null, null);

        // Assert
        verify(textStrategy).generate(eq("Hello World"), anyString(), any());
    }
}
