import { ChainStep } from '@/types';

export interface ChainTemplate {
  id: string;
  title: string;
  description: string;
  steps: ChainStep[];
  icon: string;
  variables?: Record<string, string>;
}

export const CHAIN_TEMPLATES: ChainTemplate[] = [
  {
    id: 'xiaohongshu-flow',
    title: '小红书爆款生成流 (Xiaohongshu Generator)',
    description: '自动生成吸引人的小红书文案，并根据文案内容自动生成封面图。',
    icon: '📕',
    variables: {
      "topic": "旅行攻略",
      "style": "活泼"
    },
    steps: [
      {
        stepOrder: 0,
        promptId: '',
        targetVariable: 'copywriting',
        modelType: 'text',
        modelName: 'qwen-turbo',
        parameters: JSON.stringify({ temperature: 0.9, top_p: 0.9 }),
      },
      {
        stepOrder: 1,
        promptId: '', 
        targetVariable: 'image_prompt',
        modelType: 'text',
        modelName: 'qwen-turbo',
        parameters: JSON.stringify({ temperature: 0.7, top_p: 0.8 }),
      },
      {
        stepOrder: 2,
        promptId: '', 
        targetVariable: 'cover_image',
        modelType: 'image',
        modelName: 'wanx-v1',
        parameters: JSON.stringify({ size: '1024*1024', n: 1 }),
      }
    ]
  },
  {
    id: 'video-story',
    title: '短视频故事生成 (Video Storyteller)',
    description: '从一个简短的想法生成完整的故事脚本，然后生成视频。',
    icon: '🎬',
    variables: {
      "idea": "一只会飞的猫"
    },
    steps: [
      {
        stepOrder: 0,
        promptId: '',
        targetVariable: 'story_script',
        modelType: 'text',
        modelName: 'qwen-max',
        parameters: JSON.stringify({ temperature: 1.0, top_p: 0.9 }),
      },
      {
        stepOrder: 1,
        promptId: '',
        targetVariable: 'video_content',
        modelType: 'video',
        modelName: 'wan2.6-t2v',
        parameters: JSON.stringify({ size: '1280*720', duration: 5, prompt_extend: true }),
      }
    ]
  },
  {
    id: 'translation-summary',
    title: '多语言摘要 (Polyglot Summary)',
    description: '将输入文本翻译成目标语言，然后生成摘要。',
    icon: '🌍',
    variables: {
      "text": "Paste text here...",
      "target_lang": "French"
    },
    steps: [
      {
        stepOrder: 0,
        promptId: '',
        targetVariable: 'translated_text',
        modelType: 'text',
        modelName: 'qwen-turbo',
        parameters: JSON.stringify({ temperature: 0.2, top_p: 0.1 }),
      },
      {
        stepOrder: 1,
        promptId: '',
        targetVariable: 'summary',
        modelType: 'text',
        modelName: 'qwen-plus',
        parameters: JSON.stringify({ temperature: 0.5, top_p: 0.5 }),
      }
    ]
  },
  {
    id: 'content-marketing',
    title: '内容营销生成器 (Content Marketing Generator)',
    description: '生成博客文章、社交媒体帖子和电子邮件营销内容。',
    icon: '📝',
    variables: {
      "product": "智能手表",
      "target_audience": "年轻专业人士",
      "key_benefits": "健康监测、长续航、时尚设计"
    },
    steps: [
      {
        stepOrder: 0,
        promptId: '',
        targetVariable: 'blog_post',
        modelType: 'text',
        modelName: 'qwen-max',
        parameters: JSON.stringify({ temperature: 0.8, top_p: 0.8 }),
      },
      {
        stepOrder: 1,
        promptId: '',
        targetVariable: 'social_post',
        modelType: 'text',
        modelName: 'qwen-turbo',
        parameters: JSON.stringify({ temperature: 0.9, top_p: 0.9 }),
      },
      {
        stepOrder: 2,
        promptId: '',
        targetVariable: 'email_campaign',
        modelType: 'text',
        modelName: 'qwen-plus',
        parameters: JSON.stringify({ temperature: 0.7, top_p: 0.8 }),
      }
    ]
  },
  {
    id: 'product-launch',
    title: '产品发布流程 (Product Launch Workflow)',
    description: '为新产品发布生成宣传材料，包括新闻稿、社交媒体内容和产品描述。',
    icon: '🚀',
    variables: {
      "product_name": "AI Assistant Pro",
      "launch_date": "2024-12-01",
      "key_features": "语音识别、智能推荐、多语言支持"
    },
    steps: [
      {
        stepOrder: 0,
        promptId: '',
        targetVariable: 'press_release',
        modelType: 'text',
        modelName: 'qwen-max',
        parameters: JSON.stringify({ temperature: 0.6, top_p: 0.7 }),
      },
      {
        stepOrder: 1,
        promptId: '',
        targetVariable: 'social_content',
        modelType: 'text',
        modelName: 'qwen-turbo',
        parameters: JSON.stringify({ temperature: 0.9, top_p: 0.9 }),
      },
      {
        stepOrder: 2,
        promptId: '',
        targetVariable: 'product_description',
        modelType: 'text',
        modelName: 'qwen-plus',
        parameters: JSON.stringify({ temperature: 0.5, top_p: 0.6 }),
      }
    ]
  },
  {
    id: 'creative-writing',
    title: '创意写作助手 (Creative Writing Assistant)',
    description: '从一个简单的想法生成小说大纲、角色描述和章节内容。',
    icon: '📚',
    variables: {
      "genre": "科幻",
      "main_character": "科学家",
      "setting": "未来城市"
    },
    steps: [
      {
        stepOrder: 0,
        promptId: '',
        targetVariable: 'story_outline',
        modelType: 'text',
        modelName: 'qwen-max',
        parameters: JSON.stringify({ temperature: 1.0, top_p: 0.95 }),
      },
      {
        stepOrder: 1,
        promptId: '',
        targetVariable: 'character_description',
        modelType: 'text',
        modelName: 'qwen-turbo',
        parameters: JSON.stringify({ temperature: 0.9, top_p: 0.9 }),
      },
      {
        stepOrder: 2,
        promptId: '',
        targetVariable: 'chapter_content',
        modelType: 'text',
        modelName: 'qwen-plus',
        parameters: JSON.stringify({ temperature: 0.8, top_p: 0.8 }),
      }
    ]
  }
];
