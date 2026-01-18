import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Prompt, ChainStep } from '@/types';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import BackButton from '@/components/BackButton';
import ChainCanvas from '@/components/ChainCanvas';
import { CHAIN_TEMPLATES, ChainTemplate } from '@/data/chainTemplates';

const MODELS: Record<string, { id: string; name: string }[]> = {
  text: [
    { id: 'qwen-turbo', name: 'Qwen Turbo' },
    { id: 'qwen-plus', name: 'Qwen Plus' },
    { id: 'qwen-max', name: 'Qwen Max' },
  ],
  image: [
    { id: 'wanx-v1', name: 'Wanx V1' },
    { id: 'wanx-sketch-to-image-v1', name: 'Wanx Sketch' },
  ],
  video: [
    { id: 'wan2.6-t2v', name: 'Wan 2.6 (1080P)' },
    { id: 'wanx2.1-t2v-turbo', name: 'Wanx 2.1 Turbo (720P)' },
    { id: 'wanx2.1-t2v-plus', name: 'Wanx 2.1 Plus (720P)' },
  ],
};

export default function ChainEditor() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<ChainStep[]>([]);
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [viewMode, setViewMode] = useState<'list' | 'canvas'>('list');
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  
  // Execution
  const [isRunning, setIsRunning] = useState(false);
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [initialVariables, setInitialVariables] = useState<Record<string, string>>({});
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');

  useEffect(() => {
    if (user?.id) {
      promptService.getAll().then(setAvailablePrompts);
      if (id) {
        promptService.getChain(id).then(chain => {
          setTitle(chain.title);
          setDescription(chain.description || '');
          // Ensure steps have stepOrder
          const loadedSteps = chain.steps || [];
          if (loadedSteps.length > 0 && loadedSteps[0].stepOrder === undefined) {
             loadedSteps.forEach((s, i) => s.stepOrder = i);
          }
          setSteps(loadedSteps);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }
  }, [user?.id, id]);

  const handleUpdateStep = (index: number, field: keyof ChainStep, value: any) => {
    const newSteps = [...steps];
    const currentStep = newSteps[index];
    
    // Handle parameter updates separately (they are stored as JSON string in ChainStep but we can parse/stringify or assume backend handles object if DTO changed)
    // The ChainStep type in frontend probably has parameters as string or object? 
    // Let's check types.ts or assume string based on backend entity.
    // If we want to store params, we need a field in ChainStep. 
    // Let's assume frontend ChainStep has `parameters` field which is an object or string.
    // If it's a string, we parse it.
    
    if (field === 'parameters') {
        // Value is the new parameters object
        newSteps[index] = { ...currentStep, parameters: JSON.stringify(value) };
    } else {
        newSteps[index] = { ...currentStep, [field]: value };
    }
    
    // Auto-populate initial variables when a prompt is selected
    if (field === 'promptId') {
        const selectedPrompt = availablePrompts.find(p => p.id === value);
        if (selectedPrompt && selectedPrompt.variables) {
            const newVars = { ...initialVariables };
            // Merge variables from the selected prompt
            Object.keys(selectedPrompt.variables).forEach(key => {
                if (newVars[key] === undefined) {
                    newVars[key] = selectedPrompt.variables[key] || '';
                }
            });
            setInitialVariables(newVars);
        }
    }

    // If type changed, reset model name to default and clear params
    if (field === 'modelType') {
        newSteps[index].modelName = MODELS[value as string]?.[0]?.id || '';
        // Reset params based on type
        if (value === 'video') newSteps[index].parameters = JSON.stringify({ size: '1280*720', duration: 5, prompt_extend: true });
        else if (value === 'image') newSteps[index].parameters = JSON.stringify({ size: '1024*1024', n: 1 });
        else if (value === 'text') newSteps[index].parameters = JSON.stringify({ temperature: 0.8, top_p: 0.8 });
        else newSteps[index].parameters = '{}';
    }
    
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  // Group steps for rendering
  const stepsByOrder = steps.reduce((acc, step, index) => {
      const order = step.stepOrder !== undefined ? step.stepOrder : index;
      if (!acc[order]) acc[order] = [];
      acc[order].push({ ...step, _originalIndex: index });
      return acc;
  }, {} as Record<number, (ChainStep & { _originalIndex: number })[]>);

  const sortedOrders = Object.keys(stepsByOrder).map(Number).sort((a, b) => a - b);

    const handleAddStage = () => {
        const maxOrder = sortedOrders.length > 0 ? Math.max(...sortedOrders) : -1;
        setSteps([...steps, { 
            promptId: '', 
            targetVariable: '', 
            stepOrder: maxOrder + 1, 
            modelType: 'text',
            modelName: 'qwen-turbo',
            parameters: JSON.stringify({ temperature: 0.8, top_p: 0.8 })
        }]);
    };

    const handleAddParallelStep = (order: number) => {
        setSteps([...steps, { 
            promptId: '', 
            targetVariable: '', 
            stepOrder: order, 
            modelType: 'text',
            modelName: 'qwen-turbo',
            parameters: JSON.stringify({ temperature: 0.8, top_p: 0.8 })
        }]);
    };

  const handleLoadTemplate = (template: ChainTemplate) => {
    if (steps.length > 0 && !window.confirm('This will overwrite current steps. Continue?')) {
        return;
    }
    
    // Deep copy steps
    const newSteps = template.steps.map(s => ({ ...s }));
    setSteps(newSteps);
    setTitle(template.title);
    setDescription(template.description);
    
    // Set initial variables from template
    if (template.variables) {
        setInitialVariables(template.variables);
    } else {
        setInitialVariables({});
    }

    setShowTemplatesModal(false);
    toast.success('Template loaded!');
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!title.trim()) {
        toast.error(t('chains.title_required'));
        return;
    }

    const chainData = { 
      title,
      description,
      steps: steps
    };

    try {
      if (id) {
        await promptService.updateChain(id, chainData);
        toast.success(t('chains.save_success'));
      } else {
        await promptService.createChain(chainData);
        toast.success(t('chains.save_success'));
      }
      navigate('/chains');
    } catch (err) {
      console.error(err);
      toast.error(t('chains.save_error'));
    }
  };

  const handleRun = async () => {
    if (!id) {
        toast.error(t('chains.save_to_run'));
        return;
    }
    setIsRunning(true);
    setExecutionResults([]);
    try {
        const results = await promptService.runChain(id, initialVariables);
        setExecutionResults(results);
        toast.success(t('chains.run_success'));
    } catch (err) {
        toast.error(t('chains.run_error'));
        console.error(err);
    } finally {
        setIsRunning(false);
    }
  };

  const addInitialVariable = () => {
      if (newVarKey) {
          setInitialVariables({...initialVariables, [newVarKey]: newVarValue});
          setNewVarKey('');
          setNewVarValue('');
      }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6 flex justify-between items-center">
            <BackButton to="/chains" label={t('common.back')} className="mb-0" />
            
            <div className="flex gap-4 items-center">
                 {/* View Mode Toggle */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        List View
                    </button>
                    <button 
                        onClick={() => setViewMode('canvas')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition ${viewMode === 'canvas' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Canvas View
                    </button>
                </div>

                <button 
                    onClick={() => setShowTemplatesModal(true)} 
                    className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded font-medium hover:bg-gray-50 shadow-sm transition flex items-center gap-2"
                >
                    <span>📚</span> Templates
                </button>

                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 shadow-sm transition">
                    {t('common.save')}
                </button>
            </div>
        </div>

        {/* Templates Modal */}
        {showTemplatesModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-fade-in-up">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
                        <button onClick={() => setShowTemplatesModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    <div className="p-6 overflow-y-auto bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CHAIN_TEMPLATES.map(template => (
                            <div key={template.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition group cursor-pointer" onClick={() => handleLoadTemplate(template)}>
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{template.icon}</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{template.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>
                                <div className="flex gap-2">
                                    {template.steps.map((s, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${s.modelType === 'image' ? 'bg-purple-400' : s.modelType === 'video' ? 'bg-pink-400' : 'bg-blue-400'}`}></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Column: Metadata */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                    <h2 className="text-lg font-bold mb-4 text-gray-800">Chain Settings</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('editor.title_label')}</label>
                        <input 
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Blog Post Workflow"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea 
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe what this chain does..."
                            rows={4}
                        />
                    </div>
                    <div className="text-xs text-gray-500">
                        <p>ID: {id || 'New'}</p>
                        <p>{steps.length} steps configured</p>
                    </div>
                </div>
            </div>

            {/* Middle Column: Steps (Canvas) */}
            <div className="lg:col-span-2 space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Workflow Stages</h2>
                </div>
                
                {viewMode === 'canvas' ? (
                    <ChainCanvas 
                        steps={steps} 
                        prompts={availablePrompts} 
                        onNodeClick={(idx) => {
                            // Optional: Scroll to list view or open sidebar editor
                            setViewMode('list');
                            // In a real app we might highlight the step or open a side panel
                        }} 
                    />
                ) : (
                    <>
                    {sortedOrders.map((order, stageIndex) => (
                    <div key={order} className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gray-200" style={{ display: stageIndex === sortedOrders.length - 1 ? 'none' : 'block' }}></div>
                        
                        <div className="flex items-center gap-2 mb-2">
                             <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm z-10">
                                {stageIndex + 1}
                             </div>
                             <h3 className="font-bold text-gray-700">{t('chains.step')} {stageIndex + 1}</h3>
                        </div>

                        <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stepsByOrder[order].map((step) => (
                                    <div key={step._originalIndex} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative group hover:shadow-md transition" data-testid={`chain-step-${step._originalIndex}`}>
                                        <button 
                                            onClick={() => handleRemoveStep(step._originalIndex)} 
                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition"
                                        >
                                            &times;
                                        </button>
                                        
                                        <div className="mb-3">
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{t('chains.select_prompt')}</label>
                                            <select 
                                                data-testid="step-prompt-select"
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-500"
                                                value={step.promptId}
                                                onChange={e => handleUpdateStep(step._originalIndex, 'promptId', e.target.value)}
                                            >
                                                <option value="">-- {t('playground.select_prompt')} --</option>
                                                {availablePrompts.map(p => (
                                                    <option key={p.id} value={p.id}>{p.title}</option>
                                                ))}
                                            </select>
                                            
                                            {/* Available Variables Hint */}
                                            {(() => {
                                                // Calculate variables available to THIS step (from previous steps)
                                                const prevSteps = steps.filter((_, idx) => idx < step._originalIndex);
                                                const availableVars = prevSteps
                                                    .filter(s => s.targetVariable)
                                                    .map(s => ({ name: s.targetVariable, stepIndex: steps.indexOf(s) + 1 }));

                                                if (availableVars.length > 0) {
                                                    return (
                                                        <div className="mt-2 text-[10px] text-gray-500 bg-blue-50 p-2 rounded border border-blue-100">
                                                            <span className="font-bold text-blue-700">{t('chains.available_vars')}</span>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {availableVars.map((v, i) => (
                                                                    <button 
                                                                        key={i}
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(`{{${v.name}}}`);
                                                                            toast.success(t('chains.copied'));
                                                                        }}
                                                                        className="bg-white border border-blue-200 text-blue-600 px-1.5 py-0.5 rounded hover:bg-blue-100 transition flex items-center gap-1 group"
                                                                        title={`${t('chains.copy_var')} (Step ${v.stepIndex})`}
                                                                    >
                                                                        <span className="font-mono">{`{{${v.name}}}`}</span>
                                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px]">📋</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{t('chains.type')}</label>
                                                <select 
                                                    data-testid="step-type-select"
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50"
                                                    value={step.modelType || 'text'}
                                                    onChange={e => handleUpdateStep(step._originalIndex, 'modelType', e.target.value)}
                                                >
                                                    <option value="text">{t('common.text')}</option>
                                                    <option value="image">{t('common.image')}</option>
                                                    <option value="video">{t('common.video')}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{t('chains.model')}</label>
                                                <select 
                                                    data-testid="step-model-select"
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50"
                                                    value={step.modelName || ''}
                                                    onChange={e => handleUpdateStep(step._originalIndex, 'modelName', e.target.value)}
                                                >
                                                    <option value="">{t('common.default')}</option>
                                                    {MODELS[step.modelType || 'text']?.map(m => (
                                                        <option key={m.id} value={m.id}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Variable Mapping */}
                                        {(() => {
                                            const selectedPrompt = availablePrompts.find(p => p.id === step.promptId);
                                            if (selectedPrompt) {
                                                // Try to get variables from metadata, fallback to extracting from content
                                                let varKeys: string[] = [];
                                                if (selectedPrompt.variables && Object.keys(selectedPrompt.variables).length > 0) {
                                                    varKeys = Object.keys(selectedPrompt.variables);
                                                } else if (selectedPrompt.content) {
                                                    const matches = selectedPrompt.content.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
                                                    if (matches) {
                                                        varKeys = [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()))];
                                                    }
                                                }

                                                if (varKeys.length > 0) {
                                                    const inputMappings = step.inputMappings ? JSON.parse(step.inputMappings) : {};
                                                    
                                                    return (
                                                        <div className="mb-3 bg-blue-50 p-2 rounded border border-blue-100">
                                                        <label className="block text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide flex justify-between">
                                                            <span>{t('chains.input_mappings')}</span>
                                                            <span className="text-[10px] font-normal normal-case text-blue-500 opacity-70">{t('chains.map_input_desc')}</span>
                                                        </label>
                                                        <div className="space-y-2">
                                                            {varKeys.map(varKey => (
                                                                <div key={varKey} className="flex items-center gap-2">
                                                                    <div className="w-1/3 text-xs font-mono text-gray-600 truncate" title={varKey}>{varKey}</div>
                                                                    <div className="w-2/3 relative">
                                                                        <input 
                                                                            className="w-full border border-blue-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                                                            placeholder={(selectedPrompt.variables && selectedPrompt.variables[varKey] ? String(selectedPrompt.variables[varKey]) : "") || t('chains.value_placeholder')}
                                                                            value={inputMappings[varKey] || ''}
                                                                            onChange={e => {
                                                                                const newMappings = { ...inputMappings, [varKey]: e.target.value };
                                                                                handleUpdateStep(step._originalIndex, 'inputMappings', JSON.stringify(newMappings));
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    );
                                                }
                                            }
                                            return null;
                                        })()}

                                        {/* Parameter Configuration */}
                                        <div className="mb-3 bg-gray-50 p-2 rounded border border-gray-100" data-testid="step-params">
                                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">{t('chains.parameters')}</label>
                                            {(() => {
                                                const params = step.parameters ? JSON.parse(step.parameters) : {};
                                                const type = step.modelType || 'text';
                                                
                                                if (type === 'text') return (
                                                    <>
                                                        {/* Simplified Creativity Control for Text */}
                                                        <div className="mb-2">
                                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{t('chains.creativity')}</label>
                                                            <div className="flex bg-gray-200 rounded p-1">
                                                                {['Precise', 'Balanced', 'Creative'].map((level) => {
                                                                    const tVal = params.temperature ?? 0.8;
                                                                    const isActive = 
                                                                        (level === 'Precise' && tVal <= 0.3) ||
                                                                        (level === 'Balanced' && tVal > 0.3 && tVal < 0.9) ||
                                                                        (level === 'Creative' && tVal >= 0.9);
                                                                    
                                                                    return (
                                                                        <button
                                                                            key={level}
                                                                            onClick={() => {
                                                                                let t = 0.8, p = 0.8;
                                                                                if (level === 'Precise') { t = 0.2; p = 0.1; }
                                                                                if (level === 'Balanced') { t = 0.7; p = 0.8; }
                                                                                if (level === 'Creative') { t = 1.0; p = 0.95; }
                                                                                handleUpdateStep(step._originalIndex, 'parameters', {...params, temperature: t, top_p: p});
                                                                            }}
                                                                            className={`flex-1 text-xs py-1 rounded transition ${isActive ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                                                                        >
                                                                            {t(`chains.creativity_levels.${level.toLowerCase()}`)}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2 border-t border-gray-200 border-dashed pt-2 mt-2">
                                                            <div className="flex-1">
                                                                <label className="text-[10px] text-gray-500 block">Temp: {params.temperature ?? 0.8}</label>
                                                                <input 
                                                                    type="range" min="0" max="2" step="0.1" 
                                                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                    value={params.temperature ?? 0.8}
                                                                    onChange={e => handleUpdateStep(step._originalIndex, 'parameters', {...params, temperature: parseFloat(e.target.value)})}
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="text-[10px] text-gray-500 block">Top P: {params.top_p ?? 0.8}</label>
                                                                <input 
                                                                    type="range" min="0" max="1" step="0.05" 
                                                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                    value={params.top_p ?? 0.8}
                                                                    onChange={e => handleUpdateStep(step._originalIndex, 'parameters', {...params, top_p: parseFloat(e.target.value)})}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                                
                                                if (type === 'image') return (
                                                    <div className="flex gap-2">
                                                        <select 
                                                            className="flex-1 text-xs border rounded p-1"
                                                            value={params.size || '1024*1024'}
                                                            onChange={e => handleUpdateStep(step._originalIndex, 'parameters', {...params, size: e.target.value})}
                                                        >
                                                            <option value="1024*1024">Square</option>
                                                            <option value="1280*720">Landscape</option>
                                                            <option value="720*1280">Portrait</option>
                                                        </select>
                                                        <select 
                                                            className="w-16 text-xs border rounded p-1"
                                                            value={params.n || 1}
                                                            onChange={e => handleUpdateStep(step._originalIndex, 'parameters', {...params, n: parseInt(e.target.value)})}
                                                        >
                                                            <option value={1}>1</option>
                                                            <option value={2}>2</option>
                                                            <option value={4}>4</option>
                                                        </select>
                                                    </div>
                                                );
                                                
                                                if (type === 'video') return (
                                                    <div className="flex gap-2 flex-wrap">
                                                        <select 
                                                            className="flex-1 text-xs border rounded p-1"
                                                            value={params.size || '1280*720'}
                                                            onChange={e => handleUpdateStep(step._originalIndex, 'parameters', {...params, size: e.target.value})}
                                                        >
                                                            <option value="1280*720">720P</option>
                                                            <option value="1920*1080">1080P</option>
                                                        </select>
                                                        <select 
                                                            className="w-20 text-xs border rounded p-1"
                                                            value={params.duration || 5}
                                                            onChange={e => handleUpdateStep(step._originalIndex, 'parameters', {...params, duration: parseInt(e.target.value)})}
                                                        >
                                                            <option value={5}>5s</option>
                                                            <option value={10}>10s</option>
                                                        </select>
                                                        <div className="flex items-center gap-1">
                                                            <input 
                                                                type="checkbox"
                                                                checked={params.prompt_extend !== false}
                                                                onChange={e => handleUpdateStep(step._originalIndex, 'parameters', {...params, prompt_extend: e.target.checked})}
                                                            />
                                                            <span className="text-[10px] text-gray-500">Extend</span>
                                                        </div>
                                                    </div>
                                                );
                                                
                                                return null;
                                            })()}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{t('chains.target_variable')}</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
                                                    <span className="text-xs">Example:</span>
                                                </div>
                                                <input 
                                                    className="w-full border border-gray-300 rounded pl-16 px-2 py-1.5 text-sm font-mono bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-purple-500"
                                                    value={step.targetVariable || ''}
                                                    onChange={e => handleUpdateStep(step._originalIndex, 'targetVariable', e.target.value)}
                                                    placeholder={step.modelType === 'image' ? 'image_url' : 'result_text'}
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                Use this variable in next steps as <span className="font-mono bg-gray-100 px-1 rounded">{'{{'}{step.targetVariable || 'variable'}{'}}'}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                
                                <button 
                                    onClick={() => handleAddParallelStep(order)}
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition min-h-[160px]"
                                >
                                    <span className="text-2xl mb-1">+</span>
                                    <span className="text-xs font-bold">{t('chains.add_parallel')}</span>
                                </button>
                            </div>
                        </div>
                        
                        {stageIndex < sortedOrders.length - 1 && (
                            <div className="h-8 flex justify-center items-center ml-8">
                                <div className="w-0.5 h-full bg-gray-200"></div>
                            </div>
                        )}
                    </div>
                ))}
                
                <div className="pt-4 ml-8">
                    <button 
                        onClick={handleAddStage} 
                        className="bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-black shadow-lg hover:shadow-xl transition flex items-center gap-2 transform active:scale-95"
                    >
                        <span className="text-xl">+</span> {t('chains.add_stage')}
                    </button>
                </div>
                </>
                )}
            </div>

            {/* Right Column: Execution */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="text-xl">🚀</span> {t('chains.run_chain')}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">Provide initial variables for the first step.</p>
                    
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                         <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('chains.initial_inputs')}</h3>
                         <div className="space-y-2 mb-3">
                            {(() => {
                                // Calculate variables generated by steps (Output Variables)
                                const generatedVariables = steps.reduce((acc, step, index) => {
                                    if (step.targetVariable) {
                                        acc[step.targetVariable] = index + 1; // Map variable name to Step Number
                                    }
                                    return acc;
                                }, {} as Record<string, number>);

                                return Object.entries(initialVariables).map(([k, v]) => {
                                    const sourceStep = generatedVariables[k];
                                    
                                    if (sourceStep) {
                                        // This variable is generated by a previous step
                                        return (
                                            <div key={k} className="flex gap-1 items-center opacity-70">
                                                <div className="w-1/3 bg-gray-100 border rounded px-2 py-1 text-xs font-mono text-gray-500 truncate" title={k}>{k}</div>
                                                <div className="w-2/3 border border-dashed border-blue-200 bg-blue-50 rounded px-2 py-1 text-xs text-blue-600 flex items-center gap-1 cursor-help" title={`This variable will be automatically populated by the output of Step ${sourceStep}`}>
                                                    <span className="text-[10px]">🔗</span> From Step {sourceStep}
                                                </div>
                                                <button onClick={() => {
                                                    const newVars = {...initialVariables};
                                                    delete newVars[k];
                                                    setInitialVariables(newVars);
                                                }} className="text-gray-300 hover:text-red-400 px-1">&times;</button>
                                            </div>
                                        );
                                    }

                                    // Standard User Input Variable
                                    return (
                                        <div key={k} className="flex gap-1 items-center">
                                            <div className="w-1/3 bg-gray-50 border rounded px-2 py-1 text-xs font-mono text-gray-600 truncate" title={k}>{k}</div>
                                            <input 
                                                className="w-2/3 border rounded px-2 py-1 text-xs text-gray-800 outline-none focus:border-blue-500 transition" 
                                                value={v}
                                                onChange={(e) => setInitialVariables({...initialVariables, [k]: e.target.value})}
                                                placeholder="Value"
                                            />
                                            <button onClick={() => {
                                                const newVars = {...initialVariables};
                                                delete newVars[k];
                                                setInitialVariables(newVars);
                                            }} className="text-red-400 hover:text-red-600 px-1">&times;</button>
                                        </div>
                                    );
                                });
                            })()}
                            {Object.keys(initialVariables).length === 0 && <div className="text-xs text-gray-400 italic text-center py-2">{t('chains.no_vars')}</div>}
                         </div>
                         
                         <div className="flex gap-2">
                             <input 
                                value={newVarKey}
                                onChange={e => setNewVarKey(e.target.value)}
                                placeholder="Key" 
                                className="w-1/3 border rounded px-2 py-1 text-sm outline-none focus:border-blue-500" 
                             />
                             <input 
                                value={newVarValue}
                                onChange={e => setNewVarValue(e.target.value)}
                                placeholder="Value" 
                                className="w-2/3 border rounded px-2 py-1 text-sm outline-none focus:border-blue-500" 
                             />
                             <button onClick={addInitialVariable} className="bg-blue-100 text-blue-600 px-2 rounded hover:bg-blue-200 font-bold">+</button>
                         </div>
                    </div>

                    <button 
                        onClick={handleRun}
                        disabled={isRunning || !id}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                    >
                        {isRunning ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('playground.running')}
                            </span>
                        ) : t('chains.run_chain')}
                    </button>

                    {!id && <p className="text-xs text-red-500 mt-2 text-center">{t('chains.save_to_run')}</p>}

                    {executionResults.length > 0 && (
                        <div className="mt-8 space-y-4 animate-fade-in">
                            <h3 className="font-bold border-b pb-2 text-gray-800">{t('playground.output_label')}</h3>
                            {executionResults.map((res, i) => (
                                <div key={i} className="text-sm">
                                    <div className="font-semibold text-gray-700 mb-1 flex justify-between">
                                        <span>{t('chains.step')} {res.step + 1}: {res.promptTitle}</span>
                                        <button 
                                            className="text-xs text-blue-500 hover:text-blue-700"
                                            onClick={() => {
                                                navigator.clipboard.writeText(res.output);
                                                toast.success(t('chains.copied'));
                                            }}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-60 overflow-y-auto whitespace-pre-wrap font-mono text-gray-600 text-xs leading-relaxed">
                                        {res.output && (res.output.startsWith('http') ? (
                                            res.output.includes('.mp4') || res.output.includes('video') ? (
                                                <div className="flex flex-col gap-2">
                                                    <video src={res.output} controls className="w-full rounded shadow-sm" />
                                                    <a href={res.output} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Open Video</a>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    <img src={res.output} alt="Generated" className="w-full rounded shadow-sm" />
                                                    <a href={res.output} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Open Image</a>
                                                </div>
                                            )
                                        ) : (
                                            res.output
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
