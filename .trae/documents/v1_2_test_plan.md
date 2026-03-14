# Prompt Genie V1.2 测试计划 (Test Plan)

## 1. 测试范围
本测试计划覆盖 V1.2 版本引入的三个核心模块：
1.  **团队协作空间 (Team Workspace)**
2.  **多模态工作流画布 (Visual Canvas)**
3.  **社区互动 (Community 2.0)**

## 2. 测试环境
- **前端**：Chrome 浏览器 (最新版)
- **后端**：Localhost (SpringBoot)
- **数据库**：PostgreSQL (Docker)
- **Redis**：Docker

## 3. 测试用例 (Test Cases)

### 3.1 模块一：团队协作空间 (Workspace)

| ID | 场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WS-01** | **创建工作区** | 用户已登录 | 1. 点击顶部下拉菜单<br>2. 选择 "Create Workspace"<br>3. 输入名称 "Marketing Team"<br>4. 点击确认 | 1. 列表自动刷新并切换到新工作区<br>2. 左上角显示 "Marketing Team" | P0 |
| **WS-02** | **邀请成员 (Editor)** | 用户是 Owner | 1. 进入 "Manage Members"<br>2. 输入成员邮箱 (test@example.com)<br>3. 选择角色 "Editor"<br>4. 点击 Invite | 1. 列表显示新成员<br>2. 角色显示为 Editor | P0 |
| **WS-03** | **权限隔离 (Viewer)** | 成员 B 是 Viewer | 1. 成员 B 登录<br>2. 进入 Prompt 列表<br>3. 尝试点击 "Edit" 或 "Delete" | 1. 按钮置灰或点击报错 "Permission Denied"<br>2. 只能查看内容 | P1 |
| **WS-04** | **移动 Prompt 到团队** | 个人空间有 Prompt A | 1. 在个人空间点击 Prompt A 卡片上的 "Move"<br>2. 选择目标工作区 "Marketing Team"<br>3. 确认 | 1. 个人空间不再显示 Prompt A<br>2. 切换到 "Marketing Team" 后能看到 Prompt A | P0 |
| **WS-05** | **跨团队访问控制** | 用户 C 未加入团队 | 1. 用户 C 尝试通过 URL 直接访问团队 Prompt ID (`/prompts/123`) | 1. 页面显示 403 Forbidden 或跳转回首页 | P1 |

### 3.2 模块二：多模态工作流画布 (Visual Canvas)

| ID | 场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **VC-01** | **创建画布流** | 进入 Chain 列表 | 1. 点击 "New Chain"<br>2. 点击右上角 "Canvas View"<br>3. 拖入 Prompt Node, LLM Node, Output Node | 1. 画布上正确显示 3 个节点<br>2. 节点可以被拖拽移动 | P0 |
| **VC-02** | **节点连线** | 画布上有节点 | 1. 从 Prompt Node 输出端口拖拽连线到 LLM Node 输入端口 | 1. 连线成功建立<br>2. 线条显示动画效果 | P0 |
| **VC-03** | **配置节点参数** | 选中 LLM Node | 1. 点击 LLM Node<br>2. 右侧面板修改 Model 为 "GPT-4"<br>3. 修改 Temperature 为 0.9 | 1. 面板数值更新<br>2. 再次点击节点确认数值已保存 | P1 |
| **VC-04** | **保存并加载** | 画布已编辑 | 1. 点击顶部 "Save"<br>2. 刷新页面或重新进入 | 1. 提示 "Saved Successfully"<br>2. 重新进入后，节点位置和连线与保存时一致 | P0 |
| **VC-05** | **DAG 并行执行** | 画布配置了并行分支 | 1. 配置 Prompt A -> LLM A<br>2. 配置 Prompt B -> LLM B<br>3. 两者汇聚到 Output<br>4. 点击 "Run" | 1. 后端日志显示 LLM A 和 LLM B 是并行启动的 (时间戳接近)<br>2. Output 节点能收到两者的结果 | P1 |

### 3.3 模块三：社区互动 (Community)

| ID | 场景 | 前置条件 | 操作步骤 | 预期结果 | 优先级 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **COM-01** | **浏览社区** | 数据库有 isPublic=true 的数据 | 1. 进入 Community 页面 | 1. 能看到所有公开 Prompt 卡片<br>2. 显示作者名、点赞数 | P0 |
| **COM-02** | **发表评论** | 选中一个 Prompt | 1. 点击 "Comments" 图标<br>2. 输入 "Great prompt!"<br>3. 点击 Post | 1. 列表立即显示新评论<br>2. 显示当前用户名和时间 | P1 |
| **COM-03** | **Fork 到个人空间** | 选中一个 Prompt | 1. 点击 "Fork"<br>2. 选择 "Personal Workspace"<br>3. 确认 | 1. 提示 "Forked Successfully"<br>2. 个人空间出现副本，标题带 "(Forked)" 后缀 | P0 |
| **COM-04** | **Fork 到团队空间** | 用户是团队 Editor | 1. 点击 "Fork"<br>2. 选择 "Marketing Team"<br>3. 确认 | 1. 团队空间出现副本<br>2. 团队其他成员可见 | P1 |

## 4. 验收标准
1.  **P0 用例通过率**：100%
2.  **P1 用例通过率**：≥ 90%
3.  **无 Crash 级 Bug**：前端页面无白屏，后端无 500 错误。
