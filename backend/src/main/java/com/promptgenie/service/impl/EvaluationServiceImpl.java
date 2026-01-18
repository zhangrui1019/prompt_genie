package com.promptgenie.service.impl;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.EvaluationJob;
import com.promptgenie.entity.EvaluationResult;
import com.promptgenie.entity.Prompt;
import com.promptgenie.mapper.EvaluationJobMapper;
import com.promptgenie.mapper.EvaluationResultMapper;
import com.promptgenie.service.EvaluationService;
import com.promptgenie.service.PlaygroundService;
import com.promptgenie.service.PromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class EvaluationServiceImpl extends ServiceImpl<EvaluationJobMapper, EvaluationJob> implements EvaluationService {

    @Autowired
    private EvaluationResultMapper resultMapper;

    @Autowired
    private PlaygroundService playgroundService;

    @Autowired
    private PromptService promptService;

    private final String UPLOAD_DIR = "uploads/datasets/";

    @Override
    public EvaluationJob createEvaluationJob(Long userId, String name, Long promptId, MultipartFile datasetFile, List<Map<String, Object>> modelConfigs, List<String> evaluationDimensions) {
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = UUID.randomUUID() + "_" + datasetFile.getOriginalFilename();
        String filePath = UPLOAD_DIR + fileName;
        File dest = new File(filePath);
        try {
            datasetFile.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store dataset file", e);
        }

        EvaluationJob job = new EvaluationJob();
        job.setUserId(userId);
        job.setName(name);
        job.setPromptId(promptId);
        job.setDatasetPath(dest.getAbsolutePath());
        job.setStatus("PENDING");
        job.setModelConfigs(modelConfigs);
        job.setEvaluationDimensions(evaluationDimensions);
        
        save(job);
        
        // Trigger async execution
        runEvaluation(job.getId());
        
        return job;
    }

    @Override
    public List<EvaluationJob> getUserJobs(Long userId) {
        QueryWrapper<EvaluationJob> query = new QueryWrapper<>();
        query.eq("user_id", userId).orderByDesc("created_at");
        return list(query);
    }

    @Override
    public EvaluationJob getJobDetails(Long jobId) {
        return getById(jobId);
    }

    @Override
    @Async
    public void runEvaluation(Long jobId) {
        EvaluationJob job = getById(jobId);
        if (job == null) return;

        job.setStatus("RUNNING");
        updateById(job);

        try {
            Prompt prompt = promptService.getById(job.getPromptId());
            if (prompt == null) throw new RuntimeException("Prompt not found");

            // Read Excel: assume first row is header
            List<Map<Integer, String>> allRows = EasyExcel.read(job.getDatasetPath()).headRowNumber(0).sheet().doReadSync();
            
            if (allRows == null || allRows.isEmpty()) {
                job.setStatus("COMPLETED");
                updateById(job);
                return;
            }
            
            Map<Integer, String> headerMap = allRows.get(0);
            List<Map<Integer, String>> dataRows = allRows.subList(1, allRows.size());
            
            // Process each row in parallel
            List<CompletableFuture<Void>> futures = new ArrayList<>();

            for (Map<Integer, String> row : dataRows) {
                futures.add(CompletableFuture.runAsync(() -> {
                    processRow(job, prompt, headerMap, row);
                }));
            }
            
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            
            job.setStatus("COMPLETED");
            updateById(job);

        } catch (Exception e) {
            e.printStackTrace();
            job.setStatus("FAILED");
            updateById(job);
        }
    }
    
    private void processRow(EvaluationJob job, Prompt prompt, Map<Integer, String> headerMap, Map<Integer, String> row) {
        try {
            // Construct input variables map
            Map<String, Object> variables = new HashMap<>();
            for (Map.Entry<Integer, String> entry : headerMap.entrySet()) {
                Integer colIndex = entry.getKey();
                String varName = entry.getValue(); // e.g., "topic"
                String value = row.get(colIndex);
                if (varName != null && value != null) {
                    variables.put(varName.trim(), value);
                }
            }

            EvaluationResult result = new EvaluationResult();
            result.setJobId(job.getId());
            result.setInputData(variables);
            
            Map<String, Object> modelOutputs = new HashMap<>();
            Map<String, Object> scores = new HashMap<>();
            
            long startTime = System.currentTimeMillis();

            // Run for each model config
            if (job.getModelConfigs() != null) {
                for (Map<String, Object> config : job.getModelConfigs()) {
                    String modelName = (String) config.get("model"); // e.g., "qwen-turbo"
                    if (modelName == null) continue;
                    
                    try {
                        // PlaygroundService signature: runPrompt(content, variables, modelType, modelName, params)
                        String output = playgroundService.runPrompt(prompt.getContent(), variables, "text", modelName, null);
                        modelOutputs.put(modelName, output);
                        
                        // Mock Score for now
                        scores.put(modelName, new Random().nextInt(10) + 1); 
                        
                    } catch (Exception e) {
                        modelOutputs.put(modelName, "Error: " + e.getMessage());
                    }
                }
            }
            
            result.setModelOutputs(modelOutputs);
            result.setScores(scores);
            result.setLatency(System.currentTimeMillis() - startTime);
            
            resultMapper.insert(result);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<EvaluationResult> getJobResults(Long jobId) {
        QueryWrapper<EvaluationResult> query = new QueryWrapper<>();
        query.eq("job_id", jobId);
        return resultMapper.selectList(query);
    }
}
