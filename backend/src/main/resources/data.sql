-- Initial System User (if not exists)
INSERT INTO users (id, email, password_hash, name, plan, created_at)
VALUES (1, 'system@promptgenie.com', '$2a$10$AHxDeC4aCTAmncs6UYY4s.BP1UzOxbeddoZxkaJZGi5g9jXCmtpF2', 'Prompt Genie System', 'pro', NOW())
;

-- 1. Code Review Expert
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
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
) ;

-- 2. Professional Translator
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
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
) ;

-- 3. Marketing Copy Generator
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
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
) ;

-- 4. SQL Query Builder
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
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
) ;

-- 5. Email Drafter (Fixed JSON escaping)
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
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
) ;

-- 6. Git Commit Message Generator
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
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
) ;

-- 7. 小红书爆款文案生成器 (Chinese)
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
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
) ;

-- 8. 周报生成器 (Chinese)
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
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
) ;

-- 9. 英语口语陪练 (Chinese/English)
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
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
) ;

-- 10. 代码解释器 (Chinese)
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
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
) ;

-- 11. 中小学数学知识点讲透
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1101,
    1,
    '中小学数学知识点讲透（小红书笔记）',
    '你是一位中小学数学老师兼小红书高赞学习博主。请围绕“{{grade}} {{topic}}”写一篇适合小红书发布的学习笔记。\n\n学生基础：{{level}}\n要求：\n1) 先给出一句话结论（让人一眼看懂）\n2) 用直观类比解释核心概念\n3) 给出 {{examples}} 个典型例题：每题包含【题目】+【思路】+【步骤】+【答案】\n4) 总结 3 个高频易错点（每点配一句提醒）\n5) 出 3 道练习题（不写答案）\n6) 结尾包含互动引导 + 10 个相关话题标签（#）\n7) 语言口语化、短句、多分段，适当 emoji，但不要夸大承诺（避免“必提分/保过”）',
    '{"grade":"五年级","topic":"分数乘法为什么要约分","level":"薄弱","examples":"2"}',
    TRUE,
    66,
    210,
    NOW()
) ;

-- 12. 语文阅读理解答题模板
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1102,
    1,
    '语文阅读理解答题模板（小红书笔记）',
    '你是一名小学语文老师兼小红书学习博主。请为“{{grade}}语文阅读理解：{{question_type}}”输出一篇可收藏的答题模板笔记。\n\n要求：\n1) 标题输出 10 条（含数字/痛点/收藏引导）\n2) 正文给出【答题公式/步骤（3-5步）】+【常用词库/句式】+【示例：提供一段短文本并示范作答】\n3) 给出 5 个练习方向（让家长/学生知道怎么练）\n4) 结尾互动引导 + 10 个话题标签（#）',
    '{"grade":"五年级","question_type":"人物形象题"}',
    TRUE,
    52,
    160,
    NOW()
) ;

-- 13. 英语语法卡片（收藏型）
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1103,
    1,
    '初中英语语法卡片（收藏型）',
    '你是一名初中英语老师。请把“{{grammar}}”做成一张可收藏的小红书语法卡片。\n\n要求：\n1) 标题 10 条（收藏引导）\n2) 规则总结（表格/清单都可）\n3) 给 {{examples}} 组【错句→改正】对照\n4) 3 个易错点\n5) 5 题小测（不写答案）\n6) 结尾互动引导 + 10 个话题标签（#）',
    '{"grammar":"一般现在时第三人称单数","examples":"6"}',
    TRUE,
    71,
    240,
    NOW()
) ;

-- 14. 学习路线图（7/30天打卡）
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1104,
    1,
    '学习路线图（7/30天打卡）',
    '你是一名学习规划师。请为“{{grade}} {{subject}}：{{goal}}”设计一份 {{days}} 天学习路线图，并写成可发布的小红书笔记。\n\n基础：{{level}}\n每天学习时长：{{minutes}} 分钟\n\n要求：\n1) 标题 10 条\n2) 路线图分阶段：目标→任务→材料→检查点\n3) 每日打卡文案（每条一句话）\n4) 结尾给出“如何坚持”的 3 个小技巧 + 互动引导 + 10 个话题标签（#）',
    '{"grade":"六年级","subject":"数学","goal":"期末提分","days":"7","level":"一般","minutes":"20"}',
    TRUE,
    88,
    310,
    NOW()
) ;

-- 15. 家长沟通脚本（作业拖延/错题不改）
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1105,
    1,
    '家长沟通脚本（不吼不崩）',
    '你是一名家庭教育顾问。请为“{{grade}}孩子：{{scenario}}”输出一份家长沟通脚本，风格：{{tone}}。\n\n要求：\n1) 标题 10 条\n2) 给 3 段可直接照着说的对话：开场共情→提出规则→确认执行\n3) 给 5 句“千万别说”的踩雷句\n4) 给 3 个可落地的小动作（今天就能做）\n5) 结尾互动引导 + 10 个话题标签（#）',
    '{"grade":"五年级","scenario":"作业拖延","tone":"温和但坚定"}',
    TRUE,
    95,
    280,
    NOW()
) ;

-- 16. 小红书封面图提示词生成器（教育版）
INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1106,
    1,
    '小红书封面图提示词生成器（教育类）',
    '你是小红书教育赛道的封面设计师。请根据标题“{{title}}”生成 3 套封面设计方案，每套包含：\n1) 版式描述（主标题/副标题/元素布局）\n2) 配色与字体建议\n3) 适合的关键词（适配小红书审美）\n4) 一段可用于 AI 生图的英文 prompt（包含风格、构图、光线、背景、文字留白提示；不要生成具体品牌 Logo）\n\n风格偏好：{{style}}',
    '{"title":"3分钟搞懂分数乘法！这3个坑千万别踩","style":"清新极简"}',
    TRUE,
    120,
    420,
    NOW()
) ;

-- Tags for Prompts
INSERT INTO tags (id, prompt_id, name, color) VALUES (1001, 1001, 'Coding', 'blue') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1002, 1001, 'Review', 'purple') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1003, 1002, 'Writing', 'green') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1004, 1002, 'Translation', 'orange') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1005, 1003, 'Marketing', 'pink') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1006, 1003, 'Social Media', 'red') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1007, 1004, 'Coding', 'blue') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1008, 1004, 'SQL', 'cyan') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1009, 1005, 'Business', 'gray') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1010, 1005, 'Email', 'yellow') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1011, 1006, 'Coding', 'blue') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1012, 1006, 'Git', 'black') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1013, 1007, '文案', 'pink') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1014, 1007, '社媒', 'red') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1015, 1008, '职场', 'blue') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1016, 1008, '写作', 'green') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1017, 1009, '教育', 'purple') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1018, 1009, '英语', 'orange') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1019, 1010, '编程', 'blue') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1020, 1010, '教学', 'cyan') ;

INSERT INTO tags (id, prompt_id, name, color) VALUES (1101, 1101, '教育', 'purple') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1102, 1101, '数学', 'blue') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1103, 1102, '教育', 'purple') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1104, 1102, '语文', 'orange') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1105, 1103, '教育', 'purple') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1106, 1103, '英语', 'green') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1107, 1104, '教育', 'purple') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1108, 1104, '规划', 'gray') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1109, 1105, '教育', 'purple') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1110, 1105, '家长', 'pink') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1111, 1106, 'AI生图', 'cyan') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1112, 1106, '封面', 'red') ;

INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1201,
    1,
    '旅游 2-3 天游玩路线（小红书笔记）',
    '你是一位旅游博主。请为“{{city}}”生成一份 {{days}} 天游玩路线，并写成可直接发布的小红书笔记。\n\n出行季节：{{season}}\n预算：{{budget}}\n同行人群：{{group}}\n风格：{{style}}\n\n要求：\n1) 标题 10 条（包含数字/悬念/收藏引导）\n2) 按天输出：上午/下午/晚上 + 点位 + 交通建议 + 预计花费（粗略即可）\n3) 给 10 条避坑清单（含吃住行）\n4) 给 10 个话题标签（#）\n5) 语气真实、口语化、短句多分段',
    '{"city":"成都","days":"2","season":"春季","budget":"1500元/人","group":"朋友","style":"松弛感"}',
    TRUE,
    120,
    380,
    NOW()
) ;

INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1202,
    1,
    '职场面试回答模板（STAR 高分）',
    '你是一位资深面试官。请根据岗位“{{role}}”和面试问题“{{question}}”给出 3 个高质量回答版本：\nA) 稳健专业\nB) 有亮点但不夸张\nC) 简洁有力\n\n要求：\n1) 每个回答使用 STAR 结构（情境/任务/行动/结果）\n2) 给出 3 个可量化指标示例（可替换）\n3) 给出 3 个高频追问及应对\n4) 最后给一句“适合小红书发布的面试干货总结”+ 10 个话题标签（#）',
    '{"role":"产品经理","question":"你如何推动跨部门项目按期交付？"}',
    TRUE,
    95,
    260,
    NOW()
) ;

INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1203,
    1,
    'AI 生图提示词生成器（通用）',
    '你是一位 AI 生图提示词专家。请把需求“{{idea}}”转成可用的提示词，并输出 3 套风格：\n1) 写实摄影\n2) 清新插画\n3) 杂志封面\n\n每套包含：\n- 中文说明（构图/主体/光线/色调/镜头感）\n- 英文 Prompt（可直接用于 OpenAI/DashScope 等兼容接口）\n- Negative Prompt（避免项）\n- 参数建议（比例/清晰度/风格强度，泛化描述即可）',
    '{"idea":"小学生开学季学习笔记封面，清新极简风，突出标题留白"}',
    TRUE,
    140,
    520,
    NOW()
) ;

INSERT INTO prompts (id, user_id, title, content, variables, is_public, likes_count, usage_count, created_at)
VALUES (
    1204,
    1,
    '电商产品卖点文案（详情页/小红书双版本）',
    '你是电商转化文案专家。请为产品“{{product}}”输出两套文案：\nA) 详情页卖点（结构化：核心卖点/场景/参数/对比/FAQ）\nB) 小红书种草笔记（标题 10 条 + 正文）\n\n目标人群：{{audience}}\n核心卖点：{{features}}\n价格区间：{{price}}\n禁用表达：{{banned}}\n\n要求：不夸大承诺，避免绝对化用语；多用具体场景与对比。',
    '{"product":"护脊书包","audience":"小学1-3年级家长","features":"轻量、分区收纳、背负减压、反光安全","price":"199-299","banned":"100%|必定|永久"}',
    TRUE,
    88,
    300,
    NOW()
) ;

INSERT INTO tags (id, prompt_id, name, color) VALUES (1201, 1201, '旅游', 'green') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1202, 1201, '路线', 'blue') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1203, 1202, '职场', 'blue') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1204, 1202, '面试', 'orange') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1205, 1203, 'AI生图', 'cyan') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1206, 1203, '提示词', 'purple') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1207, 1204, '电商', 'red') ;
INSERT INTO tags (id, prompt_id, name, color) VALUES (1208, 1204, '文案', 'pink') ;

UPDATE prompts SET category='开发', scene='工程', asset_type='专家', status='PUBLISHED', is_featured=true, featured_rank=3 WHERE id=1001;
UPDATE prompts SET category='内容创作', scene='通用', asset_type='工具', status='PUBLISHED' WHERE id=1002;
UPDATE prompts SET category='电商', scene='营销', asset_type='生成器', status='PUBLISHED' WHERE id=1003;
UPDATE prompts SET category='开发', scene='数据', asset_type='工具', status='PUBLISHED' WHERE id=1004;
UPDATE prompts SET category='职场', scene='沟通', asset_type='生成器', status='PUBLISHED' WHERE id=1005;
UPDATE prompts SET category='开发', scene='工程', asset_type='工具', status='PUBLISHED' WHERE id=1006;
UPDATE prompts SET category='教育', scene='小红书', asset_type='生成器', status='PUBLISHED', is_featured=true, featured_rank=1 WHERE id=1007;
UPDATE prompts SET category='职场', scene='写作', asset_type='生成器', status='PUBLISHED', is_featured=true, featured_rank=2 WHERE id=1008;
UPDATE prompts SET category='教育', scene='英语', asset_type='陪练', status='PUBLISHED' WHERE id=1009;
UPDATE prompts SET category='开发', scene='学习', asset_type='工具', status='PUBLISHED' WHERE id=1010;

UPDATE prompts SET category='教育', scene='小红书', asset_type='生成器', status='PUBLISHED', is_featured=true, featured_rank=4 WHERE id=1101;
UPDATE prompts SET category='教育', scene='小红书', asset_type='模板', status='PUBLISHED' WHERE id=1102;
UPDATE prompts SET category='教育', scene='小红书', asset_type='卡片', status='PUBLISHED' WHERE id=1103;
UPDATE prompts SET category='教育', scene='小红书', asset_type='路线', status='PUBLISHED' WHERE id=1104;
UPDATE prompts SET category='教育', scene='家长', asset_type='脚本', status='PUBLISHED' WHERE id=1105;
UPDATE prompts SET category='AI生图', scene='封面', asset_type='提示词', status='PUBLISHED' WHERE id=1106;

UPDATE prompts SET category='旅游', scene='小红书', asset_type='生成器', status='PUBLISHED' WHERE id=1201;
UPDATE prompts SET category='职场', scene='面试', asset_type='模板', status='PUBLISHED' WHERE id=1202;
UPDATE prompts SET category='AI生图', scene='提示词', asset_type='生成器', status='PUBLISHED', is_featured=true, featured_rank=5 WHERE id=1203;
UPDATE prompts SET category='电商', scene='小红书', asset_type='生成器', status='PUBLISHED' WHERE id=1204;
