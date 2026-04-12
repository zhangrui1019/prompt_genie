import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';
import { promptService } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'deployed' | 'inactive';
  toolsCount: number;
  createdAt: string;
  lastDeployed?: string;
}

export default function AgentsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    fetchAgents();
  }, [search, status]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const agentsData = await promptService.getAgents(user?.id);
      const formattedAgents = agentsData.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        status: agent.status || 'draft',
        toolsCount: agent.tools ? (Array.isArray(agent.tools) ? agent.tools.length : 0) : 0,
        createdAt: agent.createdAt,
        lastDeployed: agent.updatedAt
      }));
      setAgents(formattedAgents);
    } catch (error) {
      console.error('Failed to fetch agents', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    try {
      await promptService.deleteAgent(agentId);
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
      toast.success('Agent deleted');
    } catch (error) {
      console.error('Failed to delete agent', error);
      toast.error('Failed to delete agent');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'deployed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-900/50 text-green-400">Deployed</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900/50 text-yellow-400">Draft</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">Inactive</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">Unknown</span>;
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden p-6">
      {/* Background SVG lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.15)" />
            </linearGradient>
          </defs>
          <line 
            x1="50" y1="150" x2="950" y2="150" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="30,15" 
            className="animate-draw-line"
          />
          <line 
            x1="50" y1="350" x2="950" y2="350" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="20,20" 
            className="animate-draw-line animation-delay-200"
          />
          <line 
            x1="50" y1="550" x2="950" y2="550" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="15,25" 
            className="animate-draw-line animation-delay-400"
          />
          <line 
            x1="50" y1="750" x2="950" y2="750" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="25,10" 
            className="animate-draw-line animation-delay-600"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-[1200px] z-10">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mt-4 text-white">Agents</h1>
          <button
            onClick={() => navigate('/agents/new')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 font-medium"
          >
            + Create Agent
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search agents..."
              className="w-full border border-gray-600 bg-gray-900 text-gray-300 rounded px-4 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full border border-gray-600 bg-gray-900 text-gray-300 rounded px-4 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="deployed">Deployed</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        {agents.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/60 rounded-xl shadow-sm border border-gray-700">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-medium text-white mb-2">No agents yet</h3>
            <p className="text-gray-400 mb-6">Create your first agent to get started</p>
            <button
              onClick={() => navigate('/agents/new')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 font-medium"
            >
              Create Agent
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-gray-800/60 rounded-xl shadow-sm border border-gray-700 overflow-hidden hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{agent.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        {getStatusBadge(agent.status)}
                        <span className="text-sm text-gray-400">{agent.toolsCount} tools</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/agents/${agent.id}`)}
                        className="p-2 text-blue-400 hover:bg-blue-900/30 rounded"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="p-2 text-red-400 hover:bg-red-900/30 rounded"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="flex justify-between text-sm text-gray-400">
                      <div>
                        <div>Created</div>
                        <div>{new Date(agent.createdAt).toLocaleDateString()}</div>
                      </div>
                      {agent.lastDeployed && (
                        <div>
                          <div>Last Deployed</div>
                          <div>{new Date(agent.lastDeployed).toLocaleDateString()}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}