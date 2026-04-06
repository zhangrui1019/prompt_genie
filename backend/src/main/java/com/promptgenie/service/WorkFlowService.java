package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

@Service
public class WorkFlowService {
    
    private final Map<String, Workflow> workflows = new ConcurrentHashMap<>();
    private final Map<String, WorkflowInstance> workflowInstances = new ConcurrentHashMap<>();
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);
    
    // 初始化工作流服务
    public void init() {
        // 初始化默认工作流
        initDefaultWorkflows();
    }
    
    // 初始化默认工作流
    private void initDefaultWorkflows() {
        // 创建默认工作流
        Workflow defaultWorkflow = new Workflow(
            "default",
            "Default Workflow",
            "A default workflow for testing",
            System.currentTimeMillis()
        );
        
        // 添加步骤
        defaultWorkflow.addStep(new WorkflowStep(
            "step1",
            "Generate Prompt",
            "Generate a prompt based on user input",
            "prompt_generation",
            new HashMap<>()
        ));
        
        defaultWorkflow.addStep(new WorkflowStep(
            "step2",
            "Execute Model",
            "Execute the AI model with the generated prompt",
            "model_execution",
            new HashMap<>()
        ));
        
        defaultWorkflow.addStep(new WorkflowStep(
            "step3",
            "Process Result",
            "Process the model execution result",
            "result_processing",
            new HashMap<>()
        ));
        
        workflows.put(defaultWorkflow.getId(), defaultWorkflow);
    }
    
    // 创建工作流
    public Workflow createWorkflow(String name, String description) {
        String workflowId = UUID.randomUUID().toString();
        Workflow workflow = new Workflow(
            workflowId,
            name,
            description,
            System.currentTimeMillis()
        );
        workflows.put(workflowId, workflow);
        return workflow;
    }
    
    // 添加步骤到工作流
    public void addStepToWorkflow(String workflowId, WorkflowStep step) {
        Workflow workflow = workflows.get(workflowId);
        if (workflow != null) {
            workflow.addStep(step);
        }
    }
    
    // 执行工作流
    public WorkflowInstance executeWorkflow(String workflowId, Map<String, Object> input) {
        Workflow workflow = workflows.get(workflowId);
        if (workflow == null) {
            throw new IllegalArgumentException("Workflow not found: " + workflowId);
        }
        
        String instanceId = UUID.randomUUID().toString();
        WorkflowInstance instance = new WorkflowInstance(
            instanceId,
            workflowId,
            input,
            System.currentTimeMillis(),
            "pending"
        );
        workflowInstances.put(instanceId, instance);
        
        // 异步执行工作流
        executorService.submit(() -> {
            try {
                instance.setStatus("running");
                executeWorkflowInternal(instance);
                instance.setStatus("completed");
            } catch (Exception e) {
                instance.setError(e.getMessage());
                instance.setStatus("failed");
            } finally {
                instance.setCompletedAt(System.currentTimeMillis());
            }
        });
        
        return instance;
    }
    
    // 执行工作流内部逻辑
    private void executeWorkflowInternal(WorkflowInstance instance) throws Exception {
        Workflow workflow = workflows.get(instance.getWorkflowId());
        if (workflow == null) {
            throw new IllegalArgumentException("Workflow not found: " + instance.getWorkflowId());
        }
        
        Map<String, Object> context = new HashMap<>(instance.getInput());
        List<WorkflowStep> steps = workflow.getSteps();
        
        for (WorkflowStep step : steps) {
            WorkflowStepExecution stepExecution = new WorkflowStepExecution(
                UUID.randomUUID().toString(),
                instance.getId(),
                step.getId(),
                step.getType(),
                System.currentTimeMillis(),
                "running"
            );
            instance.addStepExecution(stepExecution);
            
            try {
                // 执行步骤
                Object result = executeStep(step, context);
                stepExecution.setResult(result);
                stepExecution.setStatus("completed");
                
                // 将步骤结果添加到上下文
                context.put(step.getId(), result);
            } catch (Exception e) {
                stepExecution.setError(e.getMessage());
                stepExecution.setStatus("failed");
                throw e; // 传播错误，终止工作流
            } finally {
                stepExecution.setCompletedAt(System.currentTimeMillis());
            }
        }
        
        // 设置工作流结果
        instance.setResult(context);
    }
    
    // 执行步骤
    private Object executeStep(WorkflowStep step, Map<String, Object> context) throws Exception {
        // 这里应该实现实际的步骤执行逻辑
        // 为了演示，我们简单模拟不同类型的步骤
        switch (step.getType()) {
            case "prompt_generation":
                return "Generated prompt: " + context.get("prompt_input");
            case "model_execution":
                return "Model execution result: " + context.get("prompt");
            case "result_processing":
                return "Processed result: " + context.get("model_result");
            default:
                throw new IllegalArgumentException("Unknown step type: " + step.getType());
        }
    }
    
    // 获取工作流
    public Workflow getWorkflow(String workflowId) {
        return workflows.get(workflowId);
    }
    
    // 获取所有工作流
    public List<Workflow> getAllWorkflows() {
        return new ArrayList<>(workflows.values());
    }
    
    // 获取工作流实例
    public WorkflowInstance getWorkflowInstance(String instanceId) {
        return workflowInstances.get(instanceId);
    }
    
    // 获取工作流的实例
    public List<WorkflowInstance> getWorkflowInstances(String workflowId) {
        return workflowInstances.values().stream()
            .filter(instance -> workflowId.equals(instance.getWorkflowId()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    // 暂停工作流实例
    public void pauseWorkflowInstance(String instanceId) {
        WorkflowInstance instance = workflowInstances.get(instanceId);
        if (instance != null && "running".equals(instance.getStatus())) {
            instance.setStatus("paused");
        }
    }
    
    // 恢复工作流实例
    public void resumeWorkflowInstance(String instanceId) {
        WorkflowInstance instance = workflowInstances.get(instanceId);
        if (instance != null && "paused".equals(instance.getStatus())) {
            instance.setStatus("running");
            
            // 继续执行工作流
            executorService.submit(() -> {
                try {
                    executeWorkflowInternal(instance);
                    instance.setStatus("completed");
                } catch (Exception e) {
                    instance.setError(e.getMessage());
                    instance.setStatus("failed");
                } finally {
                    instance.setCompletedAt(System.currentTimeMillis());
                }
            });
        }
    }
    
    // 取消工作流实例
    public void cancelWorkflowInstance(String instanceId) {
        WorkflowInstance instance = workflowInstances.get(instanceId);
        if (instance != null && ("running".equals(instance.getStatus()) || "paused".equals(instance.getStatus()))) {
            instance.setStatus("cancelled");
            instance.setCompletedAt(System.currentTimeMillis());
        }
    }
    
    // 工作流类
    public static class Workflow {
        private String id;
        private String name;
        private String description;
        private long createdAt;
        private List<WorkflowStep> steps;
        
        public Workflow(String id, String name, String description, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.createdAt = createdAt;
            this.steps = new ArrayList<>();
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public List<WorkflowStep> getSteps() { return steps; }
        public void setSteps(List<WorkflowStep> steps) { this.steps = steps; }
        public void addStep(WorkflowStep step) { this.steps.add(step); }
    }
    
    // 工作流步骤类
    public static class WorkflowStep {
        private String id;
        private String name;
        private String description;
        private String type; // prompt_generation, model_execution, result_processing, etc.
        private Map<String, Object> parameters;
        
        public WorkflowStep(String id, String name, String description, String type, Map<String, Object> parameters) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.type = type;
            this.parameters = parameters;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Map<String, Object> getParameters() { return parameters; }
        public void setParameters(Map<String, Object> parameters) { this.parameters = parameters; }
    }
    
    // 工作流实例类
    public static class WorkflowInstance {
        private String id;
        private String workflowId;
        private Map<String, Object> input;
        private Map<String, Object> result;
        private String error;
        private long createdAt;
        private long completedAt;
        private String status; // pending, running, completed, failed, paused, cancelled
        private List<WorkflowStepExecution> stepExecutions;
        
        public WorkflowInstance(String id, String workflowId, Map<String, Object> input, long createdAt, String status) {
            this.id = id;
            this.workflowId = workflowId;
            this.input = input;
            this.createdAt = createdAt;
            this.status = status;
            this.stepExecutions = new ArrayList<>();
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getWorkflowId() { return workflowId; }
        public void setWorkflowId(String workflowId) { this.workflowId = workflowId; }
        public Map<String, Object> getInput() { return input; }
        public void setInput(Map<String, Object> input) { this.input = input; }
        public Map<String, Object> getResult() { return result; }
        public void setResult(Map<String, Object> result) { this.result = result; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getCompletedAt() { return completedAt; }
        public void setCompletedAt(long completedAt) { this.completedAt = completedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public List<WorkflowStepExecution> getStepExecutions() { return stepExecutions; }
        public void setStepExecutions(List<WorkflowStepExecution> stepExecutions) { this.stepExecutions = stepExecutions; }
        public void addStepExecution(WorkflowStepExecution stepExecution) { this.stepExecutions.add(stepExecution); }
    }
    
    // 工作流步骤执行类
    public static class WorkflowStepExecution {
        private String id;
        private String instanceId;
        private String stepId;
        private String stepType;
        private Object result;
        private String error;
        private long createdAt;
        private long completedAt;
        private String status; // running, completed, failed
        
        public WorkflowStepExecution(String id, String instanceId, String stepId, String stepType, long createdAt, String status) {
            this.id = id;
            this.instanceId = instanceId;
            this.stepId = stepId;
            this.stepType = stepType;
            this.createdAt = createdAt;
            this.status = status;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getInstanceId() { return instanceId; }
        public void setInstanceId(String instanceId) { this.instanceId = instanceId; }
        public String getStepId() { return stepId; }
        public void setStepId(String stepId) { this.stepId = stepId; }
        public String getStepType() { return stepType; }
        public void setStepType(String stepType) { this.stepType = stepType; }
        public Object getResult() { return result; }
        public void setResult(Object result) { this.result = result; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getCompletedAt() { return completedAt; }
        public void setCompletedAt(long completedAt) { this.completedAt = completedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}