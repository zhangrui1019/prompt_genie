import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface LoopNodeProps {
  data: {
    label: string;
    condition?: string;
    maxIterations?: number;
  };
}

const LoopNode = ({ data }: LoopNodeProps) => {
  return (
    <div className="bg-indigo-100 border-2 border-indigo-500 rounded-lg p-2 min-w-[180px]">
      <div className="font-bold text-indigo-800 mb-1">Loop</div>
      <div className="text-xs text-indigo-700 mb-1">
        {data.condition || 'while condition'}
      </div>
      <div className="text-xs text-indigo-600 mb-2">
        Max: {data.maxIterations || 10}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="bg-indigo-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="continue"
        className="bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="break"
        className="bg-red-500"
      />
    </div>
  );
};

export default memo(LoopNode);