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
        promptId: '', // User needs to select or we provide a default system prompt text if we supported raw text
        targetVariable: 'copywriting',
        modelType: 'text',
        modelName: 'qwen-turbo',
        parameters: JSON.stringify({ temperature: 0.9, top_p: 0.9 }),
        // In a real scenario, we might want to pre-fill a prompt content, but currently our ChainStep links to promptId.
        // We can handle this by creating a prompt on the fly or just letting user select.
        // For this template, we'll assume the user has a "Xiaohongshu Writer" prompt or we just set up the structure.
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
  }
];
