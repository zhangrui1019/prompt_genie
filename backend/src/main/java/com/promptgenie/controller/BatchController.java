package com.promptgenie.controller;

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

    @PostMapping("/run")
    public SseEmitter runBatch(@RequestBody Map<String, Object> request) {
        Long promptId = Long.valueOf(request.get("promptId").toString());
        List<Map<String, Object>> rows = (List<Map<String, Object>>) request.get("rows");
        
        // Timeout 1 hour for batch
        SseEmitter emitter = new SseEmitter(3600000L);
        
        batchService.processBatch(promptId, rows, emitter);
        
        return emitter;
    }
}
