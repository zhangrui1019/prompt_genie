import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Prompt } from '@/types';
import BackButton from '@/components/BackButton';

import MarkdownEditor from '@uiw/react-markdown-editor';

// Models configuration (names are product names, usually kept as is, but can be translated if needed)
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

export default function Playground() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Core State
  const [prompt, setPrompt] = useState('');
  const [variables, setVariables] = useState([{ key: '', value: '' }]);
  
  // Settings State
  const [mode, setMode] = useState('text');
  const [selectedModels, setSelectedModels] = useState<string[]>(['qwen-turbo']);

  // Configuration (Moved inside component or wrapped to use t)
  const MODES = [
    { id: 'text', label: t('common.text'), icon: '📝' },
    { id: 'image', label: t('common.image'), icon: '🖼️' },
    { id: 'video', label: t('common.video'), icon: '🎥' },
  ];
  const [videoParams, setVideoParams] = useState({ size: '1280*720', duration: 5, prompt_extend: true });
  const [imageParams, setImageParams] = useState({ size: '1024*1024', n: 1 });
  const [textParams, setTextParams] = useState({ temperature: 0.8, top_p: 0.8, enable_search: false });
  
  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Record<string, { loading: boolean, output: string, error: string }>>({});

  // Library State
  const [myPrompts, setMyPrompts] = useState<Prompt[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Knowledge Base State
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [selectedKbId, setSelectedKbId] = useState('');

  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Stats State
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({
      total_cost: 0,
      total_input_tokens: 0,
      total_output_tokens: 0,
      total_images: 0,
      total_videos: 0
  });

  useEffect(() => {
        if (user?.id) {
            // Fix: Do not pass user.id as search parameter. The backend uses the token to identify the user.
            promptService.getAll().then(setMyPrompts);
            promptService.getTags().then(setAvailableTags);
            promptService.getKnowledgeBases().then(setKnowledgeBases);
        }
    }, [user?.id]);

    useEffect(() => {
        const promptId = searchParams.get('promptId');
        const content = searchParams.get('content');

        if (promptId && myPrompts.length > 0) {
            handleSelectPrompt(promptId);
        } else if (content) {
            setPrompt(content);
            const matches = content.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
            if (matches) {
                const varKeys = [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()))];
                if (varKeys.length > 0) {
                    setVariables(varKeys.map(key => ({ key, value: '' })));
                }
            }
        }
    }, [searchParams, myPrompts]);

  const handleShowStats = async () => {
      if (user?.id) {
          const data = await promptService.getUsageStats();
          setStats(data);
          setShowStats(true);
      }
  };

  const getEstimatedCost = () => {
      let total = 0;
      selectedModels.forEach(modelId => {
          if (mode === 'text') {
              // Very rough estimate for display
              if (modelId.includes('turbo')) total += 0.005;
              else if (modelId.includes('plus')) total += 0.01;
              else if (modelId.includes('max')) total += 0.1;
              else total += 0.01;
          } else if (mode === 'image') {
              total += (imageParams.n || 1) * 0.2;
          } else if (mode === 'video') {
              total += 2.0;
          }
      });
      return total.toFixed(3);
  };

  useEffect(() => {
      if (MODELS[mode] && MODELS[mode].length > 0) {
          setSelectedModels([MODELS[mode][0].id]);
          setResults({});
      }
  }, [mode]);

  useEffect(() => {
      if (user?.id && showHistory) {
          promptService.getPlaygroundHistory().then(setHistory);
      }
  }, [user?.id, showHistory]);

  const loadHistory = (item: any) => {
      setPrompt(item.prompt);
      if (item.modelType) setMode(item.modelType);
      if (item.modelName) setSelectedModels([item.modelName]);
      
      if (item.variables) {
          try {
              const vars = typeof item.variables === 'string' ? JSON.parse(item.variables) : item.variables;
              setVariables(Object.entries(vars).map(([key, value]) => ({ key, value: String(value) })));
          } catch(e) {}
      }
      
      if (item.parameters) {
          try {
              const params = typeof item.parameters === 'string' ? JSON.parse(item.parameters) : item.parameters;
              if (item.modelType === 'video') setVideoParams(prev => ({...prev, ...params}));
              if (item.modelType === 'image') setImageParams(prev => ({...prev, ...params}));
              if (item.modelType === 'text') setTextParams(prev => ({...prev, ...params}));
          } catch(e) {}
      }
      
      if (item.result) {
          setResults({ [item.modelName]: { loading: false, output: item.result, error: '' } });
      }
      
      setShowHistory(false);
  };

  const handleSelectPrompt = (promptId: string) => {
    setSelectedPromptId(promptId);
    const selected = myPrompts.find(p => p.id === promptId);
    if (selected) {
        setPrompt(selected.content);
        
        let varKeys: string[] = [];
        // Priority 1: Metadata variables
        if (selected.variables && Object.keys(selected.variables).length > 0) {
            varKeys = Object.keys(selected.variables);
        } 
        // Priority 2: Regex extraction from content
        else if (selected.content) {
            const matches = selected.content.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
            if (matches) {
                varKeys = [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()))];
            }
        }

        if (varKeys.length > 0) {
            const newVars = varKeys.map(key => ({
                key,
                value: (selected.variables && selected.variables[key]) ? String(selected.variables[key]) : '' 
            }));
            setVariables(newVars);
        } else {
            setVariables([{ key: '', value: '' }]);
        }
    }
  };

  const filteredPrompts = selectedTag 
    ? myPrompts.filter(p => p.tags?.some(t => t.name === selectedTag))
    : myPrompts;

  const addVariable = () => {
    setVariables([...variables, { key: '', value: '' }]);
  };

  const updateVariable = (index: number, field: 'key' | 'value', value: string) => {
    const newVars = [...variables];
    newVars[index][field] = value;
    setVariables(newVars);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleUpdatePrompt = async () => {
    if (!selectedPromptId || !prompt) return;
    const originalPrompt = myPrompts.find(p => p.id === selectedPromptId);
    if (!originalPrompt) return;

    setIsUpdating(true);
    const updatedVariables: Record<string, string> = {};
    variables.forEach(v => {
        if (v.key) updatedVariables[v.key] = v.value;
    });

    try {
        await promptService.update(selectedPromptId, {
            ...originalPrompt,
            content: prompt,
            variables: updatedVariables
        });
        setMyPrompts(prev => prev.map(p => 
            p.id === selectedPromptId 
                ? { ...p, content: prompt, variables: updatedVariables }
                : p
        ));
        toast.success(t('playground.update_success'));
    } catch (err) {
        console.error(err);
        toast.error(t('playground.update_error'));
    } finally {
        setIsUpdating(false);
    }
  };

  const handleRun = async () => {
    if (!prompt || selectedModels.length === 0) return;
    
    setIsRunning(true);
    const initialResults: any = {};
    selectedModels.forEach(m => {
        initialResults[m] = { loading: true, output: '', error: '' };
    });
    setResults(initialResults);
    
    const varsMap = variables.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    // Determine parameters based on mode
    let params: Record<string, any> = {};
    if (mode === 'video') params = videoParams;
    else if (mode === 'image') params = imageParams;
    else if (mode === 'text') params = textParams;
    
    // Append Knowledge Base Context if selected
    let finalPrompt = prompt;
    if (selectedKbId) {
        try {
            const documents = await promptService.getDocuments(selectedKbId);
            // In a real implementation, we would fetch content on backend or here
            // For MVP, assume backend handles it if we pass kbId, OR fetch content here
            // Let's pass kbId in parameters for now and handle in backend
            params.kbId = selectedKbId;
        } catch (e) {
            console.error("Failed to attach knowledge base", e);
        }
    }

    const promises = selectedModels.map(async (modelId) => {
        try {
            const res = await promptService.runPlayground(prompt, varsMap, mode, modelId, params);
            setResults(prev => ({
                ...prev,
                [modelId]: { loading: false, output: res.result, error: '' }
            }));
            // Refresh history after run (if drawer open)
            if (showHistory) promptService.getPlaygroundHistory().then(setHistory);
        } catch (err) {
            setResults(prev => ({
                ...prev,
                [modelId]: { loading: false, output: '', error: 'Failed' }
            }));
        }
    });

    await Promise.all(promises);
    setIsRunning(false);
  };

  const toggleModel = (modelId: string) => {
      if (selectedModels.includes(modelId)) {
          if (selectedModels.length > 1) {
              setSelectedModels(selectedModels.filter(id => id !== modelId));
          }
      } else {
          setSelectedModels([...selectedModels, modelId]);
      }
  };

  const renderParameters = () => {
    if (mode === 'text') {
        return (
            <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 flex gap-6 text-sm flex-wrap items-end">
                <div className="flex flex-col gap-1 w-[200px]">
                    <div className="flex justify-between">
                        <label className="text-gray-500 font-bold text-xs uppercase">{t('common.temp')}</label>
                        <span className="text-xs text-gray-700 font-mono">{textParams.temperature}</span>
                    </div>
                    <input 
                        type="range" min="0" max="2" step="0.1"
                        value={textParams.temperature}
                        onChange={e => setTextParams({...textParams, temperature: parseFloat(e.target.value)})}
                        className="w-full accent-blue-600"
                    />
                </div>
                
                <div className="flex flex-col gap-1 w-[200px]">
                    <div className="flex justify-between">
                        <label className="text-gray-500 font-bold text-xs uppercase">{t('common.top_p')}</label>
                        <span className="text-xs text-gray-700 font-mono">{textParams.top_p}</span>
                    </div>
                    <input 
                        type="range" min="0" max="1" step="0.05"
                        value={textParams.top_p}
                        onChange={e => setTextParams({...textParams, top_p: parseFloat(e.target.value)})}
                        className="w-full accent-blue-600"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 font-bold text-xs uppercase mb-1">{t('common.search_web')}</label>
                    <button 
                        onClick={() => setTextParams({...textParams, enable_search: !textParams.enable_search})}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition ${
                            textParams.enable_search 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {textParams.enable_search ? t('common.on') : t('common.off')}
                    </button>
                </div>
            </div>
        );
    } else if (mode === 'video') {
        return (
            <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 flex gap-6 text-sm flex-wrap">
                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 font-bold text-xs uppercase">{t('common.resolution')}</label>
                    <select 
                      value={videoParams.size} 
                      onChange={e => setVideoParams({...videoParams, size: e.target.value})}
                      className="border rounded p-1.5 bg-white min-w-[150px]"
                    >
                        <option value="1280*720">720P (1280*720)</option>
                        <option value="1920*1080">1080P (1920*1080)</option>
                        <option value="1024*1024">{t('common.square')} (1024*1024)</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 font-bold text-xs uppercase">{t('common.duration')}</label>
                    <select 
                      value={videoParams.duration} 
                      onChange={e => setVideoParams({...videoParams, duration: parseInt(e.target.value)})}
                      className="border rounded p-1.5 bg-white min-w-[150px]"
                    >
                        <option value={5}>5 {t('common.seconds')}</option>
                        <option value={10}>10 {t('common.seconds')} (Wan 2.6 only)</option>
                    </select>
                </div>
                 <div className="flex flex-col gap-1">
                    <label className="text-gray-500 font-bold text-xs uppercase">{t('common.prompt_extend')}</label>
                    <select 
                      value={String(videoParams.prompt_extend)} 
                      onChange={e => setVideoParams({...videoParams, prompt_extend: e.target.value === 'true'})}
                      className="border rounded p-1.5 bg-white min-w-[100px]"
                    >
                        <option value="true">{t('common.on')}</option>
                        <option value="false">{t('common.off')}</option>
                    </select>
                </div>
            </div>
        );
    } else if (mode === 'image') {
        return (
            <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 flex gap-6 text-sm flex-wrap">
                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 font-bold text-xs uppercase">{t('common.resolution')}</label>
                    <select 
                      value={imageParams.size} 
                      onChange={e => setImageParams({...imageParams, size: e.target.value})}
                      className="border rounded p-1.5 bg-white min-w-[150px]"
                    >
                        <option value="1024*1024">{t('common.square')} (1024*1024)</option>
                        <option value="1280*720">{t('common.landscape')} (1280*720)</option>
                        <option value="720*1280">{t('common.portrait')} (720*1280)</option>
                    </select>
                </div>
                 <div className="flex flex-col gap-1">
                    <label className="text-gray-500 font-bold text-xs uppercase">{t('common.count')}</label>
                    <select 
                      value={imageParams.n} 
                      onChange={e => setImageParams({...imageParams, n: parseInt(e.target.value)})}
                      className="border rounded p-1.5 bg-white min-w-[80px]"
                    >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={4}>4</option>
                    </select>
                </div>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6 flex justify-between items-end">
            <div>
                <BackButton to="/dashboard" label={t('common.dashboard')} />
                <h1 className="text-3xl font-bold mt-2">{t('playground.title')}</h1>
            </div>
            
            <div className="flex gap-4 items-center">
                <button
                    onClick={handleShowStats}
                    className="px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition bg-white border border-gray-200 hover:bg-gray-50"
                >
                    <span>📊</span> {t('common.usage')}
                </button>

                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition border ${showHistory ? 'bg-gray-200 border-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                    <span>🕒</span> {t('common.history')}
                </button>

                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    {MODES.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition ${mode === m.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <span>{m.icon}</span> {m.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="mb-4 text-sm font-bold text-gray-500 uppercase tracking-wide">{t('playground.load_library')}</h2>
                <div className="space-y-3">
                    <select 
                        className="w-full rounded border p-2 text-sm bg-gray-50"
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                    >
                        <option value="">{t('playground.all_tags')}</option>
                        {availableTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                    </select>
                    <select 
                        className="w-full rounded border p-2 text-sm bg-gray-50"
                        value={selectedPromptId}
                        onChange={(e) => handleSelectPrompt(e.target.value)}
                    >
                        <option value="">{t('playground.select_prompt')}</option>
                        {filteredPrompts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    
                    <div className="pt-2 border-t border-gray-100">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Knowledge Base</label>
                        <select 
                            className="w-full rounded border p-2 text-sm bg-gray-50"
                            value={selectedKbId}
                            onChange={(e) => setSelectedKbId(e.target.value)}
                        >
                            <option value="">None</option>
                            {knowledgeBases.map(kb => <option key={kb.id} value={kb.id}>{kb.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{t('editor.content_label')}</h2>
                  <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/optimizer?content=${encodeURIComponent(prompt)}${selectedPromptId ? `&promptId=${selectedPromptId}` : ''}`)}
                        className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100 flex items-center gap-1"
                         disabled={!prompt}
                     >
                         <span>✨</span> {t('common.optimize')}
                     </button>
                    {selectedPromptId && (
                        <button 
                            onClick={handleUpdatePrompt}
                            disabled={isUpdating}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 disabled:opacity-50"
                        >
                            {isUpdating ? '...' : t('playground.update_button')}
                        </button>
                    )}
                  </div>
              </div>
              <div className="flex-1 border rounded overflow-hidden">
                <MarkdownEditor
                  value={prompt}
                  onChange={(value) => setPrompt(value)}
                  height="100%"
                  visible={true}
                  enableScroll={true}
                  style={{ height: '100%', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{t('playground.variables')}</h2>
                 <button onClick={addVariable} className="text-xs text-blue-600 font-bold hover:text-blue-800">+ ADD</button>
               </div>
               <div className="space-y-2 max-h-[200px] overflow-y-auto">
                   {variables.map((v, i) => (
                     <div key={i} className="flex gap-2">
                       <input
                         className="w-1/3 rounded border p-2 text-xs bg-gray-50"
                         placeholder="Key"
                         value={v.key}
                         onChange={(e) => updateVariable(i, 'key', e.target.value)}
                       />
                       <input
                         className="flex-1 rounded border p-2 text-xs bg-gray-50"
                         placeholder="Value"
                         value={v.value}
                         onChange={(e) => updateVariable(i, 'value', e.target.value)}
                       />
                       <button onClick={() => removeVariable(i)} className="text-gray-400 hover:text-red-500 px-1">&times;</button>
                     </div>
                   ))}
               </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 flex flex-col h-full space-y-6">
             
             {/* Model & Settings */}
             <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                 <div className="flex items-center justify-between">
                     <div className="flex gap-4 items-center">
                         <span className="text-sm font-bold text-gray-500 uppercase">{t('common.models')}:</span>
                         <div className="flex gap-2">
                             {MODELS[mode]?.map(m => (
                                 <button
                                    key={m.id}
                                    onClick={() => toggleModel(m.id)}
                                    className={`px-3 py-1.5 rounded text-sm font-medium border transition ${
                                        selectedModels.includes(m.id) 
                                            ? 'bg-purple-50 border-purple-200 text-purple-700' 
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                 >
                                     {m.name}
                                 </button>
                             ))}
                         </div>
                     </div>
                     
                     <div className="flex flex-col items-end mr-4">
                         <span className="text-xs text-gray-400 uppercase font-bold">{t('common.est_cost')}</span>
                         <span className="text-sm font-mono text-gray-600">~¥{getEstimatedCost()}</span>
                     </div>
                     
                     <button
                        onClick={handleRun}
                        disabled={isRunning || !prompt || selectedModels.length === 0}
                        className="px-8 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                     >
                        {isRunning ? t('playground.running') : t('common.run')}
                     </button>
                 </div>

                 {/* Dynamic Parameters Panel */}
                 {renderParameters()}
             </div>

             {/* Output Grid */}
             <div className={`grid gap-4 flex-1 ${selectedModels.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                 {selectedModels.map(modelId => {
                     const result = results[modelId];
                     const modelName = MODELS[mode]?.find(m => m.id === modelId)?.name || modelId;
                     
                     return (
                         <div key={modelId} className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[600px]">
                             <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                 <span className="font-bold text-gray-700 text-sm">{modelName}</span>
                                 {result?.output && (
                                     <button 
                                        onClick={() => {navigator.clipboard.writeText(result.output); toast.success(t('common.copied'));}}
                                        className="text-xs text-blue-500 hover:text-blue-700"
                                     >
                                         {t('common.copy')}
                                     </button>
                                 )}
                             </div>
                             
                             <div className="flex-1 p-4 overflow-auto bg-white">
                                 {result?.loading ? (
                                     <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">
                                         {t('common.generating')}
                                     </div>
                                 ) : result?.error ? (
                                     <div className="text-red-500 text-sm">{result.error}</div>
                                 ) : result?.output ? (
                                     mode === 'image' ? (
                                         <div className="flex items-center justify-center h-full bg-black/5 rounded">
                                             <img src={result.output} alt="Generated" className="max-w-full max-h-full object-contain rounded shadow-sm" />
                                         </div>
                                     ) : mode === 'video' ? (
                                         <div className="flex flex-col items-center justify-center h-full bg-black/5 rounded p-4">
                                             <video 
                                                src={result.output} 
                                                controls 
                                                className="max-w-full max-h-[400px] rounded shadow-sm mb-2"
                                                onError={(e) => console.error("Video load error", e)}
                                             >
                                                 Your browser does not support the video tag.
                                             </video>
                                             <a href={result.output} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                                                 {t('common.open_video')}
                                             </a>
                                         </div>
                                     ) : (
                                         <div className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                                             {result.output}
                                         </div>
                                     )
                                 ) : (
                                     <div className="flex items-center justify-center h-full text-gray-300 italic text-sm">
                                         {t('common.waiting_run')}
                                     </div>
                                 )}
                             </div>
                         </div>
                     );
                 })}
             </div>
          </div>
        </div>
      </div>

      {/* History Drawer */}
      {showHistory && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 animate-slide-in-right">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h2 className="font-bold text-gray-800">{t('common.execution_history')}</h2>
                  <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {history.length === 0 ? (
                      <div className="text-center text-gray-400 py-8 italic text-sm">{t('common.no_history')}</div>
                  ) : (
                      history.map(item => (
                          <div 
                              key={item.id} 
                              onClick={() => loadHistory(item)}
                              className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
                          >
                              <div className="flex justify-between items-start mb-2">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.modelType === 'video' ? 'bg-purple-100 text-purple-700' : item.modelType === 'image' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                                      {item.modelType || 'TEXT'}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                      {new Date(item.createdAt).toLocaleString()}
                                  </span>
                              </div>
                              <div className="text-xs font-semibold text-gray-700 mb-1">{item.modelName}</div>
                              <div className="text-xs text-gray-500 line-clamp-2 mb-2 font-mono bg-gray-50 p-1 rounded">
                                  {item.prompt}
                              </div>
                              {item.modelType === 'image' && item.result && (
                                  <img src={item.result} className="w-full h-24 object-cover rounded" alt="History" />
                              )}
                              {item.modelType === 'video' && item.result && (
                                  <div className="w-full h-24 bg-black rounded flex items-center justify-center text-white text-xs">Video Result</div>
                              )}
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}
      {showStats && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">{t('common.usage_stats')}</h2>
                      <button onClick={() => setShowStats(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
                          <span className="text-blue-700 font-bold">{t('common.total_cost')}</span>
                          <span className="text-2xl font-bold text-blue-800">¥ {Number(stats.total_cost).toFixed(4)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded border border-gray-100">
                              <div className="text-xs text-gray-500 uppercase">{t('common.input_tokens')}</div>
                              <div className="text-lg font-mono font-semibold">{stats.total_input_tokens}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border border-gray-100">
                              <div className="text-xs text-gray-500 uppercase">{t('common.output_tokens')}</div>
                              <div className="text-lg font-mono font-semibold">{stats.total_output_tokens}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border border-gray-100">
                              <div className="text-xs text-gray-500 uppercase">{t('common.images_gen')}</div>
                              <div className="text-lg font-mono font-semibold">{stats.total_images}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border border-gray-100">
                              <div className="text-xs text-gray-500 uppercase">{t('common.videos_gen')}</div>
                              <div className="text-lg font-mono font-semibold">{stats.total_videos}</div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="mt-6 text-center text-xs text-gray-400">
                      {t('common.cost_disclaimer')}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
