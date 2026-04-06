import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate, useParams } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';

// 节点类型定义
const nodeTypes = {
  llmNode: (props: any) => (
    <div className="bg-purple-100 border-2 border-purple-500 rounded-lg p-2 min-w-[180px]">
      <div className="font-bold text-purple-800 mb-1">LLM Node</div>
      <div className="text-xs text-purple-700 mb-1">Qwen Turbo</div>
      <div className="text-xs text-purple-600 mb-2">Generate response</div>
      <div className="flex justify-between">
        <div className="text-xs text-purple-500">Temperature: 0.7</div>
      </div>
    </div>
  ),
  toolNode: (props: any) => (
    <div className="bg-green-100 border-2 border-green-500 rounded-lg p-2 min-w-[180px]">
      <div className="font-bold text-green-800 mb-1">Tool Node</div>
      <div className="text-xs text-green-700 mb-1">Google Search</div>
      <div className="text-xs text-green-600 mb-2">Search the web</div>
    </div>
  ),
  guardrailNode: (props: any) => (
    <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-2 min-w-[180px]">
      <div className="font-bold text-yellow-800 mb-1">Guardrail Node</div>
      <div className="text-xs text-yellow-700 mb-1">Human Approval</div>
      <div className="text-xs text-yellow-600 mb-2">Requires review</div>
    </div>
  ),
  conditionNode: (props: any) => (
    <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-2 min-w-[180px]">
      <div className="font-bold text-blue-800 mb-1">Condition Node</div>
      <div className="text-xs text-blue-700 mb-1">If-Else</div>
      <div className="text-xs text-blue-600 mb-2">Check condition</div>
    </div>
  ),
  loopNode: (props: any) => (
    <div className="bg-indigo-100 border-2 border-indigo-500 rounded-lg p-2 min-w-[180px]">
      <div className="font-bold text-indigo-800 mb-1">Loop Node</div>
      <div className="text-xs text-indigo-700 mb-1">While Loop</div>
      <div className="text-xs text-indigo-600 mb-2">Repeat until condition</div>
    </div>
  ),
  errorRetryNode: (props: any) => (
    <div className="bg-red-100 border-2 border-red-500 rounded-lg p-2 min-w-[180px]">
      <div className="font-bold text-red-800 mb-1">Error Retry Node</div>
      <div className="text-xs text-red-700 mb-1">Retry on Error</div>
      <div className="text-xs text-red-600 mb-2">Handle exceptions</div>
    </div>
  ),
};

export default function AgentBuilder() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  // 加载智能体数据
  useEffect(() => {
    if (id) {
      loadAgent();
    }
  }, [id]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      const agentData = await promptService.getAgent(id);
      setAgentName(agentData.name);
      setAgentDescription(agentData.description);
      setSystemPrompt(agentData.systemPrompt);
      
      // 这里应该加载智能体的节点配置
      // 暂时使用默认节点
      initializeDefaultNodes();
    } catch (error) {
      console.error('Failed to load agent', error);
      toast.error('Failed to load agent');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultNodes = () => {
    const defaultNodes: Node[] = [
      {
        id: '1',
        type: 'llmNode',
        position: { x: 100, y: 100 },
        data: { label: 'LLM Node' },
      },
      {
        id: '2',
        type: 'toolNode',
        position: { x: 100, y: 250 },
        data: { label: 'Tool Node' },
      },
      {
        id: '3',
        type: 'guardrailNode',
        position: { x: 100, y: 400 },
        data: { label: 'Guardrail Node' },
      },
    ];

    const defaultEdges: Edge[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true,
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        animated: true,
      },
    ];

    setNodes(defaultNodes);
    setEdges(defaultEdges);
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      data: { label: `New ${type.replace('Node', '')}` },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // 将画布上的节点和连线转换为 JSON DSL
      const agentData = {
        name: agentName,
        description: agentDescription,
        systemPrompt: systemPrompt,
        nodes: nodes,
        edges: edges
      };
      
      if (id) {
        await promptService.updateAgent(id, agentData);
        toast.success('Agent updated');
      } else {
        const newAgent = await promptService.createAgent(agentData);
        toast.success('Agent created');
      }
      navigate('/agents');
    } catch (error) {
      console.error('Failed to save agent', error);
      toast.error('Failed to save agent');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <BackButton to="/agents" label="Back to Agents" />
              <h1 className="text-2xl font-bold">{id ? 'Edit Agent' : 'Create Agent'}</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Agent'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Agent Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Agent Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full border rounded px-4 py-2"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Agent name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                className="w-full border rounded px-4 py-2"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Agent description"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <textarea
                className="w-full border rounded px-4 py-2 font-mono"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="System prompt for the agent"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 rounded">
            <button onClick={() => addNode('llmNode')} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded font-bold hover:bg-purple-200">
              + LLM Node
            </button>
            <button onClick={() => addNode('toolNode')} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded font-bold hover:bg-green-200">
              + Tool Node
            </button>
            <button onClick={() => addNode('guardrailNode')} className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded font-bold hover:bg-yellow-200">
              + Guardrail Node
            </button>
            <button onClick={() => addNode('conditionNode')} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded font-bold hover:bg-blue-200">
              + Condition Node
            </button>
            <button onClick={() => addNode('loopNode')} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded font-bold hover:bg-indigo-200">
              + Loop Node
            </button>
            <button onClick={() => addNode('errorRetryNode')} className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded font-bold hover:bg-red-200">
              + Error Retry Node
            </button>
          </div>

          {/* Flow Canvas */}
          <div className="h-[600px] border rounded">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background color="#ccc" gap={16} />
              <Controls />
            </ReactFlow>
          </div>
        </div>

        {/* Node Configuration */}
        {selectedNode && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Node Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Node Type</label>
                <div className="text-sm text-gray-600">{selectedNode.type}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Node ID</label>
                <div className="text-sm text-gray-600">{selectedNode.id}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <div className="text-sm text-gray-600">
                  X: {Math.round(selectedNode.position.x)}, Y: {Math.round(selectedNode.position.y)}
                </div>
              </div>
              {/* Add more configuration options based on node type */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}