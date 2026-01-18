package com.promptgenie.controller;

import com.promptgenie.entity.Prompt;
import com.promptgenie.service.PromptService;
import com.promptgenie.service.UserContextService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class PromptControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PromptService promptService;

    @MockBean
    private UserContextService userContextService;

    private Prompt testPrompt;

    @BeforeEach
    void setUp() {
        testPrompt = new Prompt();
        testPrompt.setId(1L);
        testPrompt.setTitle("Test Prompt");
        testPrompt.setContent("Content");
        testPrompt.setUserId(1L);
        
        // Mock UserContextService to return a valid user ID
        when(userContextService.getCurrentUserId()).thenReturn(1L);
    }

    @Test
    void getPrompts_ShouldReturnList() throws Exception {
        when(promptService.getPromptsByUser(1L)).thenReturn(Arrays.asList(testPrompt));

        mockMvc.perform(get("/api/prompts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Prompt"));
    }

    @Test
    void createPrompt_ShouldReturnCreated() throws Exception {
        String promptJson = "{\"title\":\"New Prompt\",\"content\":\"New Content\"}";
        
        when(promptService.createPrompt(any(Prompt.class))).thenReturn(true);

        mockMvc.perform(post("/api/prompts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(promptJson))
                .andExpect(status().isOk());
    }
}
