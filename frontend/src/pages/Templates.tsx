import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Prompt } from '@/types';
import { useTranslation } from 'react-i18next';
import Comments from '@/components/Comments';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';
import { track } from '@/lib/analytics';

export default function Templates() {
  const { t } = useTranslation();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [sort, setSort] = useState<'featured' | 'trending' | 'new'>('featured');
  const [categories, setCategories] = useState<string[]>([]);
  const [forkingId, setForkingId] = useState<string | null>(null);
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicPrompts();
    track('templates_view', { category: category || 'all', sort, isLoggedIn: !!user?.id });
  }, [search, user?.id, category, sort]);

  useEffect(() => {
    promptService.getPublicCatalog().then((data) => {
      const list = data.categories || [];
      setCategories(list);
    }).catch(() => {});
  }, []);

  const fetchPublicPrompts = async () => {
    try {
      const data = await promptService.getPublic({
        search,
        category: category || undefined,
        sort,
      });
      setPrompts(data);
    } catch (err) {
      console.error('Failed to fetch public prompts', err);
      toast.error(t('templates.fetch_error') || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (promptId: string) => {
    if (!user?.id) {
        track('auth_gate_shown', { action: 'like', templateId: promptId, source: 'templates' });
        toast.error(t('auth.login_required') || 'Please login to like prompts');
        return;
    }
    try {
        const result = await promptService.like(promptId);
        track('template_like', { templateId: promptId, liked: result.liked });
        setPrompts(prev => prev.map(p => {
            if (p.id === promptId) {
                return {
                    ...p,
                    isLiked: result.liked,
                    likesCount: (p.likesCount || 0) + (result.liked ? 1 : -1)
                };
            }
            return p;
        }));
        if (result.liked) {
            toast.success('Liked!');
        }
    } catch (err) {
        console.error('Failed to like prompt', err);
        toast.error('Failed to like prompt');
    }
  };

  const handleFork = async (promptId: string) => {
    if (!user?.id) {
      track('auth_gate_shown', { action: 'fork', templateId: promptId, source: 'templates' });
      toast.error(t('auth.login_required') || 'Please login to fork prompts');
      return;
    }
    setForkingId(promptId);
    try {
      await promptService.fork(promptId);
      track('template_fork', { templateId: promptId, source: 'templates' });
      toast.success(t('templates.fork_success') || 'Prompt added to your library!');
      navigate('/prompts');
    } catch (err) {
      console.error('Failed to fork prompt', err);
      toast.error('Failed to fork prompt');
    } finally {
      setForkingId(null);
    }
  };

  const handleCopy = (promptId: string, content: string) => {
    navigator.clipboard.writeText(content);
    track('template_copy', { templateId: promptId, source: 'templates' });
    toast.success(t('common.copied') || 'Copied to clipboard');
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
      
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <BackButton to="/dashboard" />
            <h1 className="text-3xl font-bold mt-2 text-white">{t('templates.title')}</h1>
            <p className="text-gray-300 mt-1">{t('templates.subtitle')}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="w-full md:w-40 rounded-xl border border-gray-700 px-3 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition bg-gray-800/60 text-white"
            >
              <option value="featured">精选</option>
              <option value="trending">趋势</option>
              <option value="new">最新</option>
            </select>
            <div className="w-full md:w-1/3">
              <input
                type="text"
                placeholder={t('templates.search_placeholder')}
                className="w-full rounded-xl border border-gray-700 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition bg-gray-800/60 text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${!category ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-gray-700' : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:bg-gray-700/60'}`}
          >
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${category === c ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-gray-700' : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:bg-gray-700/60'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/60 rounded-2xl shadow-lg border border-gray-700">
             <div className="text-6xl mb-4">📭</div>
             <p className="text-gray-400 text-lg">{t('templates.no_results')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="flex flex-col rounded-2xl bg-gray-800/60 p-6 shadow-lg border border-gray-700 transition hover:shadow-xl hover:-translate-y-1 duration-300">
                <div className="mb-4">
                   <div className="flex flex-wrap gap-2 mb-3">
                     {prompt.tags && prompt.tags.map((tag, idx) => (
                       <span key={idx} className="rounded-full bg-blue-900/50 px-2.5 py-0.5 text-xs font-semibold text-blue-300 border border-blue-800/50">
                         {tag.name}
                       </span>
                     ))}
                   </div>
                   <h3 className="text-xl font-bold text-white line-clamp-1" title={prompt.title}>{prompt.title}</h3>
                   <div className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <span>by</span>
                      <span className="font-medium text-gray-300">User {prompt.userId}</span>
                   </div>
                </div>
                
                <div className="relative group flex-grow mb-4">
                    <p className="text-gray-300 text-sm font-mono bg-gray-700/50 p-4 rounded-xl border border-gray-700 line-clamp-5 min-h-[8rem]">
                    {prompt.content}
                    </p>
                    <button 
                        onClick={() => handleCopy(prompt.id, prompt.content)}
                        className="absolute top-2 right-2 p-1.5 bg-gray-800/60 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition border border-gray-700 hover:bg-gray-700/60 text-gray-300"
                        title="Copy content"
                    >
                        📋
                    </button>
                </div>
                
                <div className="border-t border-gray-700 pt-4 mt-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleLike(prompt.id)} 
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition ${prompt.isLiked ? 'bg-red-900/30 text-red-400' : 'hover:bg-gray-700/30 text-gray-400'}`}
                            >
                                <span className={`text-lg transition-transform ${prompt.isLiked ? 'scale-110' : ''}`}>{prompt.isLiked ? '❤️' : '🤍'}</span>
                                <span className="font-medium">{prompt.likesCount || 0}</span>
                            </button>
                            <button 
                                onClick={() => {
                                  const next = expandedCommentsId === prompt.id ? null : prompt.id;
                                  setExpandedCommentsId(next);
                                  if (next) track('template_comments_open', { templateId: prompt.id, source: 'templates' });
                                }}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition ${expandedCommentsId === prompt.id ? 'bg-blue-900/30 text-blue-400' : 'hover:bg-gray-700/30 text-gray-400'}`}
                            >
                                <span className="text-lg">💬</span>
                                <span className="font-medium">Comment</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm" title="Times used/forked">
                            <span className="text-lg">🔥</span>
                            <span>{prompt.usageCount || 0}</span>
                        </div>
                    </div>
                    
                    {expandedCommentsId === prompt.id && (
                        <div className="mb-4 animate-fade-in-down">
                            <Comments promptId={prompt.id} />
                        </div>
                    )}

                    <button
                    onClick={() => handleFork(prompt.id)}
                    disabled={forkingId === prompt.id}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2"
                    >
                    {forkingId === prompt.id ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            {t('templates.adding')}
                        </>
                    ) : (
                        <>
                            <span>📥</span>
                            {t('templates.add_library')}
                        </>
                    )}
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
