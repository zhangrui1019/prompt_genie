import { Handle, Position } from 'reactflow';

export default function DataNode({ data, isConnectable }: any) {
  return (
    <div className="bg-white border-2 border-cyan-500 rounded-lg shadow-md p-4 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-cyan-500"
      />
      
      <div className="flex items-center gap-2 mb-2 border-b pb-2">
        <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded font-bold">Data</span>
        <span className="text-sm font-bold text-gray-700">{data.label || 'Data Processor'}</span>
      </div>
      
      <div className="text-xs text-gray-500 flex flex-col gap-1">
          <div className="flex justify-between">
              <span>Operation:</span>
              <span className="font-mono">{data.operation || 'Transform'}</span>
          </div>
          <div className="flex justify-between">
              <span>Output:</span>
              <span className="font-mono">{data.outputType || 'JSON'}</span>
          </div>
          {data.sample && (
              <div className="mt-2 text-xs bg-gray-50 p-1 rounded font-mono overflow-hidden">
                  {data.sample.length > 50 ? data.sample.substring(0, 50) + '...' : data.sample}
              </div>
          )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-cyan-500"
      />
    </div>
  );
}