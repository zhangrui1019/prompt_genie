-- Initial System User (if not exists)
INSERT IGNORE INTO users (id, email, password_hash, name, plan, created_at)
VALUES (1, 'system@promptgenie.com', 'SYSTEM_HASH', 'Prompt Genie System', 'pro', NOW());

-- 1. Code Review Expert
INSERT IGNORE INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1001, 
    1, 
    'Code Review Expert', 
    'You are a senior software engineer. Please review the following {{language}} code.\n\nCode:\n```\n{{code}}\n```\n\nPlease analyze it for:\n1. Potential bugs and edge cases\n2. Performance improvements\n3. Code style and readability (adhering to standard conventions)\n4. Security vulnerabilities\n\nProvide specific refactoring suggestions with code examples.', 
    '{"language": "Java", "code": "public void test() { ... }"}', 
    TRUE, 
    128, 
    543, 
    NOW()
);

-- 2. Professional Translator
INSERT IGNORE INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1002, 
    1, 
    'Professional Translator', 
    'Translate the following text from {{source_lang}} to {{target_lang}}.\n\nContext/Tone: {{tone}}\n\nText:\n"""\n{{text}}\n"""\n\nEnsure the translation is natural, accurate, and culturally appropriate.', 
    '{"source_lang": "English", "target_lang": "Chinese", "tone": "Professional/Formal", "text": "Hello world"}', 
    TRUE, 
    342, 
    1205, 
    NOW()
);

-- 3. Marketing Copy Generator
INSERT IGNORE INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1003, 
    1, 
    'Marketing Copy Generator', 
    'Create a compelling marketing copy for {{product_name}}.\n\nTarget Audience: {{audience}}\nKey Features: {{features}}\nPlatform: {{platform}} (e.g., Instagram, LinkedIn, Email)\n\nGoal: {{goal}}', 
    '{"product_name": "EcoBottle", "audience": "Environmentally conscious millennials", "features": "Reusable, plastic-free, keeps water cold for 24h", "platform": "Instagram", "goal": "Drive sales"}', 
    TRUE, 
    89, 
    320, 
    NOW()
);

-- 4. SQL Query Builder
INSERT IGNORE INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1004, 
    1, 
    'SQL Query Builder', 
    'I have a database with the following schema:\n\n{{schema}}\n\nPlease write a SQL query to {{requirement}}.\n\nEnsure the query is optimized and uses standard SQL syntax.', 
    '{"schema": "Table users (id, name, email); Table orders (id, user_id, amount, date)", "requirement": "Find top 5 users by total spending in the last month"}', 
    TRUE, 
    156, 
    670, 
    NOW()
);

-- 5. Email Drafter (Fixed JSON escaping)
INSERT IGNORE INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1005, 
    1, 
    'Professional Email Drafter', 
    'Draft a professional email to {{recipient}} regarding {{subject}}.\n\nKey Points to Include:\n{{key_points}}\n\nTone: {{tone}}', 
    '{"recipient": "Hiring Manager", "subject": "Application for Senior Dev Role", "key_points": "- 5 years experience\\n- Led team of 10\\n- Available immediately", "tone": "Polite and confident"}', 
    TRUE, 
    210, 
    890, 
    NOW()
);

-- 6. Git Commit Message Generator
INSERT IGNORE INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1006, 
    1, 
    'Git Commit Message Generator', 
    'Generate a conventional git commit message for the following changes:\n\n{{changes}}\n\nFormat: <type>(<scope>): <subject>\n\n<body (optional)>\n\n<footer>(optional)', 
    '{"changes": "Fixed a bug in login page where error message was not showing. Added unit test."}', 
    TRUE, 
    450, 
    2300, 
    NOW()
);

-- 7. 小红书爆款文案生成器 (Chinese)
INSERT IGNORE INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1007, 
    1, 
    '小红书爆款文案生成器', 
    '你是一位小红书资深运营专家。请为主题“{{topic}}”写一篇吸引人的小红书笔记。\n\n产品/内容亮点：\n{{highlights}}\n\n要求：\n1. 标题要足够吸引眼球，使用emoji，包含数字或悬念。\n2. 正文采用“总分总”结构，多用短句，语气活泼亲切（集美们、绝绝子等）。\n3. 适当添加emoji表情。\n4. 结尾包含互动引导和相关话题标签（#）。', 
    '{"topic": "春季显瘦穿搭", "highlights": "收腰设计、面料透气、百搭不挑人"}', 
    TRUE, 
    520, 
    1500, 
    NOW()
);

-- 8. 周报生成器 (Chinese)
INSERT IGNORE INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1008, 
    1, 
    '职场周报生成器', 
    '请根据以下工作内容生成一份专业的周报。\n\n本周工作重点：\n{{work_content}}\n\n下周计划：\n{{next_plan}}\n\n遇到的问题与风险：\n{{issues}}\n\n要求：\n1. 语言简练专业，逻辑清晰。\n2. 使用结构化格式（如项目进度、成果展示、问题分析）。\n3. 突出量化成果。', 
    '{"work_content": "完成了用户登录模块开发；修复了首页加载慢的bug", "next_plan": "开始支付模块对接", "issues": "第三方API文档不完整，需要沟通"}', 
    TRUE, 
    410, 
    880, 
    NOW()
);

-- 9. 英语口语陪练 (Chinese/English)
INSERT IGNORE INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1009, 
    1, 
    '英语口语陪练 (English Tutor)', 
    '我想练习英语口语，话题是“{{topic}}”。\n请你扮演我的英语老师，与我进行对话。\n\n要求：\n1. 每次只回复一句话，并提出一个相关问题引导我回答。\n2. 如果我出现语法错误，请指出并给出正确表达，然后再继续对话。\n3. 保持对话轻松自然。', 
    '{"topic": "Travel Plans"}', 
    TRUE, 
    330, 
    600, 
    NOW()
);

-- 10. 代码解释器 (Chinese)
INSERT IGNORE INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1010, 
    1, 
    '代码解释器 (Code Explainer)', 
    '请向一名初学者解释以下 {{language}} 代码的功能和原理。\n\n代码：\n```\n{{code}}\n```\n\n要求：\n1. 使用通俗易懂的语言，避免过于专业的术语。\n2. 逐行或逐块解释代码逻辑。\n3. 举例说明该代码的应用场景。', 
    '{"language": "Python", "code": "def fib(n):\\n  if n <= 1: return n\\n  return fib(n-1) + fib(n-2)"}', 
    TRUE, 
    280, 
    450, 
    NOW()
);

-- Tags for Prompts
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1001, 1001, 'Coding', 'blue');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1002, 1001, 'Review', 'purple');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1003, 1002, 'Writing', 'green');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1004, 1002, 'Translation', 'orange');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1005, 1003, 'Marketing', 'pink');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1006, 1003, 'Social Media', 'red');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1007, 1004, 'Coding', 'blue');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1008, 1004, 'SQL', 'cyan');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1009, 1005, 'Business', 'gray');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1010, 1005, 'Email', 'yellow');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1011, 1006, 'Coding', 'blue');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1012, 1006, 'Git', 'black');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1013, 1007, '文案', 'pink');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1014, 1007, '社媒', 'red');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1015, 1008, '职场', 'blue');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1016, 1008, '写作', 'green');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1017, 1009, '教育', 'purple');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1018, 1009, '英语', 'orange');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1019, 1010, '编程', 'blue');
INSERT IGNORE INTO tags (id, prompt_id, name, color) VALUES (1020, 1010, '教学', 'cyan');
