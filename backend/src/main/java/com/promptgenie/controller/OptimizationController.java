package com.promptgenie.controller;

import com.promptgenie.service.OptimizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/optimize")
@CrossOrigin(origins = "*")
public class OptimizationController {

    @Autowired
    private OptimizationService optimizationService;

    @PostMapping
    public Map<String, Object> optimize(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        String type = request.get("type"); // e.g., clarity, creativity
        
        return optimizationService.optimize(prompt, type);
    }
}
