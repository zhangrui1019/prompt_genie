package com.promptgenie.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promptgenie.entity.EvaluationJob;
import com.promptgenie.entity.EvaluationResult;
import com.promptgenie.service.EvaluationService;
import com.promptgenie.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @Autowired
    private UserContextService userContextService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/create")
    public ResponseEntity<EvaluationJob> createEvaluation(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("promptId") Long promptId,
            @RequestParam("modelConfigs") String modelConfigsJson,
            @RequestParam("evaluationDimensions") String evaluationDimensionsJson
    ) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }

        try {
            List<Map<String, Object>> modelConfigs = objectMapper.readValue(modelConfigsJson, new TypeReference<List<Map<String, Object>>>(){});
            List<String> evaluationDimensions = objectMapper.readValue(evaluationDimensionsJson, new TypeReference<List<String>>(){});
            
            EvaluationJob job = evaluationService.createEvaluationJob(userId, name, promptId, file, modelConfigs, evaluationDimensions);
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<EvaluationJob>> getMyEvaluations() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        return ResponseEntity.ok(evaluationService.getUserJobs(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluationJob> getEvaluation(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.getJobDetails(id));
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<List<EvaluationResult>> getEvaluationResults(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.getJobResults(id));
    }
}
