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
} from 'reactflow';
import 'reactflow/dist/style.css';
import toast from 'react-hot-toast';

import NodeConfigPanel from './NodeConfigPanel';
import PromptNode from './nodes/PromptNode';
import LLMNode from './nodes/LLMNode';
import OutputNode from './nodes/OutputNode';
import ImageNode from './nodes/ImageNode';
import VideoNode from './nodes/VideoNode';
import DataNode from './nodes/DataNode';
import ConditionNode from './nodes/ConditionNode';
import LoopNode from './nodes/LoopNode';
import ErrorRetryNode from './nodes/ErrorRetryNode';
import AgentNode from './nodes/AgentNode';
import ToolNode from './nodes/ToolNode';
import { promptService } from '@/lib/api';

const nodeTypes = {
  promptNode: PromptNode,
  llmNode: LLMNode,
  outputNode: OutputNode,
  imageNode: ImageNode,
  videoNode: VideoNode,
  dataNode: DataNode,
  conditionNode: ConditionNode,
  loopNode: LoopNode,
  errorRetryNode: ErrorRetryNode,
  agentNode: AgentNode,
  toolNode: ToolNode,
};

interface WorkflowEditorProps {
    initialNodesJson?: string;
    initialEdgesJson?: string;
    onChange?: (nodes: Node[], edges: Edge[]) => void;
    chainId?: string;
}

export default function WorkflowEditor({ initialNodesJson, initialEdgesJson, onChange, chainId }: WorkflowEditorProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [nodeRunning, setNodeRunning] = useState<Record<string, boolean>>({});
  const [nodeResults, setNodeResults] = useState<Record<string, any>>({});
  const [pausedNode, setPausedNode] = useState<Node | null>(null);
  const [pausedNodeResult, setPausedNodeResult] = useState<any>(null);
  const [pausedNodeInput, setPausedNodeInput] = useState<any>({});
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishConfig, setPublishConfig] = useState({
    target: 'webapp', // webapp, slack, discord, api
    name: '',
    description: '',
    visibility: 'private', // public, private
    apiKey: ''
  });

  useEffect(() => {
      if (initialNodesJson) {
          try { setNodes(JSON.parse(initialNodesJson)); } catch(e) {}
      }
      if (initialEdgesJson) {
          try { setEdges(JSON.parse(initialEdgesJson)); } catch(e) {}
      }
  }, [initialNodesJson, initialEdgesJson]);

  // Notify parent of changes
  useEffect(() => {
      if (onChange) {
          onChange(nodes, edges);
      }
  }, [nodes, edges, onChange]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onNodeClick = useCallback((event: any, node: Node) => {
      setSelectedNode(node);
  }, []);
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  const addNode = (type: string) => {
      const newNode = {
          id: `${Date.now()}`,
          type,
          position: { x: 100, y: 200 },
          data: { label: `New ${type.replace('Node', '')}` }
      };
      setNodes((nds) => [...nds, newNode]);
  };

  const handleNodeUpdate = (nodeId: string, newData: any) => {
      setNodes((nds) => nds.map(node => {
          if (node.id === nodeId) {
              return { ...node, data: newData };
          }
          return node;
      }));
      // Also update selected node reference to keep UI in sync
      setSelectedNode(prev => prev && prev.id === nodeId ? { ...prev, data: newData } : prev);
  };

  const runNode = async (nodeId: string) => {
      if (!chainId) {
          toast.error('Please save the chain before running nodes');
          return;
      }

      setNodeRunning(prev => ({ ...prev, [nodeId]: true }));

      try {
          // Get the node
          const node = nodes.find(n => n.id === nodeId);
          if (!node) return;

          // Prepare variables (simplified for now)
          const variables = node.data.variables || {};

          // Run the chain with the node's input
          const results = await promptService.runChain(chainId, variables);

          // Check if this is a risk node
          if (node.data.isRiskNode) {
                // Pause execution and show review UI
                setPausedNode(node);
                setPausedNodeResult(results);
                setPausedNodeInput(variables);
                toast.success(`Node ${node.data.label} requires human review`);
            } else {
              // Store the result for this node
              setNodeResults(prev => ({ ...prev, [nodeId]: results }));
              toast.success(`Node ${node.data.label} ran successfully`);
          }
      } catch (error) {
          console.error('Failed to run node:', error);
          toast.error('Failed to run node');
      } finally {
          setNodeRunning(prev => ({ ...prev, [nodeId]: false }));
      }
  };

  const runAllNodes = async () => {
      if (!chainId) {
          toast.error('Please save the chain before running');
          return;
      }

      setIsRunning(true);

      try {
          // Prepare variables
          const variables = {};

          // Run the entire chain
          const results = await promptService.runChain(chainId, variables);

          // Check for risk nodes that require review
          let hasRiskNode = false;
          results.forEach((result: any, index: number) => {
              const nodeId = nodes[index]?.id;
              if (nodeId) {
                  const node = nodes.find(n => n.id === nodeId);
                  if (node && node.data.isRiskNode) {
                      // Pause execution and show review UI
                      setPausedNode(node);
                      setPausedNodeResult(result);
                      setPausedNodeInput(variables);
                      hasRiskNode = true;
                      toast.success(`Node ${node.data.label} requires human review`);
                  } else {
                      setNodeResults(prev => ({ ...prev, [nodeId]: result }));
                  }
              }
          });

          if (!hasRiskNode) {
              toast.success('Chain ran successfully');
          }
      } catch (error) {
          console.error('Failed to run chain:', error);
          toast.error('Failed to run chain');
      } finally {
          setIsRunning(false);
      }
  };

  const handleResumeExecution = () => {
      if (pausedNode) {
          // Store the result for the paused node
          setNodeResults(prev => ({ ...prev, [pausedNode.id]: pausedNodeResult }));
          // Clear paused state
          setPausedNode(null);
          setPausedNodeResult(null);
          setPausedNodeInput({});
          toast.success('Execution resumed');
      }
  };

  const handleModifyResult = (newResult: any) => {
      setPausedNodeResult(newResult);
  };

  const handlePublish = async () => {
      if (!chainId) {
          toast.error('Please save the chain before publishing');
          return;
      }

      if (!publishConfig.name) {
          toast.error('Please enter application name');
          return;
      }

      try {
          // Call API to publish workflow
          const response = await promptService.publishChain(chainId, publishConfig);
          toast.success('Workflow published successfully!');
          setShowPublishModal(false);
          
          // Reset publish config
          setPublishConfig({
              target: 'webapp',
              name: '',
              description: '',
              visibility: 'private',
              apiKey: ''
          });
      } catch (error) {
          console.error('Failed to publish workflow:', error);
          toast.error('Failed to publish workflow');
      }
  };

  return (
    <div className="flex h-full w-full border rounded-lg overflow-hidden bg-gray-50 relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white p-2 rounded shadow-md">
          <button onClick={() => addNode('promptNode')} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded font-bold hover:bg-blue-200">
              + Prompt
          </button>
          <button onClick={() => addNode('llmNode')} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded font-bold hover:bg-purple-200">
              + LLM
          </button>
          <button onClick={() => addNode('imageNode')} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded font-bold hover:bg-green-200">
              + Image
          </button>
          <button onClick={() => addNode('videoNode')} className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded font-bold hover:bg-orange-200">
              + Video
          </button>
          <button onClick={() => addNode('dataNode')} className="px-3 py-1 bg-cyan-100 text-cyan-700 text-sm rounded font-bold hover:bg-cyan-200">
              + Data
          </button>
          <button onClick={() => addNode('outputNode')} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded font-bold hover:bg-gray-200">
              + Output
          </button>
          <div className="border-l border-gray-200 px-2"></div>
          <button onClick={() => addNode('conditionNode')} className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded font-bold hover:bg-yellow-200">
              + Condition
          </button>
          <button onClick={() => addNode('loopNode')} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded font-bold hover:bg-indigo-200">
              + Loop
          </button>
          <button onClick={() => addNode('errorRetryNode')} className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded font-bold hover:bg-red-200">
              + Error Retry
          </button>
          <button onClick={() => addNode('agentNode')} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded font-bold hover:bg-blue-200">
              + Agent
          </button>
          <button onClick={() => addNode('toolNode')} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded font-bold hover:bg-green-200">
              + Tool
          </button>
          <div className="border-l border-gray-200 px-2"></div>
          <button 
              onClick={runAllNodes}
              disabled={isRunning}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
              {isRunning ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : (
                  <span>▶️</span>
              )}
              Run All
          </button>
          <button 
              onClick={() => setShowPublishModal(true)}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded font-bold hover:bg-purple-700 flex items-center gap-1"
          >
              🚀 Publish
          </button>
      </div>

      {/* Node Controls */}
      {selectedNode && (
          <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white p-2 rounded shadow-md">
              <button 
                  onClick={() => runNode(selectedNode.id)}
                  disabled={nodeRunning[selectedNode.id]}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                  {nodeRunning[selectedNode.id] ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                  ) : (
                      <span>▶️</span>
                  )}
                  Run Node
              </button>
              {nodeResults[selectedNode.id] && (
                  <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-bold">
                      ✅
                  </div>
              )}
          </div>
      )}

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

      {/* Config Panel */}
      {selectedNode && (
          <NodeConfigPanel 
            node={selectedNode} 
            onChange={(id, data) => handleNodeUpdate(id, data)}
            onClose={() => setSelectedNode(null)}
          />
      )}

      {/* Human-in-the-Loop Review Panel */}
      {pausedNode && (
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-white border-l shadow-xl p-4 overflow-y-auto z-30">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="font-bold text-gray-800">Human Review Required</h3>
                  <button onClick={() => setPausedNode(null)} className="text-gray-500 hover:text-gray-700">&times;</button>
              </div>
              
              <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Node: {pausedNode.data.label}</label>
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          Type: {pausedNode.type}
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Input Variables</label>
                      <textarea 
                          className="w-full border rounded px-2 py-1 text-sm h-24 font-mono"
                          value={JSON.stringify(pausedNodeInput, null, 2)}
                          readOnly
                      />
                  </div>
                  
                  <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Generated Result</label>
                      <textarea 
                          className="w-full border rounded px-2 py-1 text-sm h-32 font-mono"
                          value={typeof pausedNodeResult === 'object' ? JSON.stringify(pausedNodeResult, null, 2) : pausedNodeResult}
                          onChange={(e) => handleModifyResult(e.target.value)}
                      />
                  </div>
                  
                  <div className="flex gap-2">
                      <button 
                          onClick={handleResumeExecution}
                          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded font-bold hover:bg-green-700"
                      >
                          Approve & Resume
                      </button>
                      <button 
                          onClick={() => setPausedNode(null)}
                          className="px-3 py-2 bg-gray-600 text-white text-sm rounded font-bold hover:bg-gray-700"
                      >
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold text-gray-800 text-lg">Publish Workflow</h3>
                      <button onClick={() => setShowPublishModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Publish Target</label>
                          <select 
                              className="w-full border rounded px-2 py-2 text-sm"
                              value={publishConfig.target}
                              onChange={(e) => setPublishConfig({ ...publishConfig, target: e.target.value })}
                          >
                              <option value="webapp">Web App</option>
                              <option value="slack">Slack Bot</option>
                              <option value="discord">Discord Bot</option>
                              <option value="api">API Endpoint</option>
                          </select>
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
                          <input 
                              className="w-full border rounded px-2 py-2 text-sm"
                              value={publishConfig.name}
                              onChange={(e) => setPublishConfig({ ...publishConfig, name: e.target.value })}
                              placeholder="Enter application name"
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                          <textarea 
                              className="w-full border rounded px-2 py-2 text-sm h-16"
                              value={publishConfig.description}
                              onChange={(e) => setPublishConfig({ ...publishConfig, description: e.target.value })}
                              placeholder="Enter application description"
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Visibility</label>
                          <select 
                              className="w-full border rounded px-2 py-2 text-sm"
                              value={publishConfig.visibility}
                              onChange={(e) => setPublishConfig({ ...publishConfig, visibility: e.target.value })}
                          >
                              <option value="private">Private</option>
                              <option value="public">Public</option>
                          </select>
                      </div>
                      
                      {publishConfig.target === 'api' && (
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">API Key</label>
                              <input 
                                  className="w-full border rounded px-2 py-2 text-sm"
                                  value={publishConfig.apiKey}
                                  onChange={(e) => setPublishConfig({ ...publishConfig, apiKey: e.target.value })}
                                  placeholder="Enter API key"
                              />
                          </div>
                      )}
                      
                      <div className="flex gap-2">
                          <button 
                              onClick={handlePublish}
                              className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded font-bold hover:bg-purple-700"
                          >
                              Publish
                          </button>
                          <button 
                              onClick={() => setShowPublishModal(false)}
                              className="px-3 py-2 bg-gray-600 text-white text-sm rounded font-bold hover:bg-gray-700"
                          >
                              Cancel
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
