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

import NodeConfigPanel from './NodeConfigPanel';

const nodeTypes = {
  promptNode: PromptNode,
  llmNode: LLMNode,
  outputNode: OutputNode,
};

interface WorkflowEditorProps {
    initialNodesJson?: string;
    initialEdgesJson?: string;
    onChange?: (nodes: Node[], edges: Edge[]) => void;
}

export default function WorkflowEditor({ initialNodesJson, initialEdgesJson, onChange }: WorkflowEditorProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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
          <button onClick={() => addNode('outputNode')} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded font-bold hover:bg-green-200">
              + Output
          </button>
      </div>

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
    </div>
  );
}
