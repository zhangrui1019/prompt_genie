package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MultiAgentService {
    
    private final Map<String, Agent> agents = new ConcurrentHashMap<>();
    private final Map<String, AgentTeam> agentTeams = new ConcurrentHashMap<>();
    private final Map<String, TeamTask> teamTasks = new ConcurrentHashMap<>();
    private final Map<String, AgentMessage> agentMessages = new ConcurrentHashMap<>();
    
    // 初始化多智能体协同服务
    public void init() {
        // 初始化默认智能体
        initDefaultAgents();
    }
    
    // 初始化默认智能体
    private void initDefaultAgents() {
        // 创建CEO智能体
        Agent ceoAgent = new Agent(
            "ceo",
            "CEO Agent",
            "Responsible for task decomposition and overall coordination",
            "ceo",
            Arrays.asList("task_decomposition", "team_management", "strategy"),
            System.currentTimeMillis()
        );
        agents.put(ceoAgent.getId(), ceoAgent);
        
        // 创建PM智能体
        Agent pmAgent = new Agent(
            "pm",
            "PM Agent",
            "Responsible for refining requirements and project management",
            "pm",
            Arrays.asList("requirement_analysis", "project_planning", "progress_tracking"),
            System.currentTimeMillis()
        );
        agents.put(pmAgent.getId(), pmAgent);
        
        // 创建Coder智能体
        Agent coderAgent = new Agent(
            "coder",
            "Coder Agent",
            "Responsible for writing code",
            "coder",
            Arrays.asList("coding", "debugging", "code_review"),
            System.currentTimeMillis()
        );
        agents.put(coderAgent.getId(), coderAgent);
        
        // 创建Tester智能体
        Agent testerAgent = new Agent(
            "tester",
            "Tester Agent",
            "Responsible for running tests",
            "tester",
            Arrays.asList("test_case_design", "test_execution", "bug_reporting"),
            System.currentTimeMillis()
        );
        agents.put(testerAgent.getId(), testerAgent);
        
        // 创建默认团队
        createDefaultTeam();
    }
    
    // 创建默认团队
    private void createDefaultTeam() {
        AgentTeam team = new AgentTeam(
            "default_team",
            "Default Team",
            "A team with CEO, PM, Coder, and Tester agents",
            Arrays.asList("ceo", "pm", "coder", "tester"),
            System.currentTimeMillis()
        );
        agentTeams.put(team.getId(), team);
    }
    
    // 创建智能体
    public Agent createAgent(String id, String name, String description, String type, List<String> skills) {
        Agent agent = new Agent(
            id,
            name,
            description,
            type,
            skills,
            System.currentTimeMillis()
        );
        agents.put(id, agent);
        return agent;
    }
    
    // 创建智能体团队
    public AgentTeam createAgentTeam(String id, String name, String description, List<String> agentIds) {
        // 验证所有智能体是否存在
        for (String agentId : agentIds) {
            if (!agents.containsKey(agentId)) {
                throw new IllegalArgumentException("Agent not found: " + agentId);
            }
        }
        
        AgentTeam team = new AgentTeam(
            id,
            name,
            description,
            agentIds,
            System.currentTimeMillis()
        );
        agentTeams.put(id, team);
        return team;
    }
    
    // 提交团队任务
    public TeamTask submitTeamTask(String taskId, String teamId, String taskDescription, Map<String, Object> parameters) {
        AgentTeam team = agentTeams.get(teamId);
        if (team == null) {
            throw new IllegalArgumentException("Team not found: " + teamId);
        }
        
        TeamTask task = new TeamTask(
            taskId,
            teamId,
            taskDescription,
            parameters,
            "pending",
            System.currentTimeMillis()
        );
        teamTasks.put(taskId, task);
        
        // 异步执行团队任务
        executeTeamTask(task);
        
        return task;
    }
    
    // 执行团队任务
    private void executeTeamTask(TeamTask task) {
        // 模拟团队任务执行过程
        new Thread(() -> {
            try {
                task.setStatus("running");
                task.setStartedAt(System.currentTimeMillis());
                
                // 1. CEO智能体拆解任务
                String ceoAgentId = "ceo";
                TaskDecomposition decomposition = decomposeTask(ceoAgentId, task.getTaskDescription());
                task.setTaskDecomposition(decomposition);
                
                // 2. PM智能体细化需求
                String pmAgentId = "pm";
                RequirementRefinement refinement = refineRequirements(pmAgentId, decomposition);
                task.setRequirementRefinement(refinement);
                
                // 3. Coder智能体编写代码
                String coderAgentId = "coder";
                CodeImplementation implementation = implementCode(coderAgentId, refinement);
                task.setCodeImplementation(implementation);
                
                // 4. Tester智能体运行测试
                String testerAgentId = "tester";
                TestExecution execution = executeTests(testerAgentId, implementation);
                task.setTestExecution(execution);
                
                // 5. 汇总结果
                if (execution != null && "passed".equals(execution.getStatus())) {
                    task.setStatus("completed");
                    task.setResult("Task completed successfully");
                } else {
                    task.setStatus("failed");
                    task.setError("Test execution failed");
                }
                
                task.setCompletedAt(System.currentTimeMillis());
            } catch (Exception e) {
                task.setStatus("failed");
                task.setError(e.getMessage());
            }
        }).start();
    }
    
    // 拆解任务
    private TaskDecomposition decomposeTask(String agentId, String taskDescription) {
        // 模拟CEO智能体拆解任务
        List<TaskComponent> components = new ArrayList<>();
        components.add(new TaskComponent("1", "Analyze requirements", "pm", 1));
        components.add(new TaskComponent("2", "Design solution", "ceo", 2));
        components.add(new TaskComponent("3", "Implement code", "coder", 3));
        components.add(new TaskComponent("4", "Test implementation", "tester", 4));
        components.add(new TaskComponent("5", "Review and deploy", "ceo", 5));
        
        return new TaskDecomposition(
            "decomp-" + agentId + "-" + System.currentTimeMillis(),
            agentId,
            taskDescription,
            components,
            System.currentTimeMillis()
        );
    }
    
    // 细化需求
    private RequirementRefinement refineRequirements(String agentId, TaskDecomposition decomposition) {
        // 模拟PM智能体细化需求
        Map<String, String> requirements = new HashMap<>();
        requirements.put("functional", "Implement core functionality");
        requirements.put("non_functional", "Ensure performance and reliability");
        requirements.put("user_stories", "As a user, I want to...");
        
        return new RequirementRefinement(
            "refine-" + agentId + "-" + System.currentTimeMillis(),
            agentId,
            decomposition.getId(),
            requirements,
            System.currentTimeMillis()
        );
    }
    
    // 实现代码
    private CodeImplementation implementCode(String agentId, RequirementRefinement refinement) {
        // 模拟Coder智能体实现代码
        Map<String, String> codeFiles = new HashMap<>();
        codeFiles.put("main.py", "def main():\n    print('Hello, World!')");
        codeFiles.put("utils.py", "def helper():\n    return True");
        
        return new CodeImplementation(
            "code-" + agentId + "-" + System.currentTimeMillis(),
            agentId,
            refinement.getId(),
            codeFiles,
            System.currentTimeMillis()
        );
    }
    
    // 执行测试
    private TestExecution executeTests(String agentId, CodeImplementation implementation) {
        // 模拟Tester智能体执行测试
        List<TestResult> testResults = new ArrayList<>();
        testResults.add(new TestResult("test1", "Unit test", "passed", "Test passed successfully"));
        testResults.add(new TestResult("test2", "Integration test", "passed", "Test passed successfully"));
        testResults.add(new TestResult("test3", "Performance test", "passed", "Test passed successfully"));
        
        return new TestExecution(
            "test-" + agentId + "-" + System.currentTimeMillis(),
            agentId,
            implementation.getId(),
            testResults,
            "passed",
            System.currentTimeMillis()
        );
    }
    
    // 发送智能体消息
    public AgentMessage sendAgentMessage(String messageId, String senderId, String receiverId, String content, String messageType) {
        Agent sender = agents.get(senderId);
        Agent receiver = agents.get(receiverId);
        
        if (sender == null || receiver == null) {
            throw new IllegalArgumentException("Sender or receiver agent not found");
        }
        
        AgentMessage message = new AgentMessage(
            messageId,
            senderId,
            receiverId,
            content,
            messageType,
            "sent",
            System.currentTimeMillis()
        );
        agentMessages.put(messageId, message);
        
        // 模拟消息处理
        processAgentMessage(message);
        
        return message;
    }
    
    // 处理智能体消息
    private void processAgentMessage(AgentMessage message) {
        // 模拟消息处理
        new Thread(() -> {
            try {
                Thread.sleep(1000);
                message.setStatus("delivered");
                
                // 模拟消息被阅读
                Thread.sleep(500);
                message.setStatus("read");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
    
    // 获取智能体列表
    public List<Agent> getAgents() {
        return new ArrayList<>(agents.values());
    }
    
    // 获取团队列表
    public List<AgentTeam> getAgentTeams() {
        return new ArrayList<>(agentTeams.values());
    }
    
    // 获取团队任务
    public TeamTask getTeamTask(String taskId) {
        return teamTasks.get(taskId);
    }
    
    // 智能体类
    public static class Agent {
        private String id;
        private String name;
        private String description;
        private String type;
        private List<String> skills;
        private long createdAt;
        
        public Agent(String id, String name, String description, String type, List<String> skills, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.type = type;
            this.skills = skills;
            this.createdAt = createdAt;
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
        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 智能体团队类
    public static class AgentTeam {
        private String id;
        private String name;
        private String description;
        private List<String> agentIds;
        private long createdAt;
        
        public AgentTeam(String id, String name, String description, List<String> agentIds, long createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.agentIds = agentIds;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getAgentIds() { return agentIds; }
        public void setAgentIds(List<String> agentIds) { this.agentIds = agentIds; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 团队任务类
    public static class TeamTask {
        private String id;
        private String teamId;
        private String taskDescription;
        private Map<String, Object> parameters;
        private String status; // pending, running, completed, failed
        private TaskDecomposition taskDecomposition;
        private RequirementRefinement requirementRefinement;
        private CodeImplementation codeImplementation;
        private TestExecution testExecution;
        private String result;
        private String error;
        private long createdAt;
        private long startedAt;
        private long completedAt;
        
        public TeamTask(String id, String teamId, String taskDescription, Map<String, Object> parameters, String status, long createdAt) {
            this.id = id;
            this.teamId = teamId;
            this.taskDescription = taskDescription;
            this.parameters = parameters;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTeamId() { return teamId; }
        public void setTeamId(String teamId) { this.teamId = teamId; }
        public String getTaskDescription() { return taskDescription; }
        public void setTaskDescription(String taskDescription) { this.taskDescription = taskDescription; }
        public Map<String, Object> getParameters() { return parameters; }
        public void setParameters(Map<String, Object> parameters) { this.parameters = parameters; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public TaskDecomposition getTaskDecomposition() { return taskDecomposition; }
        public void setTaskDecomposition(TaskDecomposition taskDecomposition) { this.taskDecomposition = taskDecomposition; }
        public RequirementRefinement getRequirementRefinement() { return requirementRefinement; }
        public void setRequirementRefinement(RequirementRefinement requirementRefinement) { this.requirementRefinement = requirementRefinement; }
        public CodeImplementation getCodeImplementation() { return codeImplementation; }
        public void setCodeImplementation(CodeImplementation codeImplementation) { this.codeImplementation = codeImplementation; }
        public TestExecution getTestExecution() { return testExecution; }
        public void setTestExecution(TestExecution testExecution) { this.testExecution = testExecution; }
        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getStartedAt() { return startedAt; }
        public void setStartedAt(long startedAt) { this.startedAt = startedAt; }
        public long getCompletedAt() { return completedAt; }
        public void setCompletedAt(long completedAt) { this.completedAt = completedAt; }
    }
    
    // 智能体消息类
    public static class AgentMessage {
        private String id;
        private String senderId;
        private String receiverId;
        private String content;
        private String messageType;
        private String status; // sent, delivered, read
        private long createdAt;
        
        public AgentMessage(String id, String senderId, String receiverId, String content, String messageType, String status, long createdAt) {
            this.id = id;
            this.senderId = senderId;
            this.receiverId = receiverId;
            this.content = content;
            this.messageType = messageType;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getSenderId() { return senderId; }
        public void setSenderId(String senderId) { this.senderId = senderId; }
        public String getReceiverId() { return receiverId; }
        public void setReceiverId(String receiverId) { this.receiverId = receiverId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 任务拆解类
    public static class TaskDecomposition {
        private String id;
        private String agentId;
        private String originalTask;
        private List<TaskComponent> components;
        private long createdAt;
        
        public TaskDecomposition(String id, String agentId, String originalTask, List<TaskComponent> components, long createdAt) {
            this.id = id;
            this.agentId = agentId;
            this.originalTask = originalTask;
            this.components = components;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAgentId() { return agentId; }
        public void setAgentId(String agentId) { this.agentId = agentId; }
        public String getOriginalTask() { return originalTask; }
        public void setOriginalTask(String originalTask) { this.originalTask = originalTask; }
        public List<TaskComponent> getComponents() { return components; }
        public void setComponents(List<TaskComponent> components) { this.components = components; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 任务组件类
    public static class TaskComponent {
        private String id;
        private String description;
        private String assignedAgent;
        private int priority;
        
        public TaskComponent(String id, String description, String assignedAgent, int priority) {
            this.id = id;
            this.description = description;
            this.assignedAgent = assignedAgent;
            this.priority = priority;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getAssignedAgent() { return assignedAgent; }
        public void setAssignedAgent(String assignedAgent) { this.assignedAgent = assignedAgent; }
        public int getPriority() { return priority; }
        public void setPriority(int priority) { this.priority = priority; }
    }
    
    // 需求细化类
    public static class RequirementRefinement {
        private String id;
        private String agentId;
        private String decompositionId;
        private Map<String, String> requirements;
        private long createdAt;
        
        public RequirementRefinement(String id, String agentId, String decompositionId, Map<String, String> requirements, long createdAt) {
            this.id = id;
            this.agentId = agentId;
            this.decompositionId = decompositionId;
            this.requirements = requirements;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAgentId() { return agentId; }
        public void setAgentId(String agentId) { this.agentId = agentId; }
        public String getDecompositionId() { return decompositionId; }
        public void setDecompositionId(String decompositionId) { this.decompositionId = decompositionId; }
        public Map<String, String> getRequirements() { return requirements; }
        public void setRequirements(Map<String, String> requirements) { this.requirements = requirements; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 代码实现类
    public static class CodeImplementation {
        private String id;
        private String agentId;
        private String refinementId;
        private Map<String, String> codeFiles;
        private long createdAt;
        
        public CodeImplementation(String id, String agentId, String refinementId, Map<String, String> codeFiles, long createdAt) {
            this.id = id;
            this.agentId = agentId;
            this.refinementId = refinementId;
            this.codeFiles = codeFiles;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAgentId() { return agentId; }
        public void setAgentId(String agentId) { this.agentId = agentId; }
        public String getRefinementId() { return refinementId; }
        public void setRefinementId(String refinementId) { this.refinementId = refinementId; }
        public Map<String, String> getCodeFiles() { return codeFiles; }
        public void setCodeFiles(Map<String, String> codeFiles) { this.codeFiles = codeFiles; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 测试执行类
    public static class TestExecution {
        private String id;
        private String agentId;
        private String implementationId;
        private List<TestResult> testResults;
        private String status; // passed, failed
        private long createdAt;
        
        public TestExecution(String id, String agentId, String implementationId, List<TestResult> testResults, String status, long createdAt) {
            this.id = id;
            this.agentId = agentId;
            this.implementationId = implementationId;
            this.testResults = testResults;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAgentId() { return agentId; }
        public void setAgentId(String agentId) { this.agentId = agentId; }
        public String getImplementationId() { return implementationId; }
        public void setImplementationId(String implementationId) { this.implementationId = implementationId; }
        public List<TestResult> getTestResults() { return testResults; }
        public void setTestResults(List<TestResult> testResults) { this.testResults = testResults; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 测试结果类
    public static class TestResult {
        private String id;
        private String testName;
        private String status; // passed, failed
        private String message;
        
        public TestResult(String id, String testName, String status, String message) {
            this.id = id;
            this.testName = testName;
            this.status = status;
            this.message = message;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTestName() { return testName; }
        public void setTestName(String testName) { this.testName = testName; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}