import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { workspaceService } from '@/lib/workspaceApi';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  role?: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null; // null means personal workspace
  isLoading: boolean;
  
  fetchWorkspaces: () => Promise<void>;
  switchWorkspace: (workspaceId: string | null) => void;
  createWorkspace: (name: string, description?: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspace: null,
      isLoading: false,

      fetchWorkspaces: async () => {
        set({ isLoading: true });
        try {
          const workspaces = await workspaceService.getAll();
          set({ workspaces });
        } catch (error) {
          console.error('Failed to fetch workspaces', error);
        } finally {
          set({ isLoading: false });
        }
      },

      switchWorkspace: (workspaceId) => {
        if (!workspaceId) {
          set({ currentWorkspace: null });
          return;
        }
        const ws = get().workspaces.find(w => w.id === workspaceId);
        if (ws) {
          set({ currentWorkspace: ws });
        }
      },

      createWorkspace: async (name, description) => {
        const newWs = await workspaceService.create(name, description);
        set(state => ({ 
            workspaces: [...state.workspaces, newWs],
            currentWorkspace: newWs 
        }));
      }
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({ currentWorkspace: state.currentWorkspace }),
    }
  )
);
