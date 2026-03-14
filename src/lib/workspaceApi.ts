import axios from 'axios';

const API_URL = 'http://localhost:8080/api/workspaces';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const workspaceService = {
  create: async (name: string, description?: string) => {
    const response = await api.post('', { name, description });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('');
    return response.data;
  },

  getMembers: async (workspaceId: string) => {
    const response = await api.get(`/${workspaceId}/members`);
    return response.data;
  },

  addMember: async (workspaceId: string, email: string, role: string) => {
    const response = await api.post(`/${workspaceId}/members`, { email, role });
    return response.data;
  },

  removeMember: async (workspaceId: string, userId: string) => {
    await api.delete(`/${workspaceId}/members/${userId}`);
  }
};
