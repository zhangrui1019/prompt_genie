-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    plan VARCHAR(20) DEFAULT 'free',
    api_key VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Prompts Table
CREATE TABLE IF NOT EXISTS prompts (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    variables JSON,
    is_public BOOLEAN DEFAULT FALSE,
    likes_count INT DEFAULT 0,
    usage_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Prompt Versions Table
CREATE TABLE IF NOT EXISTS prompt_versions (
    id BIGINT PRIMARY KEY,
    prompt_id BIGINT NOT NULL,
    version_number INT NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    change_note VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

-- Optimizations Table
CREATE TABLE IF NOT EXISTS optimizations (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    prompt_id BIGINT,
    model VARCHAR(50) NOT NULL,
    suggestions JSON,
    improvement_score DECIMAL(3,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    parameters JSON,
    FOREIGN KEY (chain_id) REFERENCES prompt_chains(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

-- Prompt Likes Table
CREATE TABLE IF NOT EXISTS prompt_likes (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    prompt_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_prompt (user_id, prompt_id)
);

-- Playground History Table
CREATE TABLE IF NOT EXISTS playground_history (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    prompt TEXT,
    variables JSON,
    model_type VARCHAR(20),
    model_name VARCHAR(50),
    parameters JSON,
    result TEXT,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Knowledge Bases Table
CREATE TABLE IF NOT EXISTS knowledge_bases (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT PRIMARY KEY,
    kb_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    content LONGTEXT,
    file_size BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kb_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
);
