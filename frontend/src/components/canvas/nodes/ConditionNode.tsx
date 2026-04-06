import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface ConditionNodeProps {
  data: {
    label: string;
    condition?: string;
    truePath?: string;
    falsePath?: string;
  };
}

const ConditionNode = ({ data }: ConditionNodeProps) => {
  return (
    <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-2 min-w-[180px]">
      <div className="font-bold text-yellow-800 mb-1">Condition</div>
      <div className="text-xs text-yellow-700 mb-2">
        {data.condition || 'condition?'}
      </div>
      <div className="flex justify-between text-xs text-yellow-600">
        <span>True</span>
        <span>False</span>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="bg-yellow-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="bg-red-500"
      />
    </div>
  );
};

export default memo(ConditionNode);