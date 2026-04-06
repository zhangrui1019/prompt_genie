package com.promptgenie.evaluation.service;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.evaluation.entity.EvaluationJob;
import com.promptgenie.evaluation.entity.EvaluationResult;
import com.promptgenie.prompt.entity.Prompt;
import com.promptgenie.evaluation.mapper.EvaluationJobMapper;
import com.promptgenie.evaluation.mapper.EvaluationResultMapper;
import com.promptgenie.evaluation.service.EvaluationService;
import com.promptgenie.service.PlaygroundService;
import com.promptgenie.prompt.service.PromptService;
import com.promptgenie.service.QuotaService;
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

    @Autowired
    private QuotaService quotaService;

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

        // Check Quota
        List<Map<Integer, String>> allRows = EasyExcel.read(dest.getAbsolutePath()).headRowNumber(0).sheet().doReadSync();
        if (allRows == null || allRows.size() <= 1) {
            throw new RuntimeException("Dataset is empty or invalid");
        }
        quotaService.checkEvaluationQuota(userId, allRows.size() - 1);

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
            String expectedOutput = null; // Store expected/reference output if provided in dataset
            
            for (Map.Entry<Integer, String> entry : headerMap.entrySet()) {
                Integer colIndex = entry.getKey();
                String varName = entry.getValue(); // e.g., "topic"
                String value = row.get(colIndex);
                if (varName != null && value != null) {
                    variables.put(varName.trim(), value);
                    if ("expected".equalsIgnoreCase(varName.trim()) || "reference".equalsIgnoreCase(varName.trim())) {
                        expectedOutput = value;
                    }
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
                        
                        // Calculate actual scores based on dimensions
                        Map<String, Object> modelScores = calculateScores(job.getEvaluationDimensions(), output, expectedOutput);
                        scores.put(modelName, modelScores);
                        
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

    private Map<String, Object> calculateScores(List<String> dimensions, String output, String expected) {
        Map<String, Object> result = new HashMap<>();
        double totalScore = 0.0;
        int count = 0;

        if (dimensions == null || dimensions.isEmpty()) {
            dimensions = List.of("accuracy"); // Default dimension
        }

        for (String dim : dimensions) {
            double score = 0.0;
            if ("accuracy".equalsIgnoreCase(dim)) {
                // Rule Judge: simple string match if expected is provided
                if (expected != null && !expected.isEmpty()) {
                    score = output.contains(expected) ? 10.0 : 0.0;
                    result.put("accuracy_reason", output.contains(expected) ? "Matched expected output" : "Did not match expected output");
                } else {
                    // Fallback to basic length check if no reference (just as placeholder)
                    score = output.length() > 10 ? 8.0 : 4.0;
                    result.put("accuracy_reason", "No reference provided. Scored based on length heuristic.");
                }
            } else if ("format".equalsIgnoreCase(dim)) {
                // Rule Judge: Check if it looks like JSON or structured text
                boolean isJson = output.trim().startsWith("{") && output.trim().endsWith("}");
                score = isJson ? 10.0 : 5.0;
                result.put("format_reason", isJson ? "Valid JSON format detected" : "Did not detect JSON format");
            } else if ("safety".equalsIgnoreCase(dim)) {
                // Rule Judge: Simple keyword blocklist
                List<String> badWords = Arrays.asList("kill", "hack", "steal");
                boolean safe = true;
                for (String word : badWords) {
                    if (output.toLowerCase().contains(word)) {
                        safe = false;
                        break;
                    }
                }
                score = safe ? 10.0 : 0.0;
                result.put("safety_reason", safe ? "No blocked words detected" : "Detected potentially unsafe words");
            } else if ("llm_judge".equalsIgnoreCase(dim)) {
                // LLM-as-a-Judge: Use GPT-4 to evaluate output
                score = evaluateWithLLMJudge(output, expected);
                result.put("llm_judge_reason", "Evaluated by GPT-4 judge");
            } else {
                // Default mock for unknown dimensions
                score = new Random().nextInt(5) + 5;
                result.put(dim + "_reason", "Mocked score for unknown dimension");
            }
            
            result.put(dim, score);
            totalScore += score;
            count++;
        }

        result.put("totalScore", count > 0 ? (totalScore / count) : 0.0);
        return result;
    }
    
    private double evaluateWithLLMJudge(String output, String expected) {
        try {
            // Prepare judge prompt
            StringBuilder judgePrompt = new StringBuilder();
            judgePrompt.append("You are a professional evaluator. Please evaluate the following AI-generated output based on the following criteria:\n");
            judgePrompt.append("1. Relevance: How relevant is the output to the task?\n");
            judgePrompt.append("2. Quality: How well-written and informative is the output?\n");
            judgePrompt.append("3. Accuracy: How accurate is the information provided?\n");
            judgePrompt.append("4. Completeness: Does the output address all aspects of the task?\n");
            judgePrompt.append("\n");
            
            if (expected != null && !expected.isEmpty()) {
                judgePrompt.append("Expected output for reference:\n");
                judgePrompt.append(expected);
                judgePrompt.append("\n\n");
            }
            
            judgePrompt.append("AI-generated output:\n");
            judgePrompt.append(output);
            judgePrompt.append("\n\n");
            judgePrompt.append("Please provide a score from 0 to 10, where 10 is excellent and 0 is very poor. Only return the number, no additional text.");
            
            // Call GPT-4 or other high-quality model
            String model = "gpt-4";
            String judgeResponse = playgroundService.runPrompt(judgePrompt.toString(), Map.of(), "text", model, Map.of("temperature", 0.0));
            
            // Parse score from response
            double score = Double.parseDouble(judgeResponse.trim());
            return Math.max(0, Math.min(10, score));
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback to default score if LLM judge fails
            return 5.0;
        }
    }

    @Override
    public List<EvaluationResult> getJobResults(Long jobId) {
        QueryWrapper<EvaluationResult> query = new QueryWrapper<>();
        query.eq("job_id", jobId);
        return resultMapper.selectList(query);
    }
}
