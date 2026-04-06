package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class HumanInTheLoopService {
    
    private final Map<String, Workflow> workflows = new ConcurrentHashMap<>();
    private final Map<String, WorkflowTask> workflowTasks = new ConcurrentHashMap<>();
    private final Map<String, DecisionPoint> decisionPoints = new ConcurrentHashMap<>();
    private final Map<String, HumanIntervention> humanInterventions = new ConcurrentHashMap<>();
    private final Map<String, LearningRecord> learningRecords = new ConcurrentHashMap<>();
    
    // 初始化人机共生工作流服务
    public void init() {
        // 初始化默认工作流模板
        initDefaultWorkflowTemplates();
    }
    
    // 初始化默认工作流模板
    private void initDefaultWorkflowTemplates() {
        // 这里可以初始化默认的工作流模板
    }
    
    // 创建工作流
    public Workflow createWorkflow(String workflowId, String name, String description, List<WorkflowStep> steps) {
        Workflow workflow = new Workflow(
            workflowId,
            name,
            description,
            steps,
            "created",
            System.currentTimeMillis()
        );
        workflows.put(workflowId, workflow);
        return workflow;
    }
    
    // 启动工作流
    public Workflow startWorkflow(String workflowId, Map<String, Object> inputs) {
        Workflow workflow = workflows.get(workflowId);
        if (workflow == null) {
            throw new IllegalArgumentException("Workflow not found: " + workflowId);
        }
        
        workflow.setStatus("running");
        workflow.setStartedAt(System.currentTimeMillis());
        workflow.setInputs(inputs);
        
        // 执行工作流步骤
        executeWorkflowSteps(workflow);
        
        return workflow;
    }
    
    // 执行工作流步骤
    private void executeWorkflowSteps(Workflow workflow) {
        // 异步执行工作流
        new Thread(() -> {
            try {
                List<WorkflowStep> steps = workflow.getSteps();
                Map<String, Object> context = new HashMap<>(workflow.getInputs());
                
                for (int i = 0; i < steps.size(); i++) {
                    WorkflowStep step = steps.get(i);
                    
                    // 执行步骤
                    WorkflowTask task = executeWorkflowStep(workflow.getId(), step, context);
                    workflowTasks.put(task.getId(), task);
                    
                    // 检查是否需要人类介入
                    if ("human_decision".equals(step.getType())) {
                        DecisionPoint decisionPoint = createDecisionPoint(workflow.getId(), step, context);
                        decisionPoints.put(decisionPoint.getId(), decisionPoint);
                        
                        // 暂停工作流，等待人类决策
                        workflow.setStatus("paused");
                        workflow.setCurrentStepIndex(i);
                        workflow.setCurrentDecisionPointId(decisionPoint.getId());
                        return; // 退出执行，等待人类决策
                    }
                    
                    // 更新上下文
                    context.putAll(task.getOutputs());
                }
                
                // 所有步骤执行完成
                workflow.setStatus("completed");
                workflow.setCompletedAt(System.currentTimeMillis());
                workflow.setOutputs(context);
            } catch (Exception e) {
                workflow.setStatus("failed");
                workflow.setError(e.getMessage());
            }
        }).start();
    }
    
    // 执行工作流步骤
    private WorkflowTask executeWorkflowStep(String workflowId, WorkflowStep step, Map<String, Object> context) {
        String taskId = "task-" + workflowId + "-" + step.getId() + "-" + System.currentTimeMillis();
        WorkflowTask task = new WorkflowTask(
            taskId,
            workflowId,
            step.getId(),
            step.getName(),
            step.getType(),
            context,
            "running",
            System.currentTimeMillis()
        );
        
        // 模拟步骤执行
        try {
            Thread.sleep(1000);
            
            // 根据步骤类型执行不同操作
            Map<String, Object> outputs = new HashMap<>();
            switch (step.getType()) {
                case "ai_processing":
                    outputs.put("ai_result", "AI processed result for " + step.getName());
                    break;
                case "data_analysis":
                    outputs.put("analysis_result", "Analysis result for " + step.getName());
                    break;
                case "validation":
                    outputs.put("validation_result", true);
                    break;
                default:
                    outputs.put("result", "Result for " + step.getName());
            }
            
            task.setOutputs(outputs);
            task.setStatus("completed");
            task.setCompletedAt(System.currentTimeMillis());
        } catch (Exception e) {
            task.setStatus("failed");
            task.setError(e.getMessage());
        }
        
        return task;
    }
    
    // 创建决策点
    private DecisionPoint createDecisionPoint(String workflowId, WorkflowStep step, Map<String, Object> context) {
        String decisionId = "decision-" + workflowId + "-" + System.currentTimeMillis();
        DecisionPoint decisionPoint = new DecisionPoint(
            decisionId,
            workflowId,
            step.getId(),
            step.getName(),
            context,
            "pending",
            System.currentTimeMillis()
        );
        
        // 生成决策选项
        List<DecisionOption> options = generateDecisionOptions(step, context);
        decisionPoint.setOptions(options);
        
        return decisionPoint;
    }
    
    // 生成决策选项
    private List<DecisionOption> generateDecisionOptions(WorkflowStep step, Map<String, Object> context) {
        List<DecisionOption> options = new ArrayList<>();
        
        // 根据步骤类型生成不同的决策选项
        switch (step.getName()) {
            case "Approve Budget":
                options.add(new DecisionOption("approve", "Approve", "Approve the budget request"));
                options.add(new DecisionOption("reject", "Reject", "Reject the budget request"));
                options.add(new DecisionOption("modify", "Modify", "Modify the budget request"));
                break;
            case "Review Design":
                options.add(new DecisionOption("approve", "Approve", "Approve the design"));
                options.add(new DecisionOption("reject", "Reject", "Reject the design"));
                options.add(new DecisionOption("revision", "Request Revision", "Request design revision"));
                break;
            default:
                options.add(new DecisionOption("yes", "Yes", "Proceed with the action"));
                options.add(new DecisionOption("no", "No", "Cancel the action"));
        }
        
        return options;
    }
    
    // 提交人类决策
    public HumanIntervention submitHumanDecision(String decisionId, String optionId, String notes) {
        DecisionPoint decisionPoint = decisionPoints.get(decisionId);
        if (decisionPoint == null) {
            throw new IllegalArgumentException("Decision point not found: " + decisionId);
        }
        
        // 验证选项是否有效
        boolean validOption = decisionPoint.getOptions().stream()
            .anyMatch(option -> option.getId().equals(optionId));
        if (!validOption) {
            throw new IllegalArgumentException("Invalid decision option: " + optionId);
        }
        
        String interventionId = "intervention-" + decisionId + "-" + System.currentTimeMillis();
        HumanIntervention intervention = new HumanIntervention(
            interventionId,
            decisionId,
            optionId,
            notes,
            "completed",
            System.currentTimeMillis()
        );
        humanInterventions.put(interventionId, intervention);
        
        // 更新决策点状态
        decisionPoint.setStatus("completed");
        decisionPoint.setSelectedOptionId(optionId);
        decisionPoint.setCompletedAt(System.currentTimeMillis());
        
        // 恢复工作流执行
        resumeWorkflow(decisionPoint.getWorkflowId(), optionId, notes);
        
        // 记录学习
        recordLearning(decisionId, optionId, notes);
        
        return intervention;
    }
    
    // 恢复工作流执行
    private void resumeWorkflow(String workflowId, String decision, String notes) {
        Workflow workflow = workflows.get(workflowId);
        if (workflow == null) {
            return;
        }
        
        workflow.setStatus("running");
        workflow.setLastHumanDecision(decision);
        
        // 继续执行剩余步骤
        new Thread(() -> {
            try {
                List<WorkflowStep> steps = workflow.getSteps();
                int currentIndex = workflow.getCurrentStepIndex();
                Map<String, Object> context = new HashMap<>(workflow.getInputs());
                
                // 从当前步骤的下一个步骤开始执行
                for (int i = currentIndex + 1; i < steps.size(); i++) {
                    WorkflowStep step = steps.get(i);
                    
                    // 执行步骤
                    WorkflowTask task = executeWorkflowStep(workflow.getId(), step, context);
                    workflowTasks.put(task.getId(), task);
                    
                    // 检查是否需要人类介入
                    if ("human_decision".equals(step.getType())) {
                        DecisionPoint decisionPoint = createDecisionPoint(workflow.getId(), step, context);
                        decisionPoints.put(decisionPoint.getId(), decisionPoint);
                        
                        // 暂停工作流，等待人类决策
                        workflow.setStatus("paused");
                        workflow.setCurrentStepIndex(i);
                        workflow.setCurrentDecisionPointId(decisionPoint.getId());
                        return; // 退出执行，等待人类决策
                    }
                    
                    // 更新上下文
                    context.putAll(task.getOutputs());
                }
                
                // 所有步骤执行完成
                workflow.setStatus("completed");
                workflow.setCompletedAt(System.currentTimeMillis());
                workflow.setOutputs(context);
            } catch (Exception e) {
                workflow.setStatus("failed");
                workflow.setError(e.getMessage());
            }
        }).start();
    }
    
    // 记录学习
    private void recordLearning(String decisionId, String optionId, String notes) {
        String learningId = "learning-" + decisionId + "-" + System.currentTimeMillis();
        LearningRecord record = new LearningRecord(
            learningId,
            decisionId,
            optionId,
            notes,
            System.currentTimeMillis()
        );
        learningRecords.put(learningId, record);
        
        // 这里可以实现更复杂的学习逻辑，如更新决策模型等
    }
    
    // 获取工作流
    public Workflow getWorkflow(String workflowId) {
        return workflows.get(workflowId);
    }
    
    // 获取决策点
    public DecisionPoint getDecisionPoint(String decisionId) {
        return decisionPoints.get(decisionId);
    }
    
    // 获取人类干预记录
    public HumanIntervention getHumanIntervention(String interventionId) {
        return humanInterventions.get(interventionId);
    }
    
    // 工作流类
    public static class Workflow {
        private String id;
        private String name;
        private String description;
        private List<WorkflowStep> steps;
        private String status; // created, running, paused, completed, failed
        private Map<String, Object> inputs;
        private Map<String, Object> outputs;
        private int currentStepIndex;
        private String currentDecisionPointId;
        private String lastHumanDecision;
        private String error;
        private long createdAt;
        private long startedAt;
        private long completedAt;
        
        public Workflow(String id, String name, String description, List<WorkflowStep> steps, String status, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.steps = steps;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<WorkflowStep> getSteps() { return steps; }
        public void setSteps(List<WorkflowStep> steps) { this.steps = steps; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Map<String, Object> getInputs() { return inputs; }
        public void setInputs(Map<String, Object> inputs) { this.inputs = inputs; }
        public Map<String, Object> getOutputs() { return outputs; }
        public void setOutputs(Map<String, Object> outputs) { this.outputs = outputs; }
        public int getCurrentStepIndex() { return currentStepIndex; }
        public void setCurrentStepIndex(int currentStepIndex) { this.currentStepIndex = currentStepIndex; }
        public String getCurrentDecisionPointId() { return currentDecisionPointId; }
        public void setCurrentDecisionPointId(String currentDecisionPointId) { this.currentDecisionPointId = currentDecisionPointId; }
        public String getLastHumanDecision() { return lastHumanDecision; }
        public void setLastHumanDecision(String lastHumanDecision) { this.lastHumanDecision = lastHumanDecision; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getStartedAt() { return startedAt; }
        public void setStartedAt(long startedAt) { this.startedAt = startedAt; }
        public long getCompletedAt() { return completedAt; }
        public void setCompletedAt(long completedAt) { this.completedAt = completedAt; }
    }
    
    // 工作流步骤类
    public static class WorkflowStep {
        private String id;
        private String name;
        private String type; // ai_processing, human_decision, data_analysis, validation
        private Map<String, Object> parameters;
        
        public WorkflowStep(String id, String name, String type, Map<String, Object> parameters) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.parameters = parameters;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Map<String, Object> getParameters() { return parameters; }
        public void setParameters(Map<String, Object> parameters) { this.parameters = parameters; }
    }
    
    // 工作流任务类
    public static class WorkflowTask {
        private String id;
        private String workflowId;
        private String stepId;
        private String stepName;
        private String stepType;
        private Map<String, Object> inputs;
        private Map<String, Object> outputs;
        private String status; // running, completed, failed
        private String error;
        private long createdAt;
        private long completedAt;
        
        public WorkflowTask(String id, String workflowId, String stepId, String stepName, String stepType, Map<String, Object> inputs, String status, long createdAt) {
            this.id = id;
            this.workflowId = workflowId;
            this.stepId = stepId;
            this.stepName = stepName;
            this.stepType = stepType;
            this.inputs = inputs;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getWorkflowId() { return workflowId; }
        public void setWorkflowId(String workflowId) { this.workflowId = workflowId; }
        public String getStepId() { return stepId; }
        public void setStepId(String stepId) { this.stepId = stepId; }
        public String getStepName() { return stepName; }
        public void setStepName(String stepName) { this.stepName = stepName; }
        public String getStepType() { return stepType; }
        public void setStepType(String stepType) { this.stepType = stepType; }
        public Map<String, Object> getInputs() { return inputs; }
        public void setInputs(Map<String, Object> inputs) { this.inputs = inputs; }
        public Map<String, Object> getOutputs() { return outputs; }
        public void setOutputs(Map<String, Object> outputs) { this.outputs = outputs; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getCompletedAt() { return completedAt; }
        public void setCompletedAt(long completedAt) { this.completedAt = completedAt; }
    }
    
    // 决策点类
    public static class DecisionPoint {
        private String id;
        private String workflowId;
        private String stepId;
        private String stepName;
        private Map<String, Object> context;
        private List<DecisionOption> options;
        private String selectedOptionId;
        private String status; // pending, completed
        private long createdAt;
        private long completedAt;
        
        public DecisionPoint(String id, String workflowId, String stepId, String stepName, Map<String, Object> context, String status, long createdAt) {
            this.id = id;
            this.workflowId = workflowId;
            this.stepId = stepId;
            this.stepName = stepName;
            this.context = context;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getWorkflowId() { return workflowId; }
        public void setWorkflowId(String workflowId) { this.workflowId = workflowId; }
        public String getStepId() { return stepId; }
        public void setStepId(String stepId) { this.stepId = stepId; }
        public String getStepName() { return stepName; }
        public void setStepName(String stepName) { this.stepName = stepName; }
        public Map<String, Object> getContext() { return context; }
        public void setContext(Map<String, Object> context) { this.context = context; }
        public List<DecisionOption> getOptions() { return options; }
        public void setOptions(List<DecisionOption> options) { this.options = options; }
        public String getSelectedOptionId() { return selectedOptionId; }
        public void setSelectedOptionId(String selectedOptionId) { this.selectedOptionId = selectedOptionId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getCompletedAt() { return completedAt; }
        public void setCompletedAt(long completedAt) { this.completedAt = completedAt; }
    }
    
    // 决策选项类
    public static class DecisionOption {
        private String id;
        private String label;
        private String description;
        
        public DecisionOption(String id, String label, String description) {
            this.id = id;
            this.label = label;
            this.description = description;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    // 人类干预类
    public static class HumanIntervention {
        private String id;
        private String decisionPointId;
        private String selectedOptionId;
        private String notes;
        private String status; // completed
        private long createdAt;
        
        public HumanIntervention(String id, String decisionPointId, String selectedOptionId, String notes, String status, long createdAt) {
            this.id = id;
            this.decisionPointId = decisionPointId;
            this.selectedOptionId = selectedOptionId;
            this.notes = notes;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDecisionPointId() { return decisionPointId; }
        public void setDecisionPointId(String decisionPointId) { this.decisionPointId = decisionPointId; }
        public String getSelectedOptionId() { return selectedOptionId; }
        public void setSelectedOptionId(String selectedOptionId) { this.selectedOptionId = selectedOptionId; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 学习记录类
    public static class LearningRecord {
        private String id;
        private String decisionPointId;
        private String selectedOptionId;
        private String notes;
        private long createdAt;
        
        public LearningRecord(String id, String decisionPointId, String selectedOptionId, String notes, long createdAt) {
            this.id = id;
            this.decisionPointId = decisionPointId;
            this.selectedOptionId = selectedOptionId;
            this.notes = notes;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDecisionPointId() { return decisionPointId; }
        public void setDecisionPointId(String decisionPointId) { this.decisionPointId = decisionPointId; }
        public String getSelectedOptionId() { return selectedOptionId; }
        public void setSelectedOptionId(String selectedOptionId) { this.selectedOptionId = selectedOptionId; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
}