package com.promptgenie.controller;

import com.promptgenie.service.QuotaService;
import com.promptgenie.service.UserContextService;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.promptgenie.entity.Prompt;
import com.promptgenie.service.PromptService;
import com.promptgenie.service.BatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/batch")
@CrossOrigin(origins = "*")
public class BatchController {

    @Autowired
    private BatchService batchService;

    @Autowired
    private UserContextService userContextService;

    @Autowired
    private PromptService promptService;

    @Autowired
    private QuotaService quotaService;

    @PostMapping("/run")
    public SseEmitter runBatch(@RequestBody Map<String, Object> request) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        Long promptId = Long.valueOf(request.get("promptId").toString());
        Prompt prompt = promptService.getById(promptId);
        
        if (prompt == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Prompt not found");
        }
        
        if (!prompt.getUserId().equals(userId)) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your prompt");
        }

        List<Map<String, Object>> rows = (List<Map<String, Object>>) request.get("rows");
        
        try {
            quotaService.checkBatchQuota(userId, rows.size());
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
        }
        
        // Timeout 1 hour for batch
        SseEmitter emitter = new SseEmitter(3600000L);
        
        batchService.processBatch(promptId, rows, emitter);
        
        return emitter;
    }
}
