import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { PromptChain } from '@/types';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import BackButton from '@/components/BackButton';

export default function ChainRunner() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  
  const [chain, setChain] = useState<PromptChain | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [requiredInputs, setRequiredInputs] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id && id) {
      loadChain();
    }
  }, [user?.id, id]);

  const loadChain = async () => {
    try {
      if (!id) return;
      const data = await promptService.getChain(id);
      setChain(data);
      analyzeInputs(data);
    } catch (err) {
      toast.error('Failed to load chain');
    } finally {
      setLoading(false);
    }
  };

  const analyzeInputs = (chain: PromptChain) => {
    const generatedVars = new Set<string>();
    const required = new Set<string>();

    // Sort steps just in case
    const steps = [...(chain.steps || [])].sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));

    steps.forEach(step => {
        // 1. Check variables used in prompt
        let varKeys: string[] = [];
        if (step.prompt?.variables) {
            varKeys = Object.keys(step.prompt.variables);
        } else if (step.prompt?.content) {
            const matches = step.prompt.content.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
            if (matches) {
                varKeys = matches.map(m => m.replace(/\{\{|\}\}/g, '').trim());
            }
        }

        // 2. Check Input Mappings
        let mappings: Record<string, string> = {};
        if (step.inputMappings) {
            try {
                mappings = JSON.parse(step.inputMappings);
            } catch (e) {}
        }

        varKeys.forEach(key => {
            // Check if mapped
            const mappedValue = mappings[key];
            if (mappedValue && mappedValue.startsWith('{{') && mappedValue.endsWith('}}')) {
                // It depends on another variable
                const depVar = mappedValue.slice(2, -2).trim();
                if (!generatedVars.has(depVar)) {
                    required.add(depVar);
                }
            } else if (!mappedValue) {
                // No mapping, assumes variable name matches
                if (!generatedVars.has(key)) {
                    required.add(key);
                }
            }
        });

        // Add output variable to generated set
        if (step.targetVariable) {
            generatedVars.add(step.targetVariable);
        }
    });

    const reqList = Array.from(required);
    setRequiredInputs(reqList);
    
    // Initialize inputs state
    const initial: Record<string, string> = {};
    reqList.forEach(k => initial[k] = '');
    setInputs(initial);
  };

  const handleRun = async () => {
    if (!id) return;
    setIsRunning(true);
    setResults([]);
    try {
      const res = await promptService.runChain(id, inputs);
      setResults(res);
      toast.success(t('chains.run_success'));
    } catch (err) {
      toast.error(t('chains.run_error'));
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;
  if (!chain) return <div className="p-8 text-center">Chain not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <BackButton to="/chains" label={t('common.back')} />
        
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{chain.title}</h1>
            <p className="text-gray-600 mb-8">{chain.description}</p>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-8">
                <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <span>⚡</span> {t('chains.initial_inputs')}
                </h2>
                
                {requiredInputs.length === 0 ? (
                    <p className="text-gray-500 italic text-sm mb-4">No input variables detected.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {requiredInputs.map(key => (
                            <div key={key}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{key}</label>
                                <input 
                                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={inputs[key] || ''}
                                    onChange={e => setInputs({...inputs, [key]: e.target.value})}
                                    placeholder={`Enter value for ${key}`}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <button 
                    onClick={handleRun}
                    disabled={isRunning}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isRunning ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Running...
                        </>
                    ) : (
                        <>
                            <span>▶️</span> Run Workflow
                        </>
                    )}
                </button>
            </div>

            {/* Logs / Results */}
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-xl font-bold text-gray-900">Execution Log</h2>
                    {results.length > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const text = results.map(r => `Step ${r.step + 1} (${r.promptTitle}):\n${r.output}`).join('\n\n---\n\n');
                                    const blob = new Blob([text], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${chain.title}_results_${new Date().toISOString().slice(0,10)}.txt`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    toast.success('Results downloaded');
                                }}
                                className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
                            >
                                <span>⬇️</span> Download
                            </button>
                            <button
                                onClick={() => {
                                    const text = results.map(r => `Step ${r.step + 1} (${r.promptTitle}):\n${r.output}`).join('\n\n---\n\n');
                                    navigator.clipboard.writeText(text);
                                    toast.success(t('common.copied'));
                                }}
                                className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
                            >
                                <span>📋</span> Copy All
                            </button>
                        </div>
                    )}
                </div>
                
                {results.length === 0 && !isRunning && (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Ready to run
                    </div>
                )}

                {results.map((res, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm animate-fade-in-up">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">Step {res.step + 1}</span>
                                <span className="font-bold text-gray-700">{res.promptTitle}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {res._targetVariable && (
                                    <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                        ➜ {res._targetVariable}
                                    </span>
                                )}
                                <button 
                                    onClick={() => {
                                        const val = typeof res.output === 'string' ? res.output : JSON.stringify(res.output, null, 2);
                                        navigator.clipboard.writeText(val);
                                        toast.success(t('common.copied'));
                                    }}
                                    className="text-gray-400 hover:text-blue-600"
                                    title={t('common.copy')}
                                >
                                    📋
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50/30">
                            <div className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                                {typeof res.output === 'string' ? res.output : JSON.stringify(res.output, null, 2)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}