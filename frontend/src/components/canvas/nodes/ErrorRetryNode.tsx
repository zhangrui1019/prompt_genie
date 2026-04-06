import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface ErrorRetryNodeProps {
  data: {
    label: string;
    maxRetries?: number;
    retryDelay?: number;
  };
}

const ErrorRetryNode = ({ data }: ErrorRetryNodeProps) => {
  return (
    <div className="bg-red-100 border-2 border-red-500 rounded-lg p-2 min-w-[180px]">
      <div className="font-bold text-red-800 mb-1">Error Retry</div>
      <div className="text-xs text-red-700 mb-1">
        Max Retries: {data.maxRetries || 3}
      </div>
      <div className="text-xs text-red-600 mb-2">
        Delay: {data.retryDelay || 1}s
      </div>
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="bg-red-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        className="bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="failure"
        className="bg-red-500"
      />
    </div>
  );
};

export default memo(ErrorRetryNode);