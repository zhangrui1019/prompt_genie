import { Handle, Position } from 'reactflow';

export default function ImageNode({ data, isConnectable }: any) {
  return (
    <div className="bg-white border-2 border-green-500 rounded-lg shadow-md p-4 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
      
      <div className="flex items-center gap-2 mb-2 border-b pb-2">
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">Image</span>
        <span className="text-sm font-bold text-gray-700">{data.label || 'Image Generator'}</span>
      </div>
      
      <div className="text-xs text-gray-500 flex flex-col gap-1">
          <div className="flex justify-between">
              <span>Model:</span>
              <span className="font-mono">{data.modelName || 'Wanx V1'}</span>
          </div>
          <div className="flex justify-between">
              <span>Size:</span>
              <span className="font-mono">{data.imageSize || '1024x1024'}</span>
          </div>
          {data.previewUrl && (
              <div className="mt-2 border rounded p-1">
                  <img 
                      src={data.previewUrl} 
                      alt="Preview" 
                      className="w-full h-20 object-cover rounded"
                  />
              </div>
          )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
}