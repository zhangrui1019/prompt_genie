package com.promptgenie.prompt.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promptgenie.prompt.entity.ChainStep;
import com.promptgenie.prompt.entity.Prompt;
import com.promptgenie.prompt.entity.PromptChain;
import com.promptgenie.prompt.mapper.ChainStepMapper;
import com.promptgenie.prompt.mapper.PromptChainMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class ChainService extends ServiceImpl<PromptChainMapper, PromptChain> {

    @Autowired
    private ChainStepMapper stepMapper;

    @Autowired
    private com.promptgenie.prompt.service.PromptService promptService;

    @Autowired
    private com.promptgenie.service.PlaygroundService playgroundService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ExecutorService executor = Executors.newCachedThreadPool();

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
        if (chain.getCreatedAt() == null) {
            chain.setCreatedAt(LocalDateTime.now());
        }
        chain.setUpdatedAt(LocalDateTime.now());
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
        chain.setUpdatedAt(LocalDateTime.now());
        updateById(chain);
        
        // Delete existing steps and re-insert (simple approach for linear steps)
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
    
    @Transactional
    public void moveChainToWorkspace(Long chainId, Long targetWorkspaceId) {
        PromptChain chain = getById(chainId);
        if (chain != null) {
            chain.setWorkspaceId(targetWorkspaceId);
            updateById(chain);
        }
    }

    public List<Map<String, Object>> executeChain(Long chainId, Map<String, Object> initialVariables) {
        PromptChain chain = getChainWithSteps(chainId);
        if (chain == null) throw new RuntimeException("Chain not found");

        // If this chain has React Flow graph data, use graph execution
        if (chain.getReactFlowNodes() != null && !chain.getReactFlowNodes().equals("[]")) {
             Object graphResult = executeChainGraph(chain, initialVariables);
             // Wrap single result or list result into standardized list format
             if (graphResult instanceof List) {
                 return (List<Map<String, Object>>) graphResult;
             } else if (graphResult instanceof Map) {
                 return Collections.singletonList((Map<String, Object>) graphResult);
             }
             return Collections.emptyList();
        }

        // Fallback to Linear Execution
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
                .map(step -> CompletableFuture.supplyAsync(() -> executeLinearStep(step, currentVariables)))
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

    private Map<String, Object> executeLinearStep(ChainStep step, Map<String, Object> currentVariables) {
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
        
        // Prepare variables for this step
        Map<String, Object> stepVariables = new HashMap<>(currentVariables);

        // Apply Input Mappings
        if (step.getInputMappings() != null && !step.getInputMappings().isEmpty()) {
            try {
                Map<String, String> mappings = objectMapper.readValue(step.getInputMappings(), Map.class);
                for (Map.Entry<String, String> mapping : mappings.entrySet()) {
                    String targetKey = mapping.getKey();
                    String sourceValue = mapping.getValue();
                    
                    if (sourceValue != null && sourceValue.startsWith("{{") && sourceValue.endsWith("}}")) {
                        String sourceVarName = sourceValue.substring(2, sourceValue.length() - 2).trim();
                        Object val = currentVariables.get(sourceVarName);
                        if (val != null) {
                            stepVariables.put(targetKey, val);
                        }
                    } else {
                        stepVariables.put(targetKey, sourceValue);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        String output = playgroundService.runPrompt(prompt.getContent(), stepVariables, modelType, modelName, params);
        
        Map<String, Object> stepResult = new HashMap<>();
        stepResult.put("step", step.getStepOrder());
        stepResult.put("promptTitle", prompt.getTitle());
        stepResult.put("output", output);
        stepResult.put("_targetVariable", step.getTargetVariable());
        return stepResult;
    }

    public Object executeChainGraph(PromptChain chain, Map<String, Object> initialVariables) {
        if (chain.getReactFlowNodes() == null || chain.getReactFlowEdges() == null) {
            throw new RuntimeException("No graph data found in chain");
        }

        try {
            List<Map<String, Object>> nodes = objectMapper.readValue(chain.getReactFlowNodes(), new TypeReference<List<Map<String, Object>>>(){});
            List<Map<String, Object>> edges = objectMapper.readValue(chain.getReactFlowEdges(), new TypeReference<List<Map<String, Object>>>(){});
            
            // Build Graph
            Map<String, Map<String, Object>> nodeMap = new HashMap<>();
            for (Map<String, Object> node : nodes) {
                nodeMap.put((String) node.get("id"), node);
            }
            
            Map<String, CompletableFuture<Object>> nodeFutures = new ConcurrentHashMap<>();
            
            // Initialize all futures
            for (Map<String, Object> node : nodes) {
                nodeFutures.put((String) node.get("id"), new CompletableFuture<>());
            }
            
            // Trigger execution
            for (Map<String, Object> node : nodes) {
                triggerNodeExecution(node, nodes, edges, nodeFutures, nodeMap, initialVariables);
            }
            
            // Find output nodes and wait for them
            List<Map<String, Object>> finalResults = new ArrayList<>();
            List<CompletableFuture<Void>> outputFutures = new ArrayList<>();
            
            for (Map<String, Object> node : nodes) {
                if ("outputNode".equals(node.get("type"))) {
                    CompletableFuture<Void> f = nodeFutures.get(node.get("id")).thenAccept(result -> {
                        Map<String, Object> res = new HashMap<>();
                        res.put("nodeId", node.get("id"));
                        res.put("label", ((Map)node.get("data")).get("label"));
                        res.put("output", result);
                        synchronized (finalResults) {
                            finalResults.add(res);
                        }
                    });
                    outputFutures.add(f);
                }
            }
            
            CompletableFuture.allOf(outputFutures.toArray(new CompletableFuture[0])).join();
            return finalResults;

        } catch (Exception e) {
            throw new RuntimeException("DAG Execution Failed", e);
        }
    }

    private void triggerNodeExecution(Map<String, Object> node, List<Map<String, Object>> nodes, List<Map<String, Object>> edges, 
                                      Map<String, CompletableFuture<Object>> nodeFutures, Map<String, Map<String, Object>> nodeMap,
                                      Map<String, Object> globalContext) {
        String nodeId = (String) node.get("id");
        
        // Find dependencies
        List<String> dependencyIds = edges.stream()
                .filter(e -> e.get("target").equals(nodeId))
                .map(e -> (String) e.get("source"))
                .collect(Collectors.toList());
        
        CompletableFuture[] depFutures = dependencyIds.stream()
                .map(nodeFutures::get)
                .toArray(CompletableFuture[]::new);
                
        CompletableFuture.allOf(depFutures).thenRunAsync(() -> {
            try {
                // Gather inputs
                Map<String, Object> inputs = new HashMap<>(globalContext);
                for (String depId : dependencyIds) {
                    Object result = nodeFutures.get(depId).join();
                    if (result instanceof Map) {
                        inputs.putAll((Map) result);
                    } else if (result instanceof String) {
                         // Default key for previous node output
                        inputs.put("prev_output", result); 
                        inputs.put(nodeMap.get(depId).get("type") + "_" + depId, result);
                    }
                }
                
                // Execute logic
                Object output = executeNodeLogic(node, inputs);
                nodeFutures.get(nodeId).complete(output);
            } catch (Exception e) {
                nodeFutures.get(nodeId).completeExceptionally(e);
            }
        }, executor);
    }

    private Object executeNodeLogic(Map<String, Object> node, Map<String, Object> inputs) {
        String type = (String) node.get("type");
        Map<String, Object> data = (Map<String, Object>) node.get("data");
        
        // Check if this is a risk node that requires human review
        if (data != null && Boolean.TRUE.equals(data.get("isRiskNode"))) {
            Map<String, Object> result = new HashMap<>();
            result.put("requires_human_review", true);
            result.put("node_id", node.get("id"));
            result.put("node_type", type);
            result.put("node_label", data.get("label"));
            return result;
        }
        
        Object result;
        
        if ("promptNode".equals(type)) {
            String template = (String) data.get("content");
            if (template == null) template = "";
            for (String key : inputs.keySet()) {
                if (inputs.get(key) != null) {
                    template = template.replace("{{" + key + "}}", inputs.get(key).toString());
                }
            }
            result = Map.of("prompt_text", template);
        } 
        else if ("llmNode".equals(type)) {
            String promptText = (String) inputs.get("prompt_text");
            if (promptText == null) promptText = (String) inputs.get("prev_output");
            if (promptText == null) promptText = "No prompt input";
            
            String model = (String) data.getOrDefault("modelName", "qwen-turbo");
            Double temp = 0.7;
            if (data.get("temperature") != null) {
                temp = Double.valueOf(data.get("temperature").toString());
            }
            
            // Call LLM
            result = playgroundService.runPrompt(promptText, Map.of(), "text", model, Map.of("temperature", temp));
        }
        else if ("outputNode".equals(type)) {
            // Just return what it received
            if (inputs.containsKey("prev_output")) result = inputs.get("prev_output");
            else if (inputs.containsKey("prompt_text")) result = inputs.get("prompt_text"); // Direct prompt to output
            else result = inputs;
        }
        else if ("conditionNode".equals(type)) {
            String condition = (String) data.get("condition");
            if (condition == null || condition.isEmpty()) {
                result = Map.of("condition_result", true);
            } else {
                // Simple condition evaluation
                boolean conditionResult = evaluateCondition(condition, inputs);
                result = Map.of("condition_result", conditionResult);
            }
        }
        else if ("loopNode".equals(type)) {
            String condition = (String) data.get("condition");
            Integer maxIterations = data.get("maxIterations") != null ? Integer.parseInt(data.get("maxIterations").toString()) : 10;
            
            Integer iteration = inputs.containsKey("iteration") ? (Integer) inputs.get("iteration") : 0;
            iteration++;
            
            boolean shouldContinue = iteration < maxIterations;
            if (condition != null && !condition.isEmpty()) {
                shouldContinue = shouldContinue && evaluateCondition(condition, inputs);
            }
            
            Map<String, Object> loopResult = new HashMap<>();
            loopResult.put("iteration", iteration);
            loopResult.put("should_continue", shouldContinue);
            result = loopResult;
        }
        else if ("errorRetryNode".equals(type)) {
            // Error retry logic will be handled in the triggerNodeExecution method
            result = Map.of("retry_count", 0);
        }
        else if ("agentNode".equals(type)) {
            String agentType = (String) data.getOrDefault("agentType", "General");
            String expertise = (String) data.getOrDefault("expertise", "");
            String instructions = (String) data.getOrDefault("instructions", "");
            
            // Prepare agent prompt
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("You are a " + agentType + " Agent");
            if (!expertise.isEmpty()) {
                promptBuilder.append(" with expertise in " + expertise);
            }
            promptBuilder.append(".\n");
            
            if (!instructions.isEmpty()) {
                promptBuilder.append("Instructions: " + instructions + "\n");
            }
            
            promptBuilder.append("Input: " + inputs.getOrDefault("prev_output", "No input provided"));
            
            // Call LLM with agent prompt
            String model = "qwen-turbo"; // Use appropriate model for agent
            result = playgroundService.runPrompt(promptBuilder.toString(), Map.of(), "text", model, Map.of("temperature", 0.7));
        }
        else if ("toolNode".equals(type)) {
            String toolType = (String) data.getOrDefault("toolType", "Google Search");
            String toolConfig = (String) data.getOrDefault("toolConfig", "");
            String input = (String) inputs.getOrDefault("prev_output", "");
            
            // Execute tool based on type
            result = executeTool(toolType, toolConfig, input);
        }
        else {
            result = null;
        }
        
        // Apply guardrails if enabled
        if (data != null && Boolean.TRUE.equals(data.get("hasGuardrails"))) {
            result = applyGuardrails(result, data);
        }
        
        return result;
    }
    
    private Object applyGuardrails(Object result, Map<String, Object> data) {
        // Check blocked words
        String blockedWordsStr = (String) data.getOrDefault("blockedWords", "");
        if (!blockedWordsStr.isEmpty()) {
            String[] blockedWords = blockedWordsStr.split(",");
            String resultStr = result.toString();
            for (String word : blockedWords) {
                if (resultStr.toLowerCase().contains(word.trim().toLowerCase())) {
                    return Map.of("error", "Output contains blocked word: " + word.trim());
                }
            }
        }
        
        // Check output length
        Integer maxOutputLength = data.get("maxOutputLength") != null ? Integer.parseInt(data.get("maxOutputLength").toString()) : 1000;
        if (result.toString().length() > maxOutputLength) {
            return Map.of("error", "Output exceeds maximum length of " + maxOutputLength + " characters");
        }
        
        // Check JSON Schema validation (simplified)
        String jsonSchema = (String) data.getOrDefault("jsonSchema", "");
        if (!jsonSchema.isEmpty() && result instanceof String) {
            try {
                // In a real system, use a proper JSON Schema validator
                String resultStr = (String) result;
                if (resultStr.startsWith("{") && resultStr.endsWith("}")) {
                    // Basic JSON check
                    new ObjectMapper().readTree(resultStr);
                } else {
                    return Map.of("error", "Output is not valid JSON");
                }
            } catch (Exception e) {
                return Map.of("error", "JSON validation failed: " + e.getMessage());
            }
        }
        
        return result;
    }
    
    private Object executeTool(String toolType, String toolConfig, String input) {
        try {
            if ("Google Search".equals(toolType)) {
                // Simulate Google Search
                return Map.of(
                    "tool_type", "Google Search",
                    "query", input,
                    "results", List.of(
                        Map.of("title", "Search Result 1", "snippet", "This is a search result for: " + input),
                        Map.of("title", "Search Result 2", "snippet", "Another search result for: " + input)
                    )
                );
            } else if ("Database Query".equals(toolType)) {
                // Simulate Database Query
                return Map.of(
                    "tool_type", "Database Query",
                    "query", input,
                    "results", List.of(
                        Map.of("id", 1, "name", "Item 1"),
                        Map.of("id", 2, "name", "Item 2")
                    )
                );
            } else if ("Custom API".equals(toolType)) {
                // Simulate Custom API call
                return Map.of(
                    "tool_type", "Custom API",
                    "input", input,
                    "response", "API response for: " + input
                );
            } else if ("File System".equals(toolType)) {
                // Simulate File System operation
                return Map.of(
                    "tool_type", "File System",
                    "operation", "read",
                    "path", input,
                    "content", "File content for: " + input
                );
            } else if ("Weather API".equals(toolType)) {
                // Simulate Weather API
                return Map.of(
                    "tool_type", "Weather API",
                    "location", input,
                    "temperature", "25°C",
                    "condition", "Sunny"
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Tool execution failed: " + e.getMessage());
        }
        return Map.of("error", "Unknown tool type: " + toolType);
    }
    
    private boolean evaluateCondition(String condition, Map<String, Object> inputs) {
        // Simple condition evaluation for demo purposes
        // In a real system, use a proper expression evaluator
        try {
            // Replace variables in condition
            String evaluatedCondition = condition;
            for (String key : inputs.keySet()) {
                if (inputs.get(key) != null) {
                    evaluatedCondition = evaluatedCondition.replace("{{" + key + "}}", inputs.get(key).toString());
                }
            }
            
            // Simple boolean evaluation
            if (evaluatedCondition.contains(">")) {
                String[] parts = evaluatedCondition.split(">");
                if (parts.length == 2) {
                    return Double.parseDouble(parts[0].trim()) > Double.parseDouble(parts[1].trim());
                }
            } else if (evaluatedCondition.contains("<")) {
                String[] parts = evaluatedCondition.split("<");
                if (parts.length == 2) {
                    return Double.parseDouble(parts[0].trim()) < Double.parseDouble(parts[1].trim());
                }
            } else if (evaluatedCondition.contains("==")) {
                String[] parts = evaluatedCondition.split("==");
                if (parts.length == 2) {
                    return parts[0].trim().equals(parts[1].trim());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}
