# Prompt Genie

Prompt Genie 是一款专为内容创作者打造的可视化 AI 工作台。

## 程序启动说明

### 前置要求
- Node.js (v18+)
- Java (v17+)
- Maven (v3.8+)
- PostgreSQL（需要创建 `prompt_genie` 数据库，运行在 `localhost:5432`）

### 必要环境变量（本地/生产均建议通过环境变量配置）
后端依赖如下环境变量（至少需要数据库与 JWT）：
- `DB_URL`（示例：`jdbc:postgresql://localhost:5432/prompt_genie`）
- `DB_USERNAME`（示例：`postgres`）
- `DB_PASSWORD`（示例：`your_password`）
- `JWT_SECRET`（建议使用 Base64 字符串；生产用随机生成）

可选（使用模型能力时需要）：
- `DASHSCOPE_API_KEY`

### 1. 启动后端 (Spring Boot)
后端代码位于 `backend` 目录下。

```bash
# 切换到后端目录
cd backend

# 使用 Maven 启动后端服务
mvn spring-boot:run
```
后端服务将运行在 `http://localhost:8080`

如果你想用本地默认配置快速启动（无需手动设置 DB/JWT 环境变量），可以使用 dev profile：
```bash
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

### 一键启动（推荐，Docker Compose）
如果你希望一键拉起前后端 + PostgreSQL（内置默认账号），在项目根目录运行：
```bash
docker compose up -d --build
```
前端：`http://localhost:3000`  
后端：`http://localhost:8080`  
PostgreSQL：`localhost:5432`（db: `prompt_genie`，user: `prompt_user`，password: `prompt_pass`）

### 2. 启动前端 (React + Vite)
前端代码位于根目录下。

```bash
# 在项目根目录下安装依赖 (如果尚未安装)
npm install

# 启动开发服务器
npm run dev
```
前端服务将运行在 `http://localhost:5173`

---

## 常见问题
- **Redis 连接报错**：已在 `backend/src/main/resources/application.yml` 中将 `spring.cache.type` 设置为 `simple` 以使用本地内存缓存，无需额外启动 Redis。
- **pgvector 报错**：已在配置中禁用了向量库的 schema 自动初始化。
