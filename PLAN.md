# Prompt Genie 开发计划 (Phase 1: 工具深化期)

基于 `ROADMAP_STRATEGY.md`，本计划旨在落实 Q1/Q2 的核心目标，重点提升工具的专业深度，通过 **批量评测** 和 **工作流增强** 吸引专业用户。

## 1. 总体架构调整

为了支持批量处理和多模态流，后端服务需要进行以下增强：
*   **异步任务引擎**: 引入 `CompletableFuture` 或 Spring Async 处理耗时的批量评测任务。
*   **模型抽象层 (Model Abstraction Layer)**: 统一 `PlaygroundService` 接口，确保文本、图片、视频模型调用的参数标准化。
*   **文件存储**: 增加对评测数据集 (CSV/Excel) 和评测报告的存储支持（本地文件系统或 OSS）。

## 2. 详细任务分解

### 模块 1: 批量自动化评测 (Batch Evaluation) - *High Priority*
*目标：解决用户"不知道哪个 Prompt/模型 更好"的痛点。*

#### 后端开发 (Spring Boot)
1.  **数据模型设计**:
    *   `EvaluationJob`: 记录评测任务状态、关联的 Prompt、数据集路径。
    *   `EvaluationResult`: 记录单条数据的输入、模型输出、评分、耗时、Token消耗。
2.  **API 接口**:
    *   `POST /api/evaluations/upload`: 上传 CSV/Excel 测试集。
    *   `POST /api/evaluations/run`: 提交评测任务（指定 Prompt ID, 模型列表, 评测维度）。
    *   `GET /api/evaluations/{id}`: 获取评测报告。
3.  **核心服务 (`EvaluationService`)**:
    *   实现 CSV/Excel 解析器。
    *   实现并发执行器：针对数据集的每一行，并行调用多个模型。
    *   **Auto-Grader (自动打分)**: 实现 "LLM-as-a-Judge" 逻辑，调用高智力模型（如 GPT-4/Qwen-Max）对输出结果进行打分和点评。

#### 前端开发 (React)
1.  **评测新建页**:
    *   上传组件 (支持拖拽)。
    *   模型选择器 (多选，e.g., Qwen-Turbo, Qwen-Plus)。
    *   评测维度配置 (e.g., "准确性", "创意性", "安全性")。
2.  **评测报告页**:
    *   数据表格：横向对比不同模型的输出。
    *   统计图表：雷达图展示各模型在不同维度上的得分。
    *   一键优化建议：展示 Auto-Grader 的点评。

### 模块 2: 浏览器扩展 (Browser Extension) - *Medium Priority*
*目标：将 Genie 的能力嵌入到用户的工作流中 (Gmail, Twitter 等)。*

1.  **项目初始化**: 使用 Plasmo 或 Vite 构建 Chrome Extension 项目。
2.  **核心功能**:
    *   **Sidebar/Popup**: 快速搜索并复制 Prompt。
    *   **Context Menu**: 右键 "Ask Genie" -> "Optimize Selection"。
    *   **Content Script**: 在输入框聚焦时通过快捷键唤起搜索框。
3.  **后端对接**: 复用 `ExternalPromptController`，增加 API Key 鉴权机制。

### 模块 3: 增强多模态工作流 (Advanced Multi-modal Workflow) - *Medium Priority*
*目标：支持 Image-to-Image, Image-to-Video 等复杂链路。*

1.  **后端升级 (`ChainService`)**:
    *   扩展 `InputMappings`，支持 `File` 或 `URL` 类型的变量传递。
    *   集成阿里云/DashScope 的修图和视频生成 API。
2.  **前端升级 (`ChainCanvas`)**:
    *   新增 `ImageTransformNode` (修图) 和 `VideoGenNode`。
    *   优化节点连线逻辑，增加类型检查（防止将 Text 输出连到 Image 输入）。

## 3. 执行路线图 (Execution Roadmap)

### Week 1-2: 批量评测核心逻辑
- [ ] 后端：实体定义与数据库迁移 (Flyway/DDL)。
- [ ] 后端：CSV 解析与 `PlaygroundService` 的批量并发改造。
- [ ] 后端：实现 `AutoGraderService` (Prompt 编写与调用)。

### Week 3: 评测前端与报表
- [ ] 前端：上传与配置页面。
- [ ] 前端：结果展示与对比视图。
- [ ] 联调与测试：真实模型跑测。

### Week 4: 浏览器插件原型
- [ ] 搭建 Extension 脚手架。
- [ ] 实现登录与 API Key 验证。
- [ ] 实现基础的 Prompt 搜索与插入。

### Week 5+: 多模态增强
- [ ] 调研 Image-to-Image API。
- [ ] 升级 Chain 引擎支持媒体流。

## 4. 技术栈补充
- **Excel 处理**: `EasyExcel` (Java)
- **图表库**: `Recharts` 或 `ECharts` (React)
- **浏览器插件框架**: `Plasmo` (推荐，开发体验好)

---
*Next Step: 建议立即开始 Week 1 的任务，搭建批量评测的后端基础。*
