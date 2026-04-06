package com.promptgenie.service;

import com.promptgenie.prompt.entity.Prompt;
import com.promptgenie.prompt.mapper.PromptLikeMapper;
import com.promptgenie.prompt.mapper.PromptMapper;
import com.promptgenie.prompt.mapper.TagMapper;
import com.promptgenie.prompt.service.PromptService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PromptServiceTest {
    
    @Mock
    private PromptMapper promptMapper;
    
    @Mock
    private TagMapper tagMapper;
    
    @Mock
    private PromptLikeMapper promptLikeMapper;
    
    @InjectMocks
    private PromptService promptService;
    
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
        when(promptMapper.insert(any(Prompt.class))).thenReturn(1);
        
        Prompt createdPrompt = promptService.createPrompt(prompt);
        
        assertNotNull(createdPrompt);
        verify(promptMapper, times(1)).insert(createdPrompt);
    }
    
    @Test
    void testGetPromptById() {
        when(promptMapper.selectById(1L)).thenReturn(prompt);
        
        Prompt foundPrompt = promptService.getById(1L);
        
        assertNotNull(foundPrompt);
        assertEquals("Test Prompt", foundPrompt.getTitle());
        verify(promptMapper, times(1)).selectById(1L);
    }
    
    @Test
    void testUpdatePrompt() {
        when(promptMapper.selectById(1L)).thenReturn(prompt);
        when(promptMapper.updateById(any(Prompt.class))).thenReturn(1);
        
        prompt.setTitle("Updated Prompt");
        Prompt updatedPrompt = promptService.updatePrompt(prompt);
        
        assertNotNull(updatedPrompt);
        assertEquals("Updated Prompt", updatedPrompt.getTitle());
        verify(promptMapper, times(1)).updateById(prompt);
    }
    
    @Test
    void testDeletePrompt() {
        when(promptMapper.selectById(1L)).thenReturn(prompt);
        when(promptMapper.deleteById(1L)).thenReturn(1);
        
        boolean deleted = promptService.removeById(1L);
        
        assertTrue(deleted);
        verify(promptMapper, times(1)).deleteById(1L);
    }
    
    @Test
    void testDeletePromptNotFound() {
        when(promptMapper.selectById(1L)).thenReturn(null);
        
        boolean deleted = promptService.removeById(1L);
        
        assertFalse(deleted);
        verify(promptMapper, never()).deleteById(1L);
    }
}
