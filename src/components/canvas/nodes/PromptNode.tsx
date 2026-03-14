import { Handle, Position } from 'reactflow';

export default function PromptNode({ data, isConnectable }: any) {
  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg shadow-md p-4 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2 border-b pb-2">
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">Prompt</span>
        <span className="text-sm font-bold text-gray-700">{data.label}</span>
      </div>
      
      <div className="text-xs text-gray-500 max-h-[100px] overflow-hidden">
          {data.content || 'Enter prompt content...'}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
}
