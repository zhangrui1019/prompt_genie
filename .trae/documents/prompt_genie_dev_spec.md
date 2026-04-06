# Prompt Genie 开发执行规范 (Trae Agent 专用)

> **文档说明**：本文件是基于宏观产品需求文档 (PRD) 拆解而来的 **“Trae 可执行技术规范”**。
> 本文档定义了系统的架构设计、技术栈和实现细节，用于指导开发和维护。
> 
> **当前状态：V1.3 核心升级已完成 (Agent 化与评测中心)**

---

## 1. 全局架构与技术规范 (Global Rules)

### 1.1 技术栈 (Tech Stack)
* **前端 (Frontend)**: React 18, TypeScript, TailwindCSS, Lucide Icons, Vite, Zustand (状态管理)。
  * *UI 组件库*: 基于现有的纯 Tailwind 实现，如需复杂交互尽量复用现有组件风格。
  * *可视化画布*: React Flow
* **后端 (Backend)**: Java 17, Spring Boot 3.2.2, MyBatis-Plus, PostgreSQL。
  * *大模型调用*: 必须通过抽象的接口调用，当前主要对接阿里云 DashScope (Qwen 模型)。
  * *代码风格*: 严格遵守已有的 Lombok 注解、MVC 分层架构 (Controller -> Service -> Mapper -> Entity)。

### 1.2 数据库规范 (Database Rules)
* 所有的 DDL 变更必须写在 `backend/src/main/resources/schema.sql` 中。
* 所有的初始测试数据/字典数据必须写在 `backend/src/main/resources/data.sql` 中。
* 严禁直接通过 Trae 执行 SQL 命令修改数据库，必须通过修改上述 SQL 文件后重启 Spring Boot 让其自动初始化。

---

## 2. 核心模块实现

### 2.1 智能体执行引擎

**实现文件**：
* `backend/src/main/java/com/promptgenie/dto/AgentState.java` - 智能体执行状态
* `backend/src/main/java/com/promptgenie/core/enums/AgentNodeType.java` - 节点类型枚举
* `backend/src/main/java/com/promptgenie/core/exception/PendingApprovalException.java` - 人工审核异常
* `backend/src/main/java/com/promptgenie/service/AgentExecutorService.java` - 核心执行引擎
* `backend/src/main/java/com/promptgenie/api/controller/AgentController.java` - API 控制器

**核心功能**：
* 状态机编排：支持条件分支、循环和错误重试
* 人机协同中断：在风险节点挂起任务，等待人工审核
* 多智能体协作：每个节点作为独立 Agent
* 工具挂载：集成外部工具
* 安全边界设定：输出校验规则

### 2.2 前端可视化画布

**实现文件**：
* `frontend/src/pages/AgentBuilder.tsx` - 智能体构建页面
* `frontend/src/components/canvas/nodes/` - 各种节点组件

**核心功能**：
* 拖拽式画布：使用 React Flow 实现
* 节点类型：LLM Node、Tool Node、Human Approval Node、Condition Node、Loop Node、Error Retry Node
* 节点配置：每个节点类型有对应的配置选项
* 状态机序列化：将画布转换为 JSON DSL

### 2.3 专业级评测中心

**实现文件**：
* `backend/src/main/java/com/promptgenie/evaluation/entity/EvaluationJob.java` - 评测任务
* `backend/src/main/java/com/promptgenie/evaluation/entity/EvaluationResult.java` - 评测结果
* `backend/src/main/java/com/promptgenie/evaluation/service/EvaluationServiceImpl.java` - 评测服务
* `backend/src/main/java/com/promptgenie/evaluation/controller/EvaluationController.java` - API 控制器
* `frontend/src/pages/EvaluationCreate.tsx` - 创建评测任务
* `frontend/src/pages/EvaluationList.tsx` - 评测任务列表
* `frontend/src/pages/EvaluationReport.tsx` - 评测结果报告

**核心功能**：
* 测试集管理：上传和管理测试用例
* 批量回归测试：一键运行多个测试用例
* LLM-as-a-Judge：使用大模型作为裁判
* A/B 效果对比：对比不同版本的性能

### 2.4 通用知识库引擎

**实现文件**：
* `backend/src/main/java/com/promptgenie/entity/KnowledgeBase.java` - 知识库实体
* `backend/src/main/java/com/promptgenie/entity/Document.java` - 文档实体
* `backend/src/main/java/com/promptgenie/service/KnowledgeService.java` - 知识库服务
* `backend/src/main/java/com/promptgenie/api/controller/KnowledgeController.java` - API 控制器
* `frontend/src/pages/KnowledgeBase.tsx` - 知识库管理页面

**核心功能**：
* 文档解析与切分：支持多格式文档
* 混合检索：向量检索与全文检索结合
* 知识挂载：在智能体中挂载知识库

---

## 3. API 接口规范

### 3.1 智能体相关
* `POST /api/agents/{id}/run` - 启动智能体执行
* `POST /api/agents/{id}/resume` - 恢复挂起的智能体执行
* `GET /api/agents` - 获取智能体列表
* `POST /api/agents` - 创建智能体
* `PUT /api/agents/{id}` - 更新智能体
* `DELETE /api/agents/{id}` - 删除智能体

### 3.2 评测相关
* `POST /api/evaluations` - 创建评测任务
* `GET /api/evaluations` - 获取评测任务列表
* `GET /api/evaluations/{id}/results` - 获取评测结果
* `DELETE /api/evaluations/{id}` - 删除评测任务

### 3.3 知识库相关
* `POST /api/knowledge/upload` - 上传文档
* `GET /api/knowledge/bases` - 获取知识库列表
* `POST /api/knowledge/bases` - 创建知识库
* `PUT /api/knowledge/bases/{id}` - 更新知识库
* `DELETE /api/knowledge/bases/{id}` - 删除知识库

---

## 4. 部署与运行

### 4.1 本地开发
* **前端**：
  - 安装依赖：`npm install`
  - 启动开发服务器：`npm run dev`
  - 构建生产版本：`npm run build`

* **后端**：
  - 安装依赖：`mvn install`
  - 启动开发服务器：`mvn spring-boot:run`
  - 构建生产版本：`mvn package`

### 4.2 生产部署
* **Docker 容器化**：
  - 前端：`Dockerfile.frontend`
  - 后端：`Dockerfile`

* **Kubernetes 部署**：
  - 支持在 K8s 集群中部署

---

## 5. 代码规范与最佳实践

### 5.1 前端规范
* 使用 TypeScript 类型定义
* 组件化开发，复用通用组件
* 状态管理使用 Zustand
* 样式使用 TailwindCSS
* 代码格式化使用 ESLint

### 5.2 后端规范
* 严格遵守 MVC 分层架构
* 使用 Lombok 简化代码
* 异常处理统一管理
* 日志记录规范
* 数据库操作使用 MyBatis-Plus

---

## 6. 测试策略

### 6.1 单元测试
* 前端：使用 Jest 进行组件测试
* 后端：使用 JUnit 进行服务测试

### 6.2 集成测试
* 测试智能体执行流程
* 测试评测中心功能
* 测试知识库功能

### 6.3 性能测试
* 测试智能体执行性能
* 测试评测任务并发处理
* 测试知识库检索性能

---

## 7. 维护与扩展

### 7.1 系统维护
* 定期备份数据库
* 监控系统性能
* 分析日志，及时发现问题

### 7.2 功能扩展
* 遵循现有架构设计
* 保持代码风格一致性
* 编写详细的文档

---
> END OF SPEC
