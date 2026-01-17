import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Prompt } from '@/types';
import { useTranslation } from 'react-i18next';

export default function Templates() {
  const { t } = useTranslation();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [forkingId, setForkingId] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicPrompts();
  }, [search, user?.id]);

  const fetchPublicPrompts = async () => {
    try {
      const data = await promptService.getPublic(search, user?.id);
      setPrompts(data);
    } catch (err) {
      console.error('Failed to fetch public prompts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (promptId: string) => {
    if (!user?.id) {
        alert('Please login to like prompts.');
        return;
    }
    try {
        const result = await promptService.like(promptId, user.id);
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
    } catch (err) {
        console.error('Failed to like prompt', err);
    }
  };

  const handleFork = async (promptId: string) => {
    if (!user?.id) {
      alert('Please login to fork prompts.');
      return;
    }
    setForkingId(promptId);
    try {
      await promptService.fork(promptId, user.id);
      alert('Prompt added to your library!');
      navigate('/prompts');
    } catch (err) {
      console.error('Failed to fork prompt', err);
      alert('Failed to fork prompt.');
    } finally {
      setForkingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
           <Link to="/dashboard" className="mb-2 inline-block text-sm text-gray-500 hover:text-gray-700">
            &larr; {t('common.dashboard')}
          </Link>
          <h1 className="text-3xl font-bold">{t('templates.title')}</h1>
          <p className="text-gray-600">{t('templates.subtitle')}</p>
        </div>

        <div className="mb-8">
           <input
            type="text"
            placeholder={t('templates.search_placeholder')}
            className="w-full rounded border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">{t('common.loading')}</div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">{t('templates.no_results')}</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="flex flex-col rounded-lg bg-white p-6 shadow transition hover:shadow-lg">
                <div className="mb-2">
                   <div className="flex flex-wrap gap-1 mb-2">
                     {prompt.tags && prompt.tags.map((tag, idx) => (
                       <span key={idx} className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                         {tag.name}
                       </span>
                     ))}
                   </div>
                   <h3 className="text-xl font-bold text-gray-800">{prompt.title}</h3>
                </div>
                
                <p className="mb-4 flex-grow text-gray-600 text-sm font-mono bg-gray-50 p-3 rounded border border-gray-100 line-clamp-4">
                  {prompt.content}
                </p>
                
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500 px-1">
                    <button 
                        onClick={() => handleLike(prompt.id)} 
                        className={`flex items-center gap-1.5 transition ${prompt.isLiked ? 'text-red-500 font-medium' : 'hover:text-red-500'}`}
                    >
                        <span className="text-lg">{prompt.isLiked ? '❤️' : '🤍'}</span>
                        <span>{prompt.likesCount || 0}</span>
                    </button>
                    <div className="flex items-center gap-1.5" title="Times used/forked">
                        <span className="text-lg">🔥</span>
                        <span>{prompt.usageCount || 0}</span>
                    </div>
                </div>

                <button
                  onClick={() => handleFork(prompt.id)}
                  disabled={forkingId === prompt.id}
                  className="mt-auto w-full rounded bg-blue-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {forkingId === prompt.id ? t('templates.adding') : t('templates.add_library')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
