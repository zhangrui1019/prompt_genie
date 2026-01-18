export interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  apiKey?: string;
  token?: string;
}

export interface Tag {  id?: string;
  name: string;
  color?: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  versionNumber: number;
  title: string;
  content: string;
  changeNote?: string;
  createdAt: string;
}

export interface Prompt {
  id: string;
  userId: string;
  title: string;
  content: string;
  variables: Record<string, any>;
  tags: Tag[];
  isPublic: boolean;
  likesCount?: number;
  usageCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChainStep {
  id?: string;
  chainId?: string;
  promptId: string;
  stepOrder?: number;
  targetVariable?: string;
  modelType?: string;
  modelName?: string;
  parameters?: string;
  inputMappings?: string; // JSON string e.g. '{"user_input": "{{summary}}"}'
  prompt?: Prompt;
}

export interface PromptChain {
  id: string;
  userId: string;
  title: string;
  description?: string;
  steps: ChainStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptDto {
  title: string;
  content: string;
  variables?: Record<string, any>;
  tags?: Tag[];
  isPublic?: boolean;
  userId?: string;
}

export interface UpdatePromptDto {
  title?: string;
  content?: string;
  variables?: Record<string, any>;
  tags?: Tag[];
  isPublic?: boolean;
}
