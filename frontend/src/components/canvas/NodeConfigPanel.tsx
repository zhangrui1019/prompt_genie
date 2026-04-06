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
                <div>
                    <label className="flex items-center text-xs font-bold text-gray-500 mb-1">
                        <input 
                            type="checkbox" 
                            className="mr-2"
                            checked={node.data.isRiskNode || false}
                            onChange={e => handleChange('isRiskNode', e.target.checked)}
                        />
                        Risk Node (Require Human Review)
                    </label>
                    {node.data.isRiskNode && (
                        <div className="text-xs text-yellow-600 mt-1">
                            This node will pause execution and require human review before continuing.
                        </div>
                    )}
                </div>
                <div>
                    <label className="flex items-center text-xs font-bold text-gray-500 mb-1">
                        <input 
                            type="checkbox" 
                            className="mr-2"
                            checked={node.data.hasGuardrails || false}
                            onChange={e => handleChange('hasGuardrails', e.target.checked)}
                        />
                        Enable Guardrails (Security Boundaries)
                    </label>
                    {node.data.hasGuardrails && (
                        <div className="space-y-3 mt-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">JSON Schema Validation</label>
                                <textarea 
                                    className="w-full border rounded px-2 py-1 text-sm h-24 font-mono"
                                    value={node.data.jsonSchema || ''}
                                    onChange={e => handleChange('jsonSchema', e.target.value)}
                                    placeholder="Enter JSON Schema..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Blocked Words (comma-separated)</label>
                                <input 
                                    className="w-full border rounded px-2 py-1 text-sm"
                                    value={node.data.blockedWords || ''}
                                    onChange={e => handleChange('blockedWords', e.target.value)}
                                    placeholder="e.g., bad, words, to, block"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Output Length Limit</label>
                                <input 
                                    type="number" 
                                    className="w-full border rounded px-2 py-1 text-sm"
                                    value={node.data.maxOutputLength || 1000}
                                    onChange={e => handleChange('maxOutputLength', parseInt(e.target.value))}
                                    min="100"
                                    max="10000"
                                />
                            </div>
                        </div>
                    )}
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

                {node.type === 'imageNode' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Model</label>
                            <select 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.modelName || 'Wanx V1'}
                                onChange={e => handleChange('modelName', e.target.value)}
                            >
                                <option value="Wanx V1">Wanx V1</option>
                                <option value="Wanx Sketch">Wanx Sketch</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Image Size</label>
                            <select 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.imageSize || '1024x1024'}
                                onChange={e => handleChange('imageSize', e.target.value)}
                            >
                                <option value="512x512">512x512</option>
                                <option value="1024x1024">1024x1024</option>
                                <option value="1536x1536">1536x1536</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Prompt</label>
                            <textarea 
                                className="w-full border rounded px-2 py-1 text-sm h-24 font-mono"
                                value={node.data.prompt || ''}
                                onChange={e => handleChange('prompt', e.target.value)}
                                placeholder="Enter image generation prompt..."
                            />
                        </div>
                    </>
                )}

                {node.type === 'videoNode' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Model</label>
                            <select 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.modelName || 'Wan 2.6'}
                                onChange={e => handleChange('modelName', e.target.value)}
                            >
                                <option value="Wan 2.6">Wan 2.6 (1080P)</option>
                                <option value="Wanx 2.1 Turbo">Wanx 2.1 Turbo (720P)</option>
                                <option value="Wanx 2.1 Plus">Wanx 2.1 Plus (720P)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Duration</label>
                            <select 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.duration || '10s'}
                                onChange={e => handleChange('duration', e.target.value)}
                            >
                                <option value="5s">5s</option>
                                <option value="10s">10s</option>
                                <option value="15s">15s</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Resolution</label>
                            <select 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.resolution || '1080P'}
                                onChange={e => handleChange('resolution', e.target.value)}
                            >
                                <option value="720P">720P</option>
                                <option value="1080P">1080P</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Prompt</label>
                            <textarea 
                                className="w-full border rounded px-2 py-1 text-sm h-24 font-mono"
                                value={node.data.prompt || ''}
                                onChange={e => handleChange('prompt', e.target.value)}
                                placeholder="Enter video generation prompt..."
                            />
                        </div>
                    </>
                )}

                {node.type === 'dataNode' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Operation</label>
                            <select 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.operation || 'Transform'}
                                onChange={e => handleChange('operation', e.target.value)}
                            >
                                <option value="Transform">Transform</option>
                                <option value="Filter">Filter</option>
                                <option value="Aggregate">Aggregate</option>
                                <option value="Format">Format</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Output Type</label>
                            <select 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.outputType || 'JSON'}
                                onChange={e => handleChange('outputType', e.target.value)}
                            >
                                <option value="JSON">JSON</option>
                                <option value="CSV">CSV</option>
                                <option value="Text">Text</option>
                                <option value="XML">XML</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Configuration</label>
                            <textarea 
                                className="w-full border rounded px-2 py-1 text-sm h-24 font-mono"
                                value={node.data.config || ''}
                                onChange={e => handleChange('config', e.target.value)}
                                placeholder="Enter data operation configuration..."
                            />
                        </div>
                    </>
                )}

                {node.type === 'conditionNode' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Condition</label>
                            <textarea 
                                className="w-full border rounded px-2 py-1 text-sm h-16 font-mono"
                                value={node.data.condition || ''}
                                onChange={e => handleChange('condition', e.target.value)}
                                placeholder="Enter condition (e.g., {{score}} > 80)"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">True Path Label</label>
                            <input 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.truePath || 'True'}
                                onChange={e => handleChange('truePath', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">False Path Label</label>
                            <input 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.falsePath || 'False'}
                                onChange={e => handleChange('falsePath', e.target.value)}
                            />
                        </div>
                    </>
                )}

                {node.type === 'loopNode' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Condition</label>
                            <textarea 
                                className="w-full border rounded px-2 py-1 text-sm h-16 font-mono"
                                value={node.data.condition || ''}
                                onChange={e => handleChange('condition', e.target.value)}
                                placeholder="Enter loop condition (e.g., {{iteration}} < 10)"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Max Iterations</label>
                            <input 
                                type="number" 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.maxIterations || 10}
                                onChange={e => handleChange('maxIterations', parseInt(e.target.value))}
                                min="1"
                                max="100"
                            />
                        </div>
                    </>
                )}

                {node.type === 'errorRetryNode' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Max Retries</label>
                            <input 
                                type="number" 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.maxRetries || 3}
                                onChange={e => handleChange('maxRetries', parseInt(e.target.value))}
                                min="1"
                                max="10"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Retry Delay (seconds)</label>
                            <input 
                                type="number" 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.retryDelay || 1}
                                onChange={e => handleChange('retryDelay', parseInt(e.target.value))}
                                min="1"
                                max="60"
                            />
                        </div>
                    </>
                )}

                {node.type === 'agentNode' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Agent Type</label>
                            <select 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.agentType || 'General'}
                                onChange={e => handleChange('agentType', e.target.value)}
                            >
                                <option value="General">General</option>
                                <option value="Coder">Coder</option>
                                <option value="Tester">Tester</option>
                                <option value="PM">Product Manager</option>
                                <option value="Marketer">Marketer</option>
                                <option value="Customer Support">Customer Support</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Expertise</label>
                            <input 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.expertise || ''}
                                onChange={e => handleChange('expertise', e.target.value)}
                                placeholder="e.g., JavaScript, Python, Marketing"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Instructions</label>
                            <textarea 
                                className="w-full border rounded px-2 py-1 text-sm h-24 font-mono"
                                value={node.data.instructions || ''}
                                onChange={e => handleChange('instructions', e.target.value)}
                                placeholder="Enter agent instructions..."
                            />
                        </div>
                    </>
                )}

                {node.type === 'toolNode' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Tool Type</label>
                            <select 
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={node.data.toolType || 'Google Search'}
                                onChange={e => handleChange('toolType', e.target.value)}
                            >
                                <option value="Google Search">Google Search</option>
                                <option value="Database Query">Database Query</option>
                                <option value="Custom API">Custom API</option>
                                <option value="File System">File System</option>
                                <option value="Weather API">Weather API</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Tool Configuration</label>
                            <textarea 
                                className="w-full border rounded px-2 py-1 text-sm h-24 font-mono"
                                value={node.data.toolConfig || ''}
                                onChange={e => handleChange('toolConfig', e.target.value)}
                                placeholder="Enter tool configuration (JSON)..."
                            />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            Example for Google Search: {`{"apiKey": "YOUR_API_KEY", "cx": "YOUR_CUSTOM_SEARCH_ENGINE_ID"}`}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
