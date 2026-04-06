import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Prompt } from '@/types';
import BackButton from '@/components/BackButton';

export default function Optimizer() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('clarity');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ optimizedPrompt: string; suggestions: string[] } | null>(null);

  // Library selection
  const [myPrompts, setMyPrompts] = useState<Prompt[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState('');

  useEffect(() => {
        if (user?.id) {
            // Fix: Do not pass user.id as search parameter. Backend infers user from token.
            promptService.getAll().then(setMyPrompts);
            promptService.getTags().then(setAvailableTags);
        }
    }, [user?.id]);

    useEffect(() => {
        const promptId = searchParams.get('promptId');
        const content = searchParams.get('content');

        if (promptId) {
            handleSelectPrompt(promptId);
        } else if (content) {
            setPrompt(content);
        }
    }, [searchParams, myPrompts]);

  const handleSelectPrompt = (promptId: string) => {
    setSelectedPromptId(promptId);
    const selected = myPrompts.find(p => p.id === promptId);
    if (selected) {
        setPrompt(selected.content);
    }
  };

  const filteredPrompts = selectedTag 
    ? myPrompts.filter(p => p.tags?.some(t => t.name === selectedTag))
    : myPrompts;

  const handleOptimize = async () => {
    if (!prompt) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await promptService.optimize(prompt, type);
      setResult(data);
      toast.success(t('optimizer.success_msg') || 'Optimization complete!');
    } catch (err) {
      console.error('Optimization failed', err);
      toast.error(t('optimizer.error_msg'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
      if (result?.optimizedPrompt) {
          navigator.clipboard.writeText(result.optimizedPrompt);
          toast.success('Copied to clipboard');
      }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background SVG lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.15)" />
            </linearGradient>
          </defs>
          <line 
            x1="50" y1="150" x2="950" y2="150" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="30,15" 
            className="animate-draw-line"
          />
          <line 
            x1="50" y1="350" x2="950" y2="350" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="20,20" 
            className="animate-draw-line animation-delay-200"
          />
          <line 
            x1="50" y1="550" x2="950" y2="550" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="15,25" 
            className="animate-draw-line animation-delay-400"
          />
          <line 
            x1="50" y1="750" x2="950" y2="750" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="25,10" 
            className="animate-draw-line animation-delay-600"
          />
        </svg>
      </div>
      
      <div className="w-full max-w-[1600px] mx-auto p-6 z-10">
        <div className="mb-8">
          <BackButton to="/dashboard" label={t('common.dashboard')} />
          <h1 className="text-3xl font-bold mt-4 text-white">{t('optimizer.title')}</h1>
          <p className="text-gray-300">{t('optimizer.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-xl bg-gray-800/60 p-6 shadow-lg border border-gray-700">
            <h2 className="mb-4 text-xl font-semibold text-white">{t('optimizer.input_label')}</h2>
            
            <div className="mb-4 bg-gray-700/50 p-4 rounded border border-gray-600">
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('playground.load_library')}</label>
                <div className="flex gap-2">
                    <select 
                        className="w-1/3 rounded border border-gray-600 bg-gray-800 p-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                    >
                        <option value="">{t('playground.all_tags')}</option>
                        {availableTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                    <select 
                        className="flex-1 rounded border border-gray-600 bg-gray-800 p-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedPromptId}
                        onChange={(e) => handleSelectPrompt(e.target.value)}
                    >
                        <option value="">{t('playground.select_prompt')}</option>
                        {filteredPrompts.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <textarea
              className="h-64 w-full rounded border border-gray-600 bg-gray-800 p-3 text-gray-300 focus:border-blue-500 focus:outline-none"
              placeholder={t('optimizer.placeholder')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="mt-4 mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">{t('optimizer.goal_label')}</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="clarity">{t('optimizer.goal_clarity')}</option>
                <option value="creativity">{t('optimizer.goal_creativity')}</option>
                <option value="structure">{t('optimizer.goal_structure')}</option>
                <option value="general">{t('optimizer.goal_general')}</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleOptimize}
                disabled={loading || !prompt}
                className={`rounded bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 font-bold text-white hover:from-blue-700 hover:to-purple-700 transition ${loading || !prompt ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {loading ? t('optimizer.analyzing') : t('optimizer.analyze_button')}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-gray-800/60 p-6 shadow-lg border border-gray-700">
            <h2 className="mb-4 text-xl font-semibold text-white">{t('optimizer.suggestion_label')}</h2>
            {result ? (
              <>
                <div className="h-64 overflow-auto rounded bg-gray-700/50 p-4 border border-gray-600 whitespace-pre-wrap mb-4 text-gray-300">
                  {result.optimizedPrompt}
                </div>
                
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="mb-4 bg-blue-900/30 p-4 rounded border border-blue-700/50">
                    <h3 className="font-semibold text-blue-400 mb-2 text-sm">{t('optimizer.ai_suggestions')}</h3>
                    <ul className="list-disc pl-5 text-sm text-blue-300 space-y-1">
                      {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                   <button 
                     className="rounded border border-green-700 bg-green-900/30 px-3 py-1 text-sm font-medium text-green-400 hover:bg-green-800/30 flex items-center gap-1"
                     onClick={() => {
                        setPrompt(result.optimizedPrompt);
                        toast.success(t('optimizer.accepted'));
                     }}
                   >
                     <span>✅</span> {t('optimizer.accept_button')}
                   </button>
                   <button 
                     className="rounded border border-blue-700 bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-400 hover:bg-blue-800/30 flex items-center gap-1"
                     onClick={() => navigate(`/playground?content=${encodeURIComponent(result.optimizedPrompt)}${selectedPromptId ? `&promptId=${selectedPromptId}` : ''}`)}
                   >
                     <span>▶️</span> {t('optimizer.run_in_playground')}
                   </button>
                   <button className="text-sm text-blue-400 hover:text-blue-300 font-medium" onClick={copyToClipboard}>
                     {t('optimizer.copy_clipboard')}
                   </button>
                </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center rounded border-2 border-dashed border-gray-600 text-gray-400">
                {loading ? t('optimizer.loading_msg') : t('optimizer.empty_msg')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
