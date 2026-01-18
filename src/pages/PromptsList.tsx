import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Prompt } from '@/types';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';

export default function PromptsList() {
  const { t, i18n } = useTranslation();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user?.id) {
      fetchPrompts();
      fetchTags();
    }
  }, [user?.id, search, tagFilter]);

  const fetchTags = async () => {
    if (!user?.id) return;
    try {
      const tags = await promptService.getTags();
      setAvailableTags(tags);
    } catch (err) {
      console.error('Failed to fetch tags', err);
    }
  };

  const fetchPrompts = async () => {
    try {
      if (!user?.id) return;
      const data = await promptService.getAll(search, tagFilter);
      setPrompts(data);
    } catch (err: any) {
      console.error('Failed to fetch prompts', err);
      setError('Failed to load prompts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('prompts.delete_confirm'))) return;
    
    try {
      await promptService.delete(id);
      setPrompts(prompts.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete prompt', err);
      alert('Failed to delete prompt');
    }
  };

  if (loading && !prompts.length) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex items-center justify-between">
          <div>
             <BackButton to="/dashboard" label={t('common.dashboard')} />
            <h1 className="text-3xl font-bold mt-4">{t('prompts.title')}</h1>
          </div>
          <div className="flex gap-2">
            <Link
              to="/batch"
              className="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
            >
              {t('common.batch_run')}
            </Link>
            <Link
              to="/prompts/new"
              className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              {t('prompts.create_button')}
            </Link>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder={t('prompts.search_placeholder')}
            className="flex-1 rounded border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="">{t('prompts.all_tags')}</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {prompts.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <h3 className="mb-2 text-xl font-semibold text-gray-700">{t('prompts.no_prompts')}</h3>
            <p className="mb-6 text-gray-500">{t('prompts.create_first')}</p>
            <Link
              to="/prompts/new"
              className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              {t('common.create')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="flex flex-col rounded-lg bg-white p-6 shadow transition hover:shadow-lg">
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{prompt.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {prompt.tags && prompt.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 cursor-pointer hover:bg-blue-200"
                        onClick={(e) => {
                          e.preventDefault();
                          setTagFilter(tag.name);
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mb-4 line-clamp-3 flex-grow text-gray-600 text-sm font-mono bg-gray-50 p-2 rounded border border-gray-100">
                  {prompt.content}
                </p>
                <div className="mb-4 text-xs text-gray-400">
                  {t('prompts.updated', { date: new Date(prompt.updatedAt || prompt.createdAt).toLocaleDateString(i18n.language) })}
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Link
                    to={`/playground?promptId=${prompt.id}`}
                    className="col-span-1 rounded bg-blue-50 border border-blue-200 px-2 py-1.5 text-center text-sm font-semibold text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-1"
                     title={t('common.run')}
                   >
                     <span>▶️</span> {t('common.run')}
                   </Link>
                   <Link
                     to={`/optimizer?promptId=${prompt.id}`}
                     className="col-span-1 rounded bg-purple-50 border border-purple-200 px-2 py-1.5 text-center text-sm font-semibold text-purple-700 hover:bg-purple-100 flex items-center justify-center gap-1"
                     title={t('common.optimize')}
                   >
                      <span>✨</span> {t('common.optimize')}
                   </Link>
                  <Link
                    to={`/batch?promptId=${prompt.id}`}
                    className="col-span-1 rounded border border-green-200 px-2 py-1.5 text-center text-sm font-semibold text-green-700 hover:bg-green-50"
                  >
                    {t('common.batch_run')}
                  </Link>
                  <Link
                    to={`/prompts/${prompt.id}`}
                    className="col-span-1 rounded border border-gray-300 px-2 py-1.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {t('common.edit')}
                  </Link>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="col-span-2 rounded border border-red-200 px-2 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    {t('common.delete')}
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
