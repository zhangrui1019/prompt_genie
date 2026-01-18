package com.promptgenie.service;

import com.promptgenie.entity.Prompt;
import com.promptgenie.mapper.PromptLikeMapper;
import com.promptgenie.mapper.PromptMapper;
import com.promptgenie.mapper.TagMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PromptServiceTest {

    @Mock
    private PromptMapper promptMapper;

    @Mock
    private TagMapper tagMapper;

    @Mock
    private PromptLikeMapper promptLikeMapper;

    @InjectMocks
    private PromptService promptService;

    private Prompt testPrompt;

    @BeforeEach
    void setUp() {
        testPrompt = new Prompt();
        testPrompt.setId(1L);
        testPrompt.setUserId(100L);
        testPrompt.setTitle("Test Prompt");
        testPrompt.setContent("This is a test prompt content.");
        
        // Fix: Inject baseMapper for Mybatis-Plus ServiceImpl
        ReflectionTestUtils.setField(promptService, "baseMapper", promptMapper);
    }

    @Test
    void createPrompt_ShouldReturnTrue_WhenSuccessful() {
        when(promptMapper.insert(any(Prompt.class))).thenReturn(1);

        boolean result = promptService.createPrompt(testPrompt);

        assertTrue(result);
        verify(promptMapper, times(1)).insert(testPrompt);
    }

    @Test
    void getPromptsByUser_ShouldReturnList() {
        // Fix: Mock the actual custom method called by service
        when(promptMapper.selectByUserIdOrderByCreatedAtDesc(100L)).thenReturn(Arrays.asList(testPrompt));
        
        List<Prompt> results = promptService.getPromptsByUser(100L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Test Prompt", results.get(0).getTitle());
    }

    @Test
    void getPromptById_ShouldReturnPrompt() {
        when(promptMapper.selectById(1L)).thenReturn(testPrompt);

        Prompt result = promptService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }
}
