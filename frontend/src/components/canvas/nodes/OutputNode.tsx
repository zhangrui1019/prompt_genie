import { Handle, Position } from 'reactflow';

export default function OutputNode({ data, isConnectable }: any) {
  return (
    <div className="bg-white border-2 border-green-500 rounded-lg shadow-md p-4 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
      
      <div className="flex items-center gap-2 mb-2 border-b pb-2">
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">Output</span>
        <span className="text-sm font-bold text-gray-700">{data.label || 'Result'}</span>
      </div>
      
      <div className="text-xs text-gray-500 italic">
          {data.preview || 'Waiting for execution...'}
      </div>
    </div>
  );
}
