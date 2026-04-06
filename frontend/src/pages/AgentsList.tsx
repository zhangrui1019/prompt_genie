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
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Deployed</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Draft</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1200px]">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mt-4">Agents</h1>
          <button
            onClick={() => navigate('/agents/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            + Create Agent
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search agents..."
              className="w-full border rounded px-4 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full border rounded px-4 py-2"
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
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No agents yet</h3>
            <p className="text-gray-500 mb-6">Create your first agent to get started</p>
            <button
              onClick={() => navigate('/agents/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Create Agent
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{agent.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{agent.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        {getStatusBadge(agent.status)}
                        <span className="text-sm text-gray-500">{agent.toolsCount} tools</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/agents/${agent.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between text-sm text-gray-500">
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