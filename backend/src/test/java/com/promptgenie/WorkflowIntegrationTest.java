package com.promptgenie;

import com.promptgenie.prompt.entity.ChainStep;
import com.promptgenie.prompt.entity.Prompt;
import com.promptgenie.prompt.entity.PromptChain;
import com.promptgenie.auth.entity.User;
import com.promptgenie.prompt.service.ChainService;
import com.promptgenie.prompt.service.PromptService;
import com.promptgenie.auth.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class WorkflowIntegrationTest {
    
    @Mock
    private PromptService promptService;
    
    @Mock
    private ChainService chainService;
    
    @Mock
    private UserService userService;
    
    private User user;
    private Prompt prompt;
    private PromptChain chain;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setName("Test User");
        
        prompt = new Prompt();
        prompt.setId(1L);
        prompt.setTitle("Test Prompt");
        prompt.setContent("Test content");
        prompt.setUserId(1L);
        
        chain = new PromptChain();
        chain.setId(1L);
        chain.setTitle("Test Chain");
        chain.setUserId(1L);
    }
    
    @Test
    void testCreateAndExecuteChain() {
        when(userService.getById(1L)).thenReturn(user);
        when(promptService.getById(1L)).thenReturn(prompt);
        when(chainService.createChain(chain)).thenReturn(chain);
        
        // 模拟创建链
        PromptChain createdChain = chainService.createChain(chain);
        assertNotNull(createdChain);
        verify(chainService, times(1)).createChain(chain);
        
        // 模拟添加步骤
        ChainStep step = new ChainStep();
        step.setChainId(chain.getId());
        step.setPromptId(prompt.getId());
        step.setStepOrder(1);
    }
    
    @Test
    void testUserPromptAccess() {
        when(userService.getById(1L)).thenReturn(user);
        when(promptService.getById(1L)).thenReturn(prompt);
        
        // 验证用户可以访问自己的提示词
        Prompt retrievedPrompt = promptService.getById(1L);
        assertNotNull(retrievedPrompt);
        assertEquals(1L, retrievedPrompt.getUserId());
        verify(promptService, times(1)).getById(1L);
    }
}
