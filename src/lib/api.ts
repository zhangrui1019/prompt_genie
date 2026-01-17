import axios from 'axios';
import { Prompt, CreatePromptDto, UpdatePromptDto, PromptVersion, User, PromptChain } from '@/types';

const api = axios.create({
  baseURL: '/api', // Proxy will handle this or full URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional, for handling 401s globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const promptService = {
  getAll: async (userId?: string, search?: string, tag?: string) => {
    const params: Record<string, any> = {};
    if (userId) params.userId = userId;
    if (search) params.search = search;
    if (tag) params.tag = tag;
    
    const response = await api.get<Prompt[]>('/prompts', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Prompt>(`/prompts/${id}`);
    return response.data;
  },

  create: async (data: CreatePromptDto) => {
    const response = await api.post<Prompt>('/prompts', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePromptDto) => {
    const response = await api.put<Prompt>(`/prompts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/prompts/${id}`);
  },

  getTags: async (userId: string) => {
    const response = await api.get<string[]>('/prompts/tags', { params: { userId } });
    return response.data;
  },

  getPublic: async (search?: string, userId?: string) => {
    const response = await api.get<Prompt[]>('/prompts/public', { params: { search, userId } });
    return response.data;
  },

  like: async (promptId: string, userId: string) => {
    const response = await api.post<{ liked: boolean }>(`/prompts/${promptId}/like`, null, { params: { userId } });
    return response.data;
  },

  incrementUsage: async (promptId: string) => {
    await api.post(`/prompts/${promptId}/use`);
  },

  fork: async (promptId: string, userId: string) => {
    const response = await api.post<Prompt>(`/prompts/${promptId}/fork`, null, { params: { userId } });
    return response.data;
  },

  upgradeUser: async (userId: string) => {
    const response = await api.post<User>(`/users/${userId}/upgrade`);
    return response.data;
  },

  // Chains
  getChains: async (userId: string) => {
    const response = await api.get<PromptChain[]>('/chains', { params: { userId } });
    return response.data;
  },

  getChain: async (id: string) => {
    const response = await api.get<PromptChain>(`/chains/${id}`);
    return response.data;
  },

  createChain: async (chain: Partial<PromptChain>) => {
    const response = await api.post<PromptChain>('/chains', chain);
    return response.data;
  },

  updateChain: async (id: string, chain: Partial<PromptChain>) => {
    const response = await api.put<PromptChain>(`/chains/${id}`, chain);
    return response.data;
  },

  deleteChain: async (id: string) => {
    await api.delete(`/chains/${id}`);
  },

  runChain: async (id: string, variables: Record<string, any>) => {
    const response = await api.post<any[]>(`/chains/${id}/run`, variables);
    return response.data;
  },

  getVersions: async (promptId: string) => {
    const response = await api.get<PromptVersion[]>(`/prompts/${promptId}/versions`);
    return response.data;
  },

  createVersion: async (promptId: string, note: string) => {
    const response = await api.post<PromptVersion>(`/prompts/${promptId}/versions`, { note });
    return response.data;
  },

  restoreVersion: async (promptId: string, versionId: string) => {
    const response = await api.post<Prompt>(`/prompts/${promptId}/restore/${versionId}`);
    return response.data;
  },

  runPlayground: async (prompt: string, variables: Record<string, any>, modelType?: string, modelName?: string, parameters?: Record<string, any>) => {
    const response = await api.post<{ result: string }>('/playground/run', { prompt, variables, modelType, modelName, parameters });
    return response.data;
  },

  getPlaygroundHistory: async () => {
    const response = await api.get<any[]>('/playground/history');
    return response.data;
  },

  getUsageStats: async () => {
    const response = await api.get<{
        total_cost: number;
        total_input_tokens: number;
        total_output_tokens: number;
        total_images: number;
        total_videos: number;
    }>('/playground/usage-stats');
    return response.data;
  },

  optimize: async (prompt: string, type: string) => {
    const response = await api.post<{ optimizedPrompt: string; suggestions: string[] }>('/optimize', { prompt, type });
    return response.data;
  },

  // Knowledge Base
  getKnowledgeBases: async () => {
    const response = await api.get<any[]>('/knowledge');
    return response.data;
  },

  createKnowledgeBase: async (name: string, description: string) => {
    const response = await api.post<any>('/knowledge', { name, description });
    return response.data;
  },

  deleteKnowledgeBase: async (id: string) => {
    await api.delete(`/knowledge/${id}`);
  },

  getDocuments: async (kbId: string) => {
    const response = await api.get<any[]>(`/knowledge/${kbId}/documents`);
    return response.data;
  },

  uploadDocument: async (kbId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<any>(`/knowledge/${kbId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteDocument: async (docId: string) => {
    await api.delete(`/knowledge/documents/${docId}`);
  }
};

export default api;
