-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    plan VARCHAR(20) DEFAULT 'free',
    api_key VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Workspace Members Table
CREATE TABLE IF NOT EXISTS workspace_members (
    id BIGINT PRIMARY KEY,
    workspace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer', -- owner, editor, viewer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (workspace_id, user_id)
);

-- Prompts Table
CREATE TABLE IF NOT EXISTS prompts (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    workspace_id BIGINT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    variables JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    likes_count INT DEFAULT 0,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL
);

-- Prompt Versions Table
CREATE TABLE IF NOT EXISTS prompt_versions (
    id BIGINT PRIMARY KEY,
    prompt_id BIGINT NOT NULL,
    version_number INT NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    change_note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

-- Optimizations Table
CREATE TABLE IF NOT EXISTS optimizations (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    prompt_id BIGINT,
    model VARCHAR(50) NOT NULL,
    suggestions JSONB,
    improvement_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE SET NULL
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id BIGINT PRIMARY KEY,
    prompt_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20),
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

-- Prompt Chains Table
CREATE TABLE IF NOT EXISTS prompt_chains (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    workspace_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    react_flow_nodes JSONB,
    react_flow_edges JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL
);

-- Chain Steps Table
CREATE TABLE IF NOT EXISTS chain_steps (
    id BIGINT PRIMARY KEY,
    chain_id BIGINT NOT NULL,
    prompt_id BIGINT NOT NULL,
    step_order INT NOT NULL,
    target_variable VARCHAR(100),
    model_type VARCHAR(20) DEFAULT 'text',
    model_name VARCHAR(50),
    parameters JSONB,
    input_mappings JSONB,
    FOREIGN KEY (chain_id) REFERENCES prompt_chains(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

-- Prompt Likes Table
CREATE TABLE IF NOT EXISTS prompt_likes (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    prompt_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
    UNIQUE (user_id, prompt_id)
);

-- Playground History Table
CREATE TABLE IF NOT EXISTS playground_history (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    prompt TEXT,
    variables JSONB,
    model_type VARCHAR(20),
    model_name VARCHAR(50),
    parameters JSONB,
    result TEXT,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Knowledge Bases Table
CREATE TABLE IF NOT EXISTS knowledge_bases (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    workspace_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT PRIMARY KEY,
    kb_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    content TEXT,
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kb_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    prompt_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

-- Evaluation Jobs Table
CREATE TABLE IF NOT EXISTS evaluation_jobs (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    prompt_id BIGINT,
    name VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- PENDING, RUNNING, COMPLETED, FAILED
    dataset_path VARCHAR(512),
    model_configs JSONB,
    evaluation_dimensions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_eval_user_id ON evaluation_jobs(user_id);

-- Evaluation Results Table
CREATE TABLE IF NOT EXISTS evaluation_results (
    id BIGINT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    input_data JSONB,
    model_outputs JSONB,
    scores JSONB,
    latency BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES evaluation_jobs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eval_job_id ON evaluation_results(job_id);
