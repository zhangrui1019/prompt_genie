package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PrivateModelService {
    
    private final Map<String, PrivateModel> privateModels = new ConcurrentHashMap<>();
    private final Map<String, FinetuningTask> finetuningTasks = new ConcurrentHashMap<>();
    private final Map<String, Dataset> datasets = new ConcurrentHashMap<>();
    
    // 初始化私有模型服务
    public void init() {
        // 初始化默认模型类型
        initDefaultModelTypes();
    }
    
    // 初始化默认模型类型
    private void initDefaultModelTypes() {
        // 这里可以初始化默认的模型类型
    }
    
    // 注册本地模型
    public PrivateModel registerLocalModel(String modelId, String name, String description, String modelType, String endpoint) {
        PrivateModel model = new PrivateModel(
            modelId,
            name,
            description,
            modelType, // ollama, vllm, custom
            endpoint,
            "active",
            System.currentTimeMillis()
        );
        privateModels.put(modelId, model);
        return model;
    }
    
    // 上传微调数据集
    public Dataset uploadDataset(String datasetId, String name, String description, List<PromptCompletionPair> data, String uploaderId) {
        Dataset dataset = new Dataset(
            datasetId,
            name,
            description,
            data,
            uploaderId,
            System.currentTimeMillis()
        );
        datasets.put(datasetId, dataset);
        return dataset;
    }
    
    // 创建微调任务
    public FinetuningTask createFinetuningTask(String taskId, String modelId, String datasetId, Map<String, Object> finetuningParams, String creatorId) {
        PrivateModel model = privateModels.get(modelId);
        Dataset dataset = datasets.get(datasetId);
        
        if (model == null) {
            throw new IllegalArgumentException("Model not found: " + modelId);
        }
        
        if (dataset == null) {
            throw new IllegalArgumentException("Dataset not found: " + datasetId);
        }
        
        FinetuningTask task = new FinetuningTask(
            taskId,
            modelId,
            datasetId,
            finetuningParams,
            creatorId,
            "pending",
            System.currentTimeMillis()
        );
        finetuningTasks.put(taskId, task);
        
        // 启动微调任务
        startFinetuningTask(task);
        
        return task;
    }
    
    // 启动微调任务
    private void startFinetuningTask(FinetuningTask task) {
        new Thread(() -> {
            try {
                // 更新任务状态为运行中
                task.setStatus("running");
                task.setStartedAt(System.currentTimeMillis());
                
                // 模拟微调过程
                simulateFinetuningProcess(task);
                
                // 更新任务状态为完成
                task.setStatus("completed");
                task.setCompletedAt(System.currentTimeMillis());
                
                // 生成微调后的模型ID
                String finetunedModelId = task.getModelId() + "_ft_" + System.currentTimeMillis();
                task.setFinetunedModelId(finetunedModelId);
                
                // 注册微调后的模型
                registerFinetunedModel(finetunedModelId, task);
            } catch (Exception e) {
                task.setStatus("failed");
                task.setError(e.getMessage());
            }
        }).start();
    }
    
    // 模拟微调过程
    private void simulateFinetuningProcess(FinetuningTask task) throws InterruptedException {
        // 模拟微调的不同阶段
        List<String> stages = Arrays.asList(
            "Preprocessing dataset",
            "Initializing model",
            "Training epoch 1",
            "Training epoch 2",
            "Training epoch 3",
            "Evaluating model",
            "Saving model"
        );
        
        for (String stage : stages) {
            task.setCurrentStage(stage);
            task.setProgress((float) (stages.indexOf(stage) + 1) / stages.size());
            // 模拟每个阶段的耗时
            Thread.sleep(1000);
        }
    }
    
    // 注册微调后的模型
    private void registerFinetunedModel(String finetunedModelId, FinetuningTask task) {
        PrivateModel originalModel = privateModels.get(task.getModelId());
        if (originalModel != null) {
            PrivateModel finetunedModel = new PrivateModel(
                finetunedModelId,
                originalModel.getName() + " (Finetuned)",
                originalModel.getDescription() + " - Finetuned on dataset " + task.getDatasetId(),
                originalModel.getModelType(),
                originalModel.getEndpoint(),
                "active",
                System.currentTimeMillis()
            );
            finetunedModel.setFinetuningTaskId(task.getId());
            privateModels.put(finetunedModelId, finetunedModel);
        }
    }
    
    // 停止微调任务
    public void stopFinetuningTask(String taskId) {
        FinetuningTask task = finetuningTasks.get(taskId);
        if (task != null && "running".equals(task.getStatus())) {
            task.setStatus("stopped");
            task.setStoppedAt(System.currentTimeMillis());
        }
    }
    
    // 获取私有模型列表
    public List<PrivateModel> getPrivateModels() {
        return new ArrayList<>(privateModels.values());
    }
    
    // 获取私有模型
    public PrivateModel getPrivateModel(String modelId) {
        return privateModels.get(modelId);
    }
    
    // 获取微调任务列表
    public List<FinetuningTask> getFinetuningTasks() {
        return new ArrayList<>(finetuningTasks.values());
    }
    
    // 获取微调任务
    public FinetuningTask getFinetuningTask(String taskId) {
        return finetuningTasks.get(taskId);
    }
    
    // 获取数据集列表
    public List<Dataset> getDatasets() {
        return new ArrayList<>(datasets.values());
    }
    
    // 获取数据集
    public Dataset getDataset(String datasetId) {
        return datasets.get(datasetId);
    }
    
    // 私有模型类
    public static class PrivateModel {
        private String id;
        private String name;
        private String description;
        private String modelType; // ollama, vllm, custom
        private String endpoint;
        private String status; // active, inactive
        private String finetuningTaskId;
        private long createdAt;
        
        public PrivateModel(String id, String name, String description, String modelType, String endpoint, String status, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.modelType = modelType;
            this.endpoint = endpoint;
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
        public String getModelType() { return modelType; }
        public void setModelType(String modelType) { this.modelType = modelType; }
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getFinetuningTaskId() { return finetuningTaskId; }
        public void setFinetuningTaskId(String finetuningTaskId) { this.finetuningTaskId = finetuningTaskId; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 微调任务类
    public static class FinetuningTask {
        private String id;
        private String modelId;
        private String datasetId;
        private Map<String, Object> finetuningParams;
        private String creatorId;
        private String status; // pending, running, completed, failed, stopped
        private String currentStage;
        private float progress;
        private String finetunedModelId;
        private String error;
        private long createdAt;
        private long startedAt;
        private long completedAt;
        private long stoppedAt;
        
        public FinetuningTask(String id, String modelId, String datasetId, Map<String, Object> finetuningParams, String creatorId, String status, long createdAt) {
            this.id = id;
            this.modelId = modelId;
            this.datasetId = datasetId;
            this.finetuningParams = finetuningParams;
            this.creatorId = creatorId;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getModelId() { return modelId; }
        public void setModelId(String modelId) { this.modelId = modelId; }
        public String getDatasetId() { return datasetId; }
        public void setDatasetId(String datasetId) { this.datasetId = datasetId; }
        public Map<String, Object> getFinetuningParams() { return finetuningParams; }
        public void setFinetuningParams(Map<String, Object> finetuningParams) { this.finetuningParams = finetuningParams; }
        public String getCreatorId() { return creatorId; }
        public void setCreatorId(String creatorId) { this.creatorId = creatorId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCurrentStage() { return currentStage; }
        public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }
        public float getProgress() { return progress; }
        public void setProgress(float progress) { this.progress = progress; }
        public String getFinetunedModelId() { return finetunedModelId; }
        public void setFinetunedModelId(String finetunedModelId) { this.finetunedModelId = finetunedModelId; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getStartedAt() { return startedAt; }
        public void setStartedAt(long startedAt) { this.startedAt = startedAt; }
        public long getCompletedAt() { return completedAt; }
        public void setCompletedAt(long completedAt) { this.completedAt = completedAt; }
        public long getStoppedAt() { return stoppedAt; }
        public void setStoppedAt(long stoppedAt) { this.stoppedAt = stoppedAt; }
    }
    
    // 数据集类
    public static class Dataset {
        private String id;
        private String name;
        private String description;
        private List<PromptCompletionPair> data;
        private String uploaderId;
        private long createdAt;
        
        public Dataset(String id, String name, String description, List<PromptCompletionPair> data, String uploaderId, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.data = data;
            this.uploaderId = uploaderId;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<PromptCompletionPair> getData() { return data; }
        public void setData(List<PromptCompletionPair> data) { this.data = data; }
        public String getUploaderId() { return uploaderId; }
        public void setUploaderId(String uploaderId) { this.uploaderId = uploaderId; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // Prompt-Completion对类
    public static class PromptCompletionPair {
        private String prompt;
        private String completion;
        private Map<String, Object> metadata;
        
        public PromptCompletionPair(String prompt, String completion) {
            this.prompt = prompt;
            this.completion = completion;
            this.metadata = new HashMap<>();
        }
        
        public PromptCompletionPair(String prompt, String completion, Map<String, Object> metadata) {
            this.prompt = prompt;
            this.completion = completion;
            this.metadata = metadata;
        }
        
        // Getters and setters
        public String getPrompt() { return prompt; }
        public void setPrompt(String prompt) { this.prompt = prompt; }
        public String getCompletion() { return completion; }
        public void setCompletion(String completion) { this.completion = completion; }
        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    }
}