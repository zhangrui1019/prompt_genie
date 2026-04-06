import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';

interface Model {
  id: string;
  name: string;
  type: 'private' | 'fine_tuned';
  status: 'active' | 'inactive' | 'training';
  provider: string;
  version: string;
  createdAt: string;
  lastUpdated: string;
  stats?: {
    tokens: number;
    requests: number;
    successRate: number;
  };
}

interface FineTuningTask {
  id: string;
  modelId: string;
  name: string;
  status: 'pending' | 'training' | 'completed' | 'failed';
  progress: number;
  datasetSize: number;
  epochs: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export default function PrivateModels() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [models, setModels] = useState<Model[]>([]);
  const [tasks, setTasks] = useState<FineTuningTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModel, setShowAddModel] = useState(false);
  const [showFineTuneModal, setShowFineTuneModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  useEffect(() => {
    fetchModels();
    fetchFineTuningTasks();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      // 这里应该调用获取私有模型的API
      // 暂时使用模拟数据
      const mockModels: Model[] = [
        {
          id: '1',
          name: 'My Private GPT-3.5',
          type: 'private',
          status: 'active',
          provider: 'OpenAI',
          version: 'gpt-3.5-turbo',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          stats: {
            tokens: 125000,
            requests: 1500,
            successRate: 98.5
          }
        },
        {
          id: '2',
          name: 'Fine-tuned Marketing Model',
          type: 'fine_tuned',
          status: 'active',
          provider: 'OpenAI',
          version: 'gpt-4',
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          stats: {
            tokens: 87000,
            requests: 850,
            successRate: 99.2
          }
        },
        {
          id: '3',
          name: 'Custom LLM',
          type: 'private',
          status: 'inactive',
          provider: 'Custom',
          version: 'v1.0',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setModels(mockModels);
    } catch (error) {
      console.error('Failed to fetch models', error);
      toast.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const fetchFineTuningTasks = async () => {
    try {
      // 这里应该调用获取微调任务的API
      // 暂时使用模拟数据
      const mockTasks: FineTuningTask[] = [
        {
          id: '1',
          modelId: '2',
          name: 'Marketing Model Fine-tuning',
          status: 'completed',
          progress: 100,
          datasetSize: 1500,
          epochs: 3,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          modelId: '1',
          name: 'Customer Support Fine-tuning',
          status: 'training',
          progress: 65,
          datasetSize: 2000,
          epochs: 4,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          modelId: '3',
          name: 'Product Description Model',
          status: 'failed',
          progress: 0,
          datasetSize: 1000,
          epochs: 2,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          errorMessage: 'Invalid dataset format'
        }
      ];
      setTasks(mockTasks);
    } catch (error) {
      console.error('Failed to fetch fine-tuning tasks', error);
    }
  };

  const handleAddModel = async () => {
    // 这里应该调用添加模型的API
    toast.success('Model added successfully!');
    setShowAddModel(false);
    fetchModels();
  };

  const handleFineTune = async (model: Model) => {
    setSelectedModel(model);
    setShowFineTuneModal(true);
  };

  const handleStartFineTuning = async () => {
    // 这里应该调用开始微调的API
    toast.success('Fine-tuning started!');
    setShowFineTuneModal(false);
    fetchFineTuningTasks();
  };

  const handleDeployModel = async (modelId: string) => {
    // 这里应该调用部署模型的API
    toast.success('Model deployed successfully!');
    fetchModels();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>;
      case 'training':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Training</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mt-4">Private Models</h1>
          <button
            onClick={() => setShowAddModel(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            + Add Model
          </button>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">Model Management</h2>
            
            {models.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No models found</h3>
                <p className="text-gray-500 mb-6">Add your first private model</p>
                <button
                  onClick={() => setShowAddModel(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Add Model
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {models.map((model) => (
                  <div key={model.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{model.name}</h3>
                          <div className="flex items-center gap-2 mb-3">
                            {getStatusBadge(model.status)}
                            <span className="text-sm text-gray-500">{model.provider} - {model.version}</span>
                          </div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="text-sm text-gray-500">
                              Created: {new Date(model.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              Updated: {new Date(model.lastUpdated).toLocaleDateString()}
                            </div>
                          </div>
                          {model.stats && (
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-50 p-3 rounded">
                                <div className="text-xs text-gray-500">Tokens</div>
                                <div className="font-semibold">{model.stats.tokens.toLocaleString()}</div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded">
                                <div className="text-xs text-gray-500">Requests</div>
                                <div className="font-semibold">{model.stats.requests}</div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded">
                                <div className="text-xs text-gray-500">Success Rate</div>
                                <div className="font-semibold">{model.stats.successRate}%</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleFineTune(model)}
                          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
                        >
                          Fine-tune
                        </button>
                        <button
                          onClick={() => handleDeployModel(model.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                        >
                          Deploy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Fine-tuning Tasks</h2>
            
            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-6xl mb-4">🔄</div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No fine-tuning tasks</h3>
                <p className="text-gray-500 mb-6">Start a fine-tuning task for your models</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{task.name}</h3>
                          <div className="flex items-center gap-2 mb-3">
                            {getStatusBadge(task.status)}
                            <span className="text-sm text-gray-500">Model: {models.find(m => m.id === task.modelId)?.name || 'Unknown'}</span>
                          </div>
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-medium">{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${task.status === 'failed' ? 'bg-red-500' : 'bg-blue-600'}`}
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-sm">
                              <span className="text-gray-500">Dataset Size:</span> {task.datasetSize} samples
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Epochs:</span> {task.epochs}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Started:</span> {new Date(task.createdAt).toLocaleString()}
                            </div>
                            {task.completedAt && (
                              <div className="text-sm">
                                <span className="text-gray-500">Completed:</span> {new Date(task.completedAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                          {task.errorMessage && (
                            <div className="bg-red-50 p-3 rounded mb-4">
                              <div className="text-sm font-medium text-red-800 mb-1">Error:</div>
                              <div className="text-sm text-red-600">{task.errorMessage}</div>
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
      </div>
      
      {/* Add Model Modal */}
      {showAddModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Add Private Model</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                  <input type="text" className="w-full border rounded px-4 py-2" placeholder="Enter model name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <select className="w-full border rounded px-4 py-2">
                    <option>OpenAI</option>
                    <option>Anthropic</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input type="password" className="w-full border rounded px-4 py-2" placeholder="Enter API key" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Version</label>
                  <input type="text" className="w-full border rounded px-4 py-2" placeholder="Enter model version" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModel(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddModel}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Add Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Fine-tune Modal */}
      {showFineTuneModal && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Fine-tune Model: {selectedModel.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                  <input type="text" className="w-full border rounded px-4 py-2" placeholder="Enter task name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dataset</label>
                  <input type="file" className="w-full border rounded px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Epochs</label>
                  <input type="number" className="w-full border rounded px-4 py-2" placeholder="Enter number of epochs" defaultValue={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Learning Rate</label>
                  <input type="number" step="0.00001" className="w-full border rounded px-4 py-2" placeholder="Enter learning rate" defaultValue={0.0001} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowFineTuneModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartFineTuning}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
                >
                  Start Fine-tuning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}