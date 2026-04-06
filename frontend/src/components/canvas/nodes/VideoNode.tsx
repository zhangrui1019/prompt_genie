import { Handle, Position } from 'reactflow';

export default function VideoNode({ data, isConnectable }: any) {
  return (
    <div className="bg-white border-2 border-orange-500 rounded-lg shadow-md p-4 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-orange-500"
      />
      
      <div className="flex items-center gap-2 mb-2 border-b pb-2">
        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold">Video</span>
        <span className="text-sm font-bold text-gray-700">{data.label || 'Video Generator'}</span>
      </div>
      
      <div className="text-xs text-gray-500 flex flex-col gap-1">
          <div className="flex justify-between">
              <span>Model:</span>
              <span className="font-mono">{data.modelName || 'Wan 2.6'}</span>
          </div>
          <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-mono">{data.duration || '10s'}</span>
          </div>
          <div className="flex justify-between">
              <span>Resolution:</span>
              <span className="font-mono">{data.resolution || '1080P'}</span>
          </div>
          {data.previewUrl && (
              <div className="mt-2 border rounded p-1">
                  <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-500">🎬 Video Preview</span>
                  </div>
              </div>
          )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-orange-500"
      />
    </div>
  );
}