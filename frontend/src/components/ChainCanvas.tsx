import { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChainStep, Prompt } from '@/types';

interface ChainCanvasProps {
  steps: ChainStep[];
  prompts: Prompt[];
  onNodeClick?: (stepIndex: number) => void;
}

// Custom Node Component
const StepNode = ({ data }: { data: { step: ChainStep; index: number; promptTitle: string } }) => {
  const isImage = data.step.modelType === 'image';
  const isVideo = data.step.modelType === 'video';
  
  return (
    <div className={`px-4 py-3 rounded-xl shadow-md border-2 min-w-[200px] bg-white ${
      isImage ? 'border-purple-200' : isVideo ? 'border-pink-200' : 'border-blue-200'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
          isImage ? 'bg-purple-500' : isVideo ? 'bg-pink-500' : 'bg-blue-500'
        }`}>
          {data.index + 1}
        </div>
        <div className="font-bold text-sm text-gray-700">Step {data.index + 1}</div>
      </div>
      
      <div className="text-xs text-gray-500 mb-1 font-medium">
        {data.promptTitle || 'Select Prompt...'}
      </div>
      
      <div className="flex gap-1 mb-2">
         <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600 border border-gray-200">
            {data.step.modelType || 'text'}
         </span>
         <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600 border border-gray-200">
            {data.step.modelName || 'default'}
         </span>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Output Variable</div>
        <div className="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded text-blue-600 truncate">
          {data.step.targetVariable || '-'}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
};

const nodeTypes = {
  stepNode: StepNode,
};

export default function ChainCanvas({ steps, prompts, onNodeClick }: ChainCanvasProps) {
  // Convert steps to nodes and edges
  const { nodes, edges } = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Simple layout: vertical stack
    const xPos = 250;
    let yPos = 50;
    
    // Group by order to handle parallel steps (basic)
    const stepsByOrder: Record<number, ChainStep[]> = {};
    steps.forEach((s, i) => {
        const order = s.stepOrder !== undefined ? s.stepOrder : i;
        if (!stepsByOrder[order]) stepsByOrder[order] = [];
        stepsByOrder[order].push(s);
    });
    
    const sortedOrders = Object.keys(stepsByOrder).map(Number).sort((a, b) => a - b);
    
    sortedOrders.forEach((order, orderIdx) => {
        const currentSteps = stepsByOrder[order];
        const width = currentSteps.length * 250;
        let startX = xPos - (width / 2) + 125;
        
        currentSteps.forEach((step, idx) => {
             // Find prompt title
             const prompt = prompts.find(p => p.id === step.promptId);
             
             // Find original index in the full steps array
             const originalIndex = steps.indexOf(step);

             newNodes.push({
                id: `step-${originalIndex}`,
                type: 'stepNode',
                position: { x: startX + (idx * 250), y: yPos },
                data: { 
                    step, 
                    index: originalIndex,
                    promptTitle: prompt?.title 
                },
             });
             
             // Create edges from previous layer
             if (orderIdx > 0) {
                 const prevOrder = sortedOrders[orderIdx - 1];
                 const prevSteps = stepsByOrder[prevOrder];
                 prevSteps.forEach(prevStep => {
                     const prevOriginalIndex = steps.indexOf(prevStep);
                     newEdges.push({
                         id: `e-${prevOriginalIndex}-${originalIndex}`,
                         source: `step-${prevOriginalIndex}`,
                         target: `step-${originalIndex}`,
                         type: 'smoothstep',
                         animated: true,
                         markerEnd: {
                             type: MarkerType.ArrowClosed,
                         },
                         style: { stroke: '#94a3b8' }
                     });
                 });
             }
        });
        
        yPos += 150;
    });

    return { nodes: newNodes, edges: newEdges };
  }, [steps, prompts]);

  return (
    <div style={{ width: '100%', height: '600px' }} className="bg-gray-50 rounded-xl border border-gray-200 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        onNodeClick={(_, node) => onNodeClick?.(node.data.index)}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
