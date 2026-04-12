import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api/workspaces',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
