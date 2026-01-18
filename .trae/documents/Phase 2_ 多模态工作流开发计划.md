## Phase 2: 多模态工作流 (Multi-Modal Chains)

### 目标
实现从“文本 -> 画面 -> 视频”的自动化工作流，支持 AI 故事绘本/短片生成场景。

### 现状分析
- `ChainStep` 已经支持 `modelType` 和 `modelName`，并且有 `targetVariable` 用于传递上下文。
- `ChainService.executeChain` 已经通过调用 `playgroundService.runPrompt` 实现了多模态支持（因为 PlaygroundService 已经重构为支持多模态）。
- **缺失部分**: 前端 `ChainEditor` 界面目前可能只支持文本 Prompt 的选择和配置，缺乏针对 Image/Video 模型的参数配置 UI。

### 计划步骤

1.  **前端 ChainEditor 升级**:
    -   在步骤编辑卡片中，增加 `Model Type` 选择 (Text/Image/Video)。
    -   根据选择的 `Model Type`，动态展示相应的参数配置表单（复用 Playground 中的参数组件）。
        -   Image: Size, N
        -   Video: Size, Duration, Prompt Extend
    -   增加 `Model Name` 选择器。
2.  **后端验证**:
    -   确保 `ChainService` 正确透传参数给 `PlaygroundService`。
    -   (已确认代码逻辑，无需大改，只需测试集成)。
3.  **集成测试**:
    -   创建一个测试工作流：Story Generator -> Image Generator (Story Scene) -> Video Generator。
    -   验证变量传递是否正常（例如 Text 步骤输出的内容能否作为 Image 步骤的 Prompt 输入）。

### 重点
本次迭代主要集中在前端 `ChainEditor` 的交互升级，使其能够配置多模态步骤的特定参数。
