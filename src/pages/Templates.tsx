import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Prompt } from '@/types';
import { useTranslation } from 'react-i18next';
import Comments from '@/components/Comments';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';

export default function Templates() {
  const { t } = useTranslation();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [forkingId, setForkingId] = useState<string | null>(null);
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicPrompts();
  }, [search, user?.id]);

  const fetchPublicPrompts = async () => {
    try {
      const data = await promptService.getPublic(search);
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
        toast.error(t('auth.login_required') || 'Please login to like prompts');
        return;
    }
    try {
        const result = await promptService.like(promptId);
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
      toast.error(t('auth.login_required') || 'Please login to fork prompts');
      return;
    }
    setForkingId(promptId);
    try {
      await promptService.fork(promptId);
      toast.success(t('templates.fork_success') || 'Prompt added to your library!');
      navigate('/prompts');
    } catch (err) {
      console.error('Failed to fork prompt', err);
      toast.error('Failed to fork prompt');
    } finally {
      setForkingId(null);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(t('common.copied') || 'Copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <BackButton to="/dashboard" />
            <h1 className="text-3xl font-bold mt-2 text-gray-900">{t('templates.title')}</h1>
            <p className="text-gray-600 mt-1">{t('templates.subtitle')}</p>
          </div>
          <div className="w-full md:w-1/3">
             <input
              type="text"
              placeholder={t('templates.search_placeholder')}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
             <div className="text-6xl mb-4">📭</div>
             <p className="text-gray-500 text-lg">{t('templates.no_results')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition hover:shadow-xl hover:-translate-y-1 duration-300">
                <div className="mb-4">
                   <div className="flex flex-wrap gap-2 mb-3">
                     {prompt.tags && prompt.tags.map((tag, idx) => (
                       <span key={idx} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 border border-blue-100">
                         {tag.name}
                       </span>
                     ))}
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 line-clamp-1" title={prompt.title}>{prompt.title}</h3>
                   <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <span>by</span>
                      <span className="font-medium text-gray-700">User {prompt.userId}</span>
                   </div>
                </div>
                
                <div className="relative group flex-grow mb-4">
                    <p className="text-gray-600 text-sm font-mono bg-gray-50 p-4 rounded-xl border border-gray-100 line-clamp-5 min-h-[8rem]">
                    {prompt.content}
                    </p>
                    <button 
                        onClick={() => handleCopy(prompt.content)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition border border-gray-200 hover:bg-gray-50 text-gray-500"
                        title="Copy content"
                    >
                        📋
                    </button>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleLike(prompt.id)} 
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition ${prompt.isLiked ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <span className={`text-lg transition-transform ${prompt.isLiked ? 'scale-110' : ''}`}>{prompt.isLiked ? '❤️' : '🤍'}</span>
                                <span className="font-medium">{prompt.likesCount || 0}</span>
                            </button>
                            <button 
                                onClick={() => setExpandedCommentsId(expandedCommentsId === prompt.id ? null : prompt.id)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition ${expandedCommentsId === prompt.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <span className="text-lg">💬</span>
                                <span className="font-medium">Comment</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm" title="Times used/forked">
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
                    className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-black disabled:opacity-50 transition shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
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
