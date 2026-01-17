import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Prompt, ChainStep } from '@/types';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import BackButton from '@/components/BackButton';

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
  
  // Execution
  const [isRunning, setIsRunning] = useState(false);
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [initialVariables, setInitialVariables] = useState<Record<string, string>>({});
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');

  useEffect(() => {
    if (user?.id) {
      promptService.getAll(user.id).then(setAvailablePrompts);
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
    newSteps[index] = { ...newSteps[index], [field]: value };
    
    // If type changed, reset model name to default
    if (field === 'modelType') {
        newSteps[index].modelName = MODELS[value as string]?.[0]?.id || '';
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
      setSteps([...steps, { promptId: '', targetVariable: '', stepOrder: maxOrder + 1, modelType: 'text' }]);
  };

  const handleAddParallelStep = (order: number) => {
      setSteps([...steps, { promptId: '', targetVariable: '', stepOrder: order, modelType: 'text' }]);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!title.trim()) {
        toast.error(t('chains.title_required'));
        return;
    }

    const chainData = { 
      userId: user.id,
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
            <div className="flex gap-2">
                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 shadow-sm transition">
                    {t('common.save')}
                </button>
            </div>
        </div>

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
                                    <div key={step._originalIndex} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative group hover:shadow-md transition">
                                        <button 
                                            onClick={() => handleRemoveStep(step._originalIndex)} 
                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition"
                                        >
                                            &times;
                                        </button>
                                        
                                        <div className="mb-3">
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{t('chains.select_prompt')}</label>
                                            <select 
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-500"
                                                value={step.promptId}
                                                onChange={e => handleUpdateStep(step._originalIndex, 'promptId', e.target.value)}
                                            >
                                                <option value="">-- {t('playground.select_prompt')} --</option>
                                                {availablePrompts.map(p => (
                                                    <option key={p.id} value={p.id}>{p.title}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Type</label>
                                                <select 
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50"
                                                    value={step.modelType || 'text'}
                                                    onChange={e => handleUpdateStep(step._originalIndex, 'modelType', e.target.value)}
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="image">Image</option>
                                                    <option value="video">Video</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Model</label>
                                                <select 
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50"
                                                    value={step.modelName || ''}
                                                    onChange={e => handleUpdateStep(step._originalIndex, 'modelName', e.target.value)}
                                                >
                                                    <option value="">Default</option>
                                                    {MODELS[step.modelType || 'text']?.map(m => (
                                                        <option key={m.id} value={m.id}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{t('chains.target_variable')}</label>
                                            <input 
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-purple-500"
                                                value={step.targetVariable || ''}
                                                onChange={e => handleUpdateStep(step._originalIndex, 'targetVariable', e.target.value)}
                                                placeholder="variable (e.g. image_url)"
                                            />
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
                            {Object.entries(initialVariables).map(([k, v]) => (
                                <div key={k} className="flex gap-1 items-center">
                                    <div className="w-1/3 bg-white border rounded px-2 py-1 text-xs font-mono text-gray-600 truncate" title={k}>{k}</div>
                                    <div className="w-2/3 bg-white border rounded px-2 py-1 text-xs text-gray-800 truncate" title={v}>{v}</div>
                                    <button onClick={() => {
                                        const newVars = {...initialVariables};
                                        delete newVars[k];
                                        setInitialVariables(newVars);
                                    }} className="text-red-400 hover:text-red-600 px-1">&times;</button>
                                </div>
                            ))}
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
