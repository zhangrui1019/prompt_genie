package com.promptgenie.service;

import com.promptgenie.entity.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class BatchService {

    @Autowired
    private PlaygroundService playgroundService;
    
    @Autowired
    private PromptService promptService;

    @Async
    public void processBatch(Long promptId, List<Map<String, Object>> rows, SseEmitter emitter) {
        try {
            Prompt prompt = promptService.getById(promptId);
            if (prompt == null) {
                emitter.send(SseEmitter.event().name("error").data("Prompt not found"));
                emitter.complete();
                return;
            }

            String template = prompt.getContent();
            int total = rows.size();

            for (int i = 0; i < total; i++) {
                Map<String, Object> row = rows.get(i);
                try {
                    // Run the prompt
                    String result = playgroundService.runPrompt(template, row);
                    
                    // Send result back
                    // We send the original row data + the result + row index
                    row.put("_result", result);
                    row.put("_rowIndex", i);
                    
                    emitter.send(SseEmitter.event().name("result").data(row));
                    
                } catch (Exception e) {
                    emitter.send(SseEmitter.event().name("error").data("Error processing row " + i + ": " + e.getMessage()));
                }
            }

            emitter.send(SseEmitter.event().name("complete").data("Batch processing finished"));
            emitter.complete();

        } catch (Exception e) {
            try {
                emitter.send(SseEmitter.event().name("error").data("Fatal error: " + e.getMessage()));
                emitter.completeWithError(e);
            } catch (Exception ex) {
                // ignore
            }
        }
    }
}
