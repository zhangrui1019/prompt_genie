import { Handle, Position } from 'reactflow';

export default function LLMNode({ data, isConnectable }: any) {
  return (
    <div className="bg-white border-2 border-purple-500 rounded-lg shadow-md p-4 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
      
      <div className="flex items-center gap-2 mb-2 border-b pb-2">
        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold">LLM</span>
        <span className="text-sm font-bold text-gray-700">{data.modelName || 'Select Model'}</span>
      </div>
      
      <div className="text-xs text-gray-500 flex flex-col gap-1">
          <div className="flex justify-between">
              <span>Temperature:</span>
              <span className="font-mono">{data.temperature || 0.7}</span>
          </div>
          <div className="flex justify-between">
              <span>Max Tokens:</span>
              <span className="font-mono">{data.maxTokens || 2048}</span>
          </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
}
