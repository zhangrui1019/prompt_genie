# Prompt Genie - Project Status & Roadmap
*Date: 2026-01-17*

## 1. 当前功能概览 (Implemented Features)

在本次开发迭代中，我们重点增强了 Prompt Genie 的多模态能力和 Playground 的交互体验。

### A. 多模态生成支持 (Multi-Modal Generation)
我们已经成功集成了阿里云百炼 (DashScope) 的全套大模型能力：

*   **文生文 (Text-to-Text)**
    *   **模型**: 支持 Qwen-Turbo, Qwen-Plus, Qwen-Max。
    *   **实现**: 基于 DashScope SDK。
*   **文生图 (Text-to-Image)**
    *   **模型**: 支持 Wanx-V1 (通义万相)。
    *   **实现**: 基于 DashScope SDK (`ImageSynthesis`)。
    *   **展示**: 在 Playground 中直接渲染生成图片。
*   **文生视频 (Text-to-Video)**
    *   **模型**: 支持 **Wanx 2.1 Turbo**, **Wanx 2.1 Plus**, **Wan 2.6**。
    *   **实现**: 
        *   使用原生 HTTP 接口调用 (`/api/v1/services/aigc/video-generation/video-synthesis`)，绕过了 SDK 版本限制。
        *   实现了 **异步轮询机制 (Async Polling)**：每 15 秒检查一次任务状态，最大超时时间 15 分钟，确保长耗时视频任务能顺利完成。
    *   **参数优化**: 针对不同模型配置了智能默认参数（如分辨率 1280*720, 时长 5s, 开启 Prompt 扩展）。

### B. Playground 升级
*   **多模型对比 (Model Comparison)**: 
    *   支持同时选择多个模型（例如同时运行 Qwen-Max 和 Qwen-Turbo，或同时生成两个视频）。
    *   结果区域自动分栏显示，便于直观对比效果。
*   **模式切换**: 顶部新增 Text / Image / Video 模式切换器。
*   **结果展示优化**:
    *   视频生成结果提供 **内嵌播放器** 及 **新标签页打开** 链接，解决部分浏览器兼容性问题。
    *   增加加载状态和错误提示。

### C. 体验与工程优化
*   **统一 UI**: 
    *   修复了 `PromptsList` 等页面的宽度不一致问题 (统一为 `max-w-[1600px]`)。
    *   封装并应用了全局 `BackButton` 组件。
*   **后端稳定性**:
    *   修复了 SDK 调用中的编译错误。
    *   增加了详细的日志记录，便于排查 API 调用问题。

---

## 2. 后续规划 (Future Roadmap)

为了将 Prompt Genie 打造成更专业的 AIGC 提示词工程平台，建议后续按以下阶段推进：

### Phase 1: 参数精细化控制 (Parameter Control)
目前视频生成使用了“智能默认值”，用户无法自定义。
*   **功能**: 在 Playground 侧边栏增加参数配置面板。
*   **内容**:
    *   **视频**: 分辨率 (720P/1080P/480P)、时长 (5s/10s)、Seed、水印开关。
    *   **图片**: 分辨率、生成数量 (n)、风格选择。
    *   **文本**: Temperature, Top_P, Max Tokens。

### Phase 2: 多模态工作流 (Multi-Modal Chains)
目前的 Prompt Chain 主要针对文本。
*   **目标**: 实现“文本 -> 画面 -> 视频”的自动化工作流。
*   **场景**: **AI 故事绘本/短片生成**。
    *   Step 1 (Text): 输入故事大纲，由 LLM 生成分镜脚本 (Prompts)。
    *   Step 2 (Image): 自动将分镜 Prompt 传给 Wanx 生成关键帧。
    *   Step 3 (Video): (可选) 将关键帧转为视频 (图生视频)。

### Phase 3: 历史记录与回溯 (History & Persistence)
*   **现状**: Playground 刷新后结果丢失。
*   **改进**:
    *   增加 `PlaygroundHistory` 表，记录每次运行的 Prompt、参数、模型和结果 (文本/S3链接)。
    *   支持从历史记录“一键复用”参数。

### Phase 4: 成本估算与管理 (Cost Management)
*   **状态**: ✅ 已完成
*   **功能**: 
    *   在点击“运行”前，根据所选模型和参数，预估本次调用的 Token/积分消耗 (Frontend)。
    *   后台记录每次运行的 input/output tokens 和计算出的成本 (Backend)。
    *   Playground 增加“Usage”按钮，展示总开销和用量统计 (Dashboard)。

### Phase 5: 知识库与 RAG (Knowledge Base)
*   **状态**: ✅ MVP 已完成
*   **功能**: 
    *   **知识库管理**: 新增 `/knowledge` 页面，支持创建知识库、上传文档 (TXT/MD/JSON/CSV)。
    *   **后端存储**: 文档内容直接存入数据库，通过 ID 关联。
    *   **Playground 集成**: 在 Playground 左侧新增 "Knowledge Base" 下拉框。
    *   **生成增强**: 选中知识库后，系统会自动提取该库下的所有文档内容，追加到 Prompt 的上下文中，利用大模型的长文本能力进行生成。
