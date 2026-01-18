import axios from 'axios';
import { Prompt, CreatePromptDto, UpdatePromptDto, PromptVersion, User, PromptChain } from '@/types';
import toast from 'react-hot-toast';

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
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    if (error.response && error.response.status === 401) {
      // Clear token and user data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/';
        toast.error('Session expired. Please login again.');
      }
    } else {
        // Show toast for other errors, avoiding duplicate toasts if possible?
        // For now, just show it.
        toast.error(message);
    }
    return Promise.reject(error);
  }
);

export const promptService = {
  getAll: async (search?: string, tag?: string) => {
    const params: Record<string, any> = {};
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
    // Remove userId if it was accidentally passed in data, backend handles it
    const { userId, ...rest } = data as any; 
    const response = await api.post<Prompt>('/prompts', rest);
    return response.data;
  },

  update: async (id: string, data: UpdatePromptDto) => {
    const response = await api.put<Prompt>(`/prompts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/prompts/${id}`);
  },

  getTags: async () => {
    const response = await api.get<string[]>('/prompts/tags');
    return response.data;
  },

  getPublic: async (search?: string) => {
    const response = await api.get<Prompt[]>('/prompts/public', { params: { search } });
    return response.data;
  },

  like: async (promptId: string) => {
    const response = await api.post<{ liked: boolean }>(`/prompts/${promptId}/like`);
    return response.data;
  },

  incrementUsage: async (promptId: string) => {
    await api.post(`/prompts/${promptId}/use`);
  },

  fork: async (promptId: string) => {
    const response = await api.post<Prompt>(`/prompts/${promptId}/fork`);
    return response.data;
  },

  upgradeUser: async (userId: string) => {
    const response = await api.post<User>(`/users/${userId}/upgrade`);
    return response.data;
  },

  // Chains
  getChains: async () => {
    const response = await api.get<PromptChain[]>('/chains');
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

  // Comments
  getComments: async (promptId: string) => {
    const response = await api.get<any[]>(`/prompts/${promptId}/comments`);
    return response.data;
  },

  addComment: async (promptId: string, content: string) => {
    const response = await api.post<any>(`/prompts/${promptId}/comments`, { content });
    return response.data;
  },

  getVersions: async (promptId: string) => {
    const response = await api.get<PromptVersion[]>(`/prompts/${promptId}/versions`);
    return response.data;
  },

  // Users
  getPublicProfile: async (userId: string) => {
    const response = await api.get<{ id: string; name: string; plan: string; createdAt: string }>(`/users/${userId}/profile`);
    return response.data;
  },

  getUserPublicPrompts: async (userId: string) => {
    const response = await api.get<Prompt[]>(`/prompts/user/${userId}/public`);
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
  },

  // Evaluations
  createEvaluation: async (
    name: string, 
    promptId: string, 
    file: File, 
    modelConfigs: any[], 
    evaluationDimensions: string[]
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('promptId', promptId);
    formData.append('modelConfigs', JSON.stringify(modelConfigs));
    formData.append('evaluationDimensions', JSON.stringify(evaluationDimensions));
    
    const response = await api.post<any>('/evaluations/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getEvaluations: async () => {
    const response = await api.get<any[]>('/evaluations/my');
    return response.data;
  },

  getEvaluation: async (id: string) => {
    const response = await api.get<any>(`/evaluations/${id}`);
    return response.data;
  },

  getEvaluationResults: async (id: string) => {
    const response = await api.get<any[]>(`/evaluations/${id}/results`);
    return response.data;
  }
};

export default api;
