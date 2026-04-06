import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface ToolNodeProps {
  data: {
    label: string;
    toolType?: string;
    toolConfig?: string;
  };
}

const ToolNode = ({ data }: ToolNodeProps) => {
  return (
    <div className="bg-green-100 border-2 border-green-500 rounded-lg p-2 min-w-[180px]">
      <div className="font-bold text-green-800 mb-1">Tool</div>
      <div className="text-xs text-green-700 mb-1">
        {data.toolType || 'Google Search'}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="bg-green-500"
      />
    </div>
  );
};

export default memo(ToolNode);