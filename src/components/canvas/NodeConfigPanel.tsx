import { Node } from 'reactflow';

interface NodeConfigPanelProps {
    node: Node | null;
    onChange: (id: string, data: any) => void;
    onClose: () => void;
}

export default function NodeConfigPanel({ node, onChange, onClose }: NodeConfigPanelProps) {
    if (!node) return null;

    const handleChange = (key: string, value: any) => {
        onChange(node.id, { ...node.data, [key]: value });
    };

    return (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l shadow-xl p-4 overflow-y-auto z-20">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-gray-800">Node Configuration</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Label</label>
                    <input 
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={node.data.label || ''}
                        onChange={e => handleChange('label', e.target.value)}
                    />
                </div>

                {node.type === 'promptNode' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Prompt Content</label>
                        <textarea 
                            className="w-full border rounded px-2 py-1 text-sm h-32 font-mono"
                            value={node.data.content || ''}
                            onChange={e => handleChange('content', e.target.value)}
                            placeholder="Enter prompt template..."
                        />
                        <p className="text-xs text-gray-400 mt-1">Use {'{{variable}}'} for inputs.</p>
                    </div>
                )}

                {node.type === 'llmNode' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Model</label>
                            <select 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.modelName || 'Qwen Turbo'}
                                onChange={e => handleChange('modelName', e.target.value)}
                            >
                                <option value="Qwen Turbo">Qwen Turbo</option>
                                <option value="Qwen Max">Qwen Max</option>
                                <option value="GPT-3.5">GPT-3.5</option>
                                <option value="GPT-4">GPT-4</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Temperature ({node.data.temperature || 0.7})</label>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.1"
                                className="w-full"
                                value={node.data.temperature || 0.7}
                                onChange={e => handleChange('temperature', parseFloat(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Max Tokens</label>
                            <input 
                                type="number" 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.maxTokens || 2048}
                                onChange={e => handleChange('maxTokens', parseInt(e.target.value))}
                            />
                        </div>
                    </>
                )}

                {node.type === 'outputNode' && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                        Output nodes display the final result of the workflow execution. No configuration needed.
                    </div>
                )}
            </div>
        </div>
    );
}
