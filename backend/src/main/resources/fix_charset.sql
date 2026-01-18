-- Use this script to fix character encoding issues in an existing database.
-- Run these commands in your MySQL client (e.g., Workbench, DBeaver, or CLI).

-- 1. Modify the database default character set (optional but recommended)
ALTER DATABASE prompt_genie CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 2. Convert all tables to utf8mb4
-- Note: This will update both the table definition and the column definitions.
-- WARNING: This attempts to convert existing data. If data is already corrupted (displayed as ???), this won't fix the content, only the container.

ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE prompts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE prompt_versions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE optimizations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE tags CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE prompt_chains CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE chain_steps CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE prompt_likes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE playground_history CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE knowledge_bases CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE documents CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE comments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- After running this, please create a new prompt with Chinese characters to verify the fix.
-- Existing corrupted data might need to be manually updated or re-created.
