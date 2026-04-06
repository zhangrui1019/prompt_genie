import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  description: string;
  personality: string;
  guidelines: string[];
  examples: string[];
  createdAt: string;
  lastUpdated: string;
  usageCount: number;
  status: 'active' | 'draft' | 'archived';
}

interface DirectorMode {
  id: string;
  name: string;
  description: string;
  roles: string[];
  scenario: string;
  rules: string[];
  createdAt: string;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
}

interface Scene {
  id: string;
  directorModeId: string;
  name: string;
  description: string;
  characters: string[];
  script: string;
  createdAt: string;
  lastUpdated: string;
  status: 'draft' | 'in_progress' | 'completed';
}

export default function RoleConsistency() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [roles, setRoles] = useState<Role[]>([]);
  const [directorModes, setDirectorModes] = useState<DirectorMode[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'directors' | 'scenes'>('roles');

  useEffect(() => {
    fetchRoleConsistencyData();
  }, []);

  const fetchRoleConsistencyData = async () => {
    try {
      setLoading(true);
      // 这里应该调用获取角色一致性数据的API
      // 暂时使用模拟数据
      
      // 模拟角色数据
      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'Customer Support Representative',
          description: 'A friendly and helpful customer support representative',
          personality: 'Friendly, patient, helpful, professional',
          guidelines: [
            'Always greet customers with a smile',
            'Listen actively to customer concerns',
            'Provide clear and concise solutions',
            'Follow up to ensure satisfaction'
          ],
          examples: [
            '"Hello! How can I assist you today?"',
            '"I understand your concern. Let me help you resolve this."',
            '"Is there anything else I can help you with?"'
          ],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          usageCount: 125,
          status: 'active'
        },
        {
          id: '2',
          name: 'Marketing Specialist',
          description: 'A creative and strategic marketing specialist',
          personality: 'Creative, strategic, analytical, persuasive',
          guidelines: [
            'Focus on customer needs and pain points',
            'Highlight unique selling points',
            'Use data-driven insights',
            'Create compelling messaging'
          ],
          examples: [
            '"Our product helps you save time and money."',
            '"Based on market research, this approach works best."',
            '"Let me show you how this can benefit your business."'
          ],
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          usageCount: 87,
          status: 'active'
        },
        {
          id: '3',
          name: 'Technical Support Engineer',
          description: 'A knowledgeable technical support engineer',
          personality: 'Technical, precise, patient, problem-solving',
          guidelines: [
            'Ask clarifying questions to understand the issue',
            'Provide step-by-step instructions',
            'Explain technical concepts in simple terms',
            'Follow up to ensure the issue is resolved'
          ],
          examples: [
            '"Let me help you troubleshoot this issue."',
            '"Please try the following steps."',
            '"The issue appears to be related to the configuration."'
          ],
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          usageCount: 56,
          status: 'draft'
        }
      ];
      
      // 模拟导演模式数据
      const mockDirectorModes: DirectorMode[] = [
        {
          id: '1',
          name: 'Customer Support Scenario',
          description: 'A scenario for customer support interactions',
          roles: ['Customer Support Representative', 'Customer'],
          scenario: 'A customer contacts support with a product issue',
          rules: [
            'The support rep must remain friendly and professional',
            'The customer may be frustrated',
            'The support rep should provide clear solutions',
            'The conversation should end with customer satisfaction'
          ],
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: '2',
          name: 'Sales Pitch Scenario',
          description: 'A scenario for sales pitch interactions',
          roles: ['Marketing Specialist', 'Prospect'],
          scenario: 'A marketing specialist pitches a product to a prospect',
          rules: [
            'The specialist must highlight product benefits',
            'The prospect may have objections',
            'The specialist should address objections professionally',
            'The conversation should move towards a sale'
          ],
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: '3',
          name: 'Technical Support Scenario',
          description: 'A scenario for technical support interactions',
          roles: ['Technical Support Engineer', 'User'],
          scenario: 'A user contacts technical support with a technical issue',
          rules: [
            'The engineer must diagnose the issue',
            'The user may not be technical',
            'The engineer should provide clear instructions',
            'The issue should be resolved by the end of the conversation'
          ],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft'
        }
      ];
      
      // 模拟场景数据
      const mockScenes: Scene[] = [
        {
          id: '1',
          directorModeId: '1',
          name: 'Product Issue Resolution',
          description: 'A customer contacts support about a product issue',
          characters: ['Customer Support Representative', 'Customer'],
          script: 'Customer: "My product isn\'t working properly."\nSupport: "I\'m sorry to hear that. Can you describe the issue in more detail?"\nCustomer: "It keeps crashing when I try to open it."\nSupport: "Let me help you troubleshoot this issue. Please try the following steps..."',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          directorModeId: '2',
          name: 'Product Pitch',
          description: 'A marketing specialist pitches a product to a prospect',
          characters: ['Marketing Specialist', 'Prospect'],
          script: 'Specialist: "Hello! I\'d like to tell you about our new product."\nProspect: "What does it do?"\nSpecialist: "It helps businesses save time and increase productivity."\nProspect: "How much does it cost?"\nSpecialist: "We have different pricing plans to fit your needs."',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in_progress'
        },
        {
          id: '3',
          directorModeId: '3',
          name: 'Technical Issue Resolution',
          description: 'A user contacts technical support about a technical issue',
          characters: ['Technical Support Engineer', 'User'],
          script: 'User: "My computer isn\'t connecting to the internet."\nEngineer: "Let me help you troubleshoot this issue. First, let\'s check your network settings."\nUser: "How do I do that?"\nEngineer: "Please follow these steps..."',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft'
        }
      ];
      
      setRoles(mockRoles);
      setDirectorModes(mockDirectorModes);
      setScenes(mockScenes);
    } catch (error) {
      console.error('Failed to fetch role consistency data', error);
      toast.error('Failed to load role consistency data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    // 这里应该打开创建角色的模态框
    toast.success('Create role functionality will be implemented');
  };

  const handleCreateDirectorMode = () => {
    // 这里应该打开创建导演模式的模态框
    toast.success('Create director mode functionality will be implemented');
  };

  const handleCreateScene = () => {
    // 这里应该打开创建场景的模态框
    toast.success('Create scene functionality will be implemented');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      case 'archived':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mt-4">Role Consistency & Director Mode</h1>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 mb-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'roles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Roles
            </button>
            <button
              onClick={() => setActiveTab('directors')}
              className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'directors' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Director Modes
            </button>
            <button
              onClick={() => setActiveTab('scenes')}
              className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'scenes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Scenes
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'roles' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Roles</h2>
                <button
                  onClick={handleCreateRole}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  + Create Role
                </button>
              </div>
              
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{role.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(role.status)}
                          <span className="text-sm text-gray-500">Usage: {role.usageCount}</span>
                        </div>
                        <p className="text-gray-600 mb-3">{role.description}</p>
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Personality</div>
                          <div className="text-sm text-gray-600">{role.personality}</div>
                        </div>
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Guidelines</div>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {role.guidelines.map((guideline, index) => (
                              <li key={index}>{guideline}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created: {new Date(role.createdAt).toLocaleDateString()}</span>
                          <span>Last Updated: {new Date(role.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'directors' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Director Modes</h2>
                <button
                  onClick={handleCreateDirectorMode}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  + Create Director Mode
                </button>
              </div>
              
              <div className="space-y-4">
                {directorModes.map((mode) => (
                  <div key={mode.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{mode.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(mode.status)}
                        </div>
                        <p className="text-gray-600 mb-3">{mode.description}</p>
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Roles</div>
                          <div className="flex flex-wrap gap-2">
                            {mode.roles.map((role, index) => (
                              <span key={index} className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Scenario</div>
                          <div className="text-sm text-gray-600">{mode.scenario}</div>
                        </div>
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Rules</div>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {mode.rules.map((rule, index) => (
                              <li key={index}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created: {new Date(mode.createdAt).toLocaleDateString()}</span>
                          <span>Last Updated: {new Date(mode.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'scenes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Scenes</h2>
                <button
                  onClick={handleCreateScene}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  + Create Scene
                </button>
              </div>
              
              <div className="space-y-4">
                {scenes.map((scene) => (
                  <div key={scene.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{scene.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(scene.status)}
                        </div>
                        <p className="text-gray-600 mb-3">{scene.description}</p>
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Characters</div>
                          <div className="flex flex-wrap gap-2">
                            {scene.characters.map((character, index) => (
                              <span key={index} className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                {character}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Script</div>
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded font-mono whitespace-pre-wrap">
                            {scene.script}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created: {new Date(scene.createdAt).toLocaleDateString()}</span>
                          <span>Last Updated: {new Date(scene.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                          Run
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}