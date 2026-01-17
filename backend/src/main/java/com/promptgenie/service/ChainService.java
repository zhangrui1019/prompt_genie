package com.promptgenie.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.ChainStep;
import com.promptgenie.entity.Prompt;
import com.promptgenie.entity.PromptChain;
import com.promptgenie.mapper.ChainStepMapper;
import com.promptgenie.mapper.PromptChainMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class ChainService extends ServiceImpl<PromptChainMapper, PromptChain> {

    @Autowired
    private ChainStepMapper stepMapper;

    @Autowired
    private PromptService promptService;

    @Autowired
    private PlaygroundService playgroundService;

    @Autowired
    private ObjectMapper objectMapper;

    public PromptChain getChainWithSteps(Long chainId) {
        PromptChain chain = getById(chainId);
        if (chain != null) {
            List<ChainStep> steps = stepMapper.selectByChainId(chainId);
            steps.forEach(step -> step.setPrompt(promptService.getById(step.getPromptId())));
            chain.setSteps(steps);
        }
        return chain;
    }

    @Transactional
    public PromptChain createChain(PromptChain chain) {
        save(chain);
        if (chain.getSteps() != null) {
            for (int i = 0; i < chain.getSteps().size(); i++) {
                ChainStep step = chain.getSteps().get(i);
                step.setChainId(chain.getId());
                step.setStepOrder(i);
                stepMapper.insert(step);
            }
        }
        return chain;
    }
    
    @Transactional
    public PromptChain updateChain(PromptChain chain) {
        updateById(chain);
        // Delete existing steps and re-insert (simple approach)
        QueryWrapper<ChainStep> query = new QueryWrapper<>();
        query.eq("chain_id", chain.getId());
        stepMapper.delete(query);
        
        if (chain.getSteps() != null) {
            for (int i = 0; i < chain.getSteps().size(); i++) {
                ChainStep step = chain.getSteps().get(i);
                step.setChainId(chain.getId());
                step.setStepOrder(i);
                stepMapper.insert(step);
            }
        }
        return getChainWithSteps(chain.getId());
    }
    
    public List<PromptChain> getUserChains(Long userId) {
        QueryWrapper<PromptChain> query = new QueryWrapper<>();
        query.eq("user_id", userId);
        return list(query);
    }

    public List<Map<String, Object>> executeChain(Long chainId, Map<String, Object> initialVariables) {
        PromptChain chain = getChainWithSteps(chainId);
        if (chain == null) throw new RuntimeException("Chain not found");

        List<Map<String, Object>> results = new ArrayList<>();
        Map<String, Object> currentVariables = new HashMap<>(initialVariables);

        // Group steps by stepOrder
        Map<Integer, List<ChainStep>> stepsByOrder = new TreeMap<>();
        for (ChainStep step : chain.getSteps()) {
            stepsByOrder.computeIfAbsent(step.getStepOrder(), k -> new ArrayList<>()).add(step);
        }

        // Iterate through groups (Stages)
        for (Map.Entry<Integer, List<ChainStep>> entry : stepsByOrder.entrySet()) {
            List<ChainStep> parallelSteps = entry.getValue();
            
            // Execute parallel steps
            List<CompletableFuture<Map<String, Object>>> futures = parallelSteps.stream()
                .map(step -> CompletableFuture.supplyAsync(() -> {
                    Prompt prompt = step.getPrompt();
                    if (prompt == null) {
                        throw new RuntimeException("Prompt not found for step " + step.getStepOrder());
                    }
                    
                    // Use a COPY of currentVariables to ensure thread safety during read
                    Map<String, Object> params = null;
                    if (step.getParameters() != null && !step.getParameters().isEmpty()) {
                        try {
                            params = objectMapper.readValue(step.getParameters(), Map.class);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                    
                    String modelType = step.getModelType() != null ? step.getModelType() : "text";
                    String modelName = step.getModelName();
                    
                    String output = playgroundService.runPrompt(prompt.getContent(), new HashMap<>(currentVariables), modelType, modelName, params);
                    
                    Map<String, Object> stepResult = new HashMap<>();
                    stepResult.put("step", step.getStepOrder());
                    stepResult.put("promptTitle", prompt.getTitle());
                    stepResult.put("output", output);
                    stepResult.put("_targetVariable", step.getTargetVariable());
                    return stepResult;
                }))
                .collect(Collectors.toList());

            // Wait for all to complete
            List<Map<String, Object>> stageResults = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());
            
            // Update context and results
            for (Map<String, Object> res : stageResults) {
                results.add(res);
                String targetVar = (String) res.get("_targetVariable");
                if (targetVar != null && !targetVar.isEmpty()) {
                    currentVariables.put(targetVar, res.get("output"));
                }
                res.remove("_targetVariable");
            }
        }

        return results;
    }
}
