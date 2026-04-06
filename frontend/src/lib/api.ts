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
      // Don't clear token for login/register requests
      const isAuthRequest = error.config.url?.includes('/auth/');
      if (!isAuthRequest) {
        // Clear token and user data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/') {
          window.location.href = '/';
          toast.error('Session expired. Please login again.');
        }
      }
    } else {
        // Show toast for other errors, avoiding duplicate toasts if possible?
        // For now, just show it.
        toast.error(message);
    }
    return Promise.reject(error);
  }
);

type ModelOption = { id: string; name: string };
export type ModelCatalog = Record<string, ModelOption[]>;

const DEFAULT_MODEL_CATALOG: ModelCatalog = {
  text: [
    { id: 'qwen-turbo', name: 'Qwen Turbo' },
    { id: 'qwen-plus', name: 'Qwen Plus' },
    { id: 'qwen-max', name: 'Qwen Max' },
  ],
  image: [
    { id: 'wanx-v1', name: 'Wanx V1' },
    { id: 'wanx-sketch-to-image-v1', name: 'Wanx Sketch' },
  ],
  video: [
    { id: 'wan2.6-t2v', name: 'Wan 2.6 (1080P)' },
    { id: 'wanx2.1-t2v-turbo', name: 'Wanx 2.1 Turbo (720P)' },
    { id: 'wanx2.1-t2v-plus', name: 'Wanx 2.1 Plus (720P)' },
  ],
};

export const promptService = {
  getAll: async (search?: string, tag?: string, workspaceId?: string) => {
    const params: Record<string, any> = {};
    if (search) params.search = search;
    if (tag) params.tag = tag;
    if (workspaceId) params.workspaceId = workspaceId;
    
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

  move: async (id: string, workspaceId: string) => {
    await api.put(`/prompts/${id}/move`, { workspaceId });
  },

  getTags: async () => {
    const response = await api.get<string[]>('/prompts/tags');
    return response.data;
  },

  getPublic: async (params?: { search?: string; category?: string; scene?: string; assetType?: string; sort?: string }) => {
    const response = await api.get<Prompt[]>('/prompts/public', { params });
    return response.data;
  },

  getPublicCatalog: async (params?: { category?: string; scene?: string }) => {
    const response = await api.get<{ categories: string[]; scenes: string[]; assetTypes: string[] }>('/prompts/public/catalog', { params });
    return response.data;
  },

  like: async (promptId: string) => {
    const response = await api.post<{ liked: boolean }>(`/prompts/${promptId}/like`);
    return response.data;
  },

  incrementUsage: async (promptId: string) => {
    await api.post(`/prompts/${promptId}/use`);
  },

  fork: async (id: string, workspaceId?: string) => {
    const response = await api.post<Prompt>(`/prompts/${id}/fork`, { workspaceId });
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

  moveChain: async (id: string, workspaceId: string) => {
    await api.put(`/chains/${id}/move`, { workspaceId });
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

  publishChain: async (id: string, config: any) => {
    const response = await api.post<any>(`/chains/${id}/publish`, config);
    return response.data;
  },

  // Comments
  getComments: async (id: string) => {
    const response = await api.get<any[]>(`/prompts/${id}/comments`);
    return response.data;
  },

  addComment: async (id: string, content: string) => {
    const response = await api.post<any>(`/prompts/${id}/comments`, { content });
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

  getModelCatalog: async () => {
    try {
      const response = await api.get<ModelCatalog>('/playground/models');
      return response.data;
    } catch {
      return DEFAULT_MODEL_CATALOG;
    }
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

  moveKnowledgeBase: async (id: string, workspaceId: string) => {
    await api.put(`/knowledge/${id}/move`, { workspaceId });
  },

  // Workspace resources
  getWorkspacePrompts: async (workspaceId: string) => {
    const response = await api.get<Prompt[]>(`/workspaces/${workspaceId}/prompts`);
    return response.data;
  },

  getWorkspaceChains: async (workspaceId: string) => {
    const response = await api.get<PromptChain[]>(`/workspaces/${workspaceId}/chains`);
    return response.data;
  },

  getWorkspaceKnowledgeBases: async (workspaceId: string) => {
    const response = await api.get<any[]>(`/workspaces/${workspaceId}/knowledge`);
    return response.data;
  },

  // Team workspace features
  getWorkspaceActivity: async (workspaceId: string) => {
    const response = await api.get<any[]>(`/workspaces/${workspaceId}/activity`);
    return response.data;
  },

  updateWorkspace: async (workspaceId: string, data: { name?: string; description?: string }) => {
    const response = await api.put(`/workspaces/${workspaceId}`, data);
    return response.data;
  },

  deleteWorkspace: async (workspaceId: string) => {
    await api.delete(`/workspaces/${workspaceId}`);
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
  },

  // Agents
  getAgents: async (userId?: string, workspaceId?: string) => {
    const params: Record<string, any> = {};
    if (userId) params.userId = userId;
    if (workspaceId) params.workspaceId = workspaceId;
    const response = await api.get<any[]>('/agents', { params });
    return response.data;
  },

  getAgent: async (id: string) => {
    const response = await api.get<any>(`/agents/${id}`);
    return response.data;
  },

  createAgent: async (agent: any) => {
    const response = await api.post<any>('/agents', agent);
    return response.data;
  },

  updateAgent: async (id: string, agent: any) => {
    const response = await api.put<any>(`/agents/${id}`, agent);
    return response.data;
  },

  publishAgent: async (id: string) => {
    await api.post(`/agents/${id}/publish`);
  },

  mountAgentTools: async (id: string, toolIds: string[]) => {
    await api.post(`/agents/${id}/tools`, toolIds);
  },

  getAgentTools: async (id: string) => {
    const response = await api.get<any[]>(`/agents/${id}/tools`);
    return response.data;
  },

  // Tools
  getBuiltInTools: async () => {
    const response = await api.get<any[]>('/agents/tools/built-in');
    return response.data;
  },

  getPublicTools: async () => {
    const response = await api.get<any[]>('/agents/tools/public');
    return response.data;
  },

  createTool: async (tool: any) => {
    const response = await api.post<any>('/agents/tools', tool);
    return response.data;
  },

  deleteAgent: async (id: string) => {
    await api.delete(`/agents/${id}`);
  }
};

// Collaboration Service
export const collaborationService = {
  getDevices: async () => {
    const response = await api.get<any[]>('/collaboration/devices');
    return response.data;
  },

  getTeamMembers: async () => {
    const response = await api.get<any[]>('/collaboration/team');
    return response.data;
  },

  getCollaborationSessions: async () => {
    const response = await api.get<any[]>('/collaboration/sessions');
    return response.data;
  },

  getSyncStatus: async () => {
    const response = await api.get<any[]>('/collaboration/sync');
    return response.data;
  },

  syncDevice: async (deviceId: string) => {
    await api.post(`/collaboration/devices/${deviceId}/sync`);
  },

  inviteTeamMember: async (email: string, role: string) => {
    await api.post('/collaboration/team/invite', { email, role });
  },

  joinCollaborationSession: async (sessionId: string) => {
    await api.post(`/collaboration/sessions/${sessionId}/join`);
  }
};

export default api;
