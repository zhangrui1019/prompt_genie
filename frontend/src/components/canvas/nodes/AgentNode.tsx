import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface AgentNodeProps {
  data: {
    label: string;
    agentType?: string;
    expertise?: string;
    instructions?: string;
  };
}

const AgentNode = ({ data }: AgentNodeProps) => {
  return (
    <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-2 min-w-[180px]">
      <div className="font-bold text-blue-800 mb-1">Agent</div>
      <div className="text-xs text-blue-700 mb-1">
        {data.agentType || 'General'}
      </div>
      <div className="text-xs text-blue-600 mb-2">
        {data.expertise || 'Expertise'}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="bg-blue-500"
      />
    </div>
  );
};

export default memo(AgentNode);