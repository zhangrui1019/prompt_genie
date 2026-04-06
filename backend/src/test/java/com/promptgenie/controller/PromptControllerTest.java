package com.promptgenie.controller;

import com.promptgenie.prompt.entity.Prompt;
import com.promptgenie.prompt.service.PromptService;
import com.promptgenie.prompt.controller.PromptController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PromptControllerTest {
    
    @Mock
    private PromptService promptService;
    
    @InjectMocks
    private PromptController promptController;
    
    private Prompt prompt;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        prompt = new Prompt();
        prompt.setId(1L);
        prompt.setTitle("Test Prompt");
        prompt.setContent("Test content");
        prompt.setUserId(1L);
    }
    
    @Test
    void testCreatePrompt() {
        when(promptService.createPrompt(any(Prompt.class))).thenReturn(prompt);
        
        Prompt response = promptController.createPrompt(prompt);
        
        assertNotNull(response);
        assertEquals("Test Prompt", response.getTitle());
        verify(promptService, times(1)).createPrompt(prompt);
    }
    
    @Test
    void testGetPromptById() {
        when(promptService.getById(1L)).thenReturn(prompt);
        
        Prompt response = promptController.getPrompt(1L);
        
        assertNotNull(response);
        assertEquals("Test Prompt", response.getTitle());
        verify(promptService, times(1)).getById(1L);
    }
    
    @Test
    void testUpdatePrompt() {
        when(promptService.getById(1L)).thenReturn(prompt);
        when(promptService.updatePrompt(any(Prompt.class))).thenReturn(prompt);
        
        prompt.setTitle("Updated Prompt");
        Prompt response = promptController.updatePrompt(1L, prompt);
        
        assertNotNull(response);
        assertEquals("Updated Prompt", response.getTitle());
        verify(promptService, times(1)).updatePrompt(prompt);
    }
    
    @Test
    void testDeletePrompt() {
        when(promptService.getById(1L)).thenReturn(prompt);
        doNothing().when(promptService).removeById(1L);
        
        promptController.deletePrompt(1L);
        
        verify(promptService, times(1)).removeById(1L);
    }
}
