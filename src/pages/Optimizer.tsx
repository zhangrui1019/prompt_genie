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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <BackButton to="/dashboard" label={t('common.dashboard')} />
          <h1 className="text-3xl font-bold mt-4">{t('optimizer.title')}</h1>
          <p className="text-gray-600">{t('optimizer.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">{t('optimizer.input_label')}</h2>
            
            <div className="mb-4 bg-gray-50 p-4 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('playground.load_library')}</label>
                <div className="flex gap-2">
                    <select 
                        className="w-1/3 rounded border p-2 text-sm"
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                    >
                        <option value="">{t('playground.all_tags')}</option>
                        {availableTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                    <select 
                        className="flex-1 rounded border p-2 text-sm"
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
              className="h-64 w-full rounded border p-3 focus:border-blue-500 focus:outline-none"
              placeholder={t('optimizer.placeholder')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="mt-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('optimizer.goal_label')}</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded border p-2 bg-white"
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
                className={`rounded bg-purple-600 px-6 py-2 font-bold text-white hover:bg-purple-700 ${loading || !prompt ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {loading ? t('optimizer.analyzing') : t('optimizer.analyze_button')}
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">{t('optimizer.suggestion_label')}</h2>
            {result ? (
              <>
                <div className="h-64 overflow-auto rounded bg-gray-50 p-4 border whitespace-pre-wrap mb-4">
                  {result.optimizedPrompt}
                </div>
                
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="mb-4 bg-blue-50 p-4 rounded border border-blue-100">
                    <h3 className="font-semibold text-blue-800 mb-2 text-sm">{t('optimizer.ai_suggestions')}</h3>
                    <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                      {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                   <button 
                     className="rounded border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-100 flex items-center gap-1"
                     onClick={() => {
                        setPrompt(result.optimizedPrompt);
                        toast.success(t('optimizer.accepted'));
                     }}
                   >
                     <span>✅</span> {t('optimizer.accept_button')}
                   </button>
                   <button 
                     className="rounded border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 flex items-center gap-1"
                     onClick={() => navigate(`/playground?content=${encodeURIComponent(result.optimizedPrompt)}${selectedPromptId ? `&promptId=${selectedPromptId}` : ''}`)}
                   >
                     <span>▶️</span> {t('optimizer.run_in_playground')}
                   </button>
                   <button className="text-sm text-blue-600 hover:text-blue-800 font-medium" onClick={copyToClipboard}>
                     {t('optimizer.copy_clipboard')}
                   </button>
                </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-400">
                {loading ? t('optimizer.loading_msg') : t('optimizer.empty_msg')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
