import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { Prompt } from '@/types';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher';

export default function PromptsList() {
  const { t, i18n } = useTranslation();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Move Prompt State
  const [movePromptId, setMovePromptId] = useState<string | null>(null);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>('');
  
  const user = useAuthStore((state) => state.user);
  const { workspaces, currentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (user?.id) {
      fetchPrompts();
      fetchTags();
    }
  }, [user?.id, search, tagFilter, currentWorkspace]); // Reload when workspace changes

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
      const data = await promptService.getAll(search, tagFilter, currentWorkspace?.id);
      setPrompts(data);
    } catch (err: any) {
      console.error('Failed to fetch prompts', err);
      setError('Failed to load prompts.');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
      if (!movePromptId || !targetWorkspaceId) return;
      try {
          await promptService.move(movePromptId, targetWorkspaceId);
          toast.success(t('prompts.moved_success'));
          setMovePromptId(null);
          setTargetWorkspaceId('');
          fetchPrompts(); // Refresh
      } catch (err: any) {
          console.error(err);
          toast.error('Failed to move prompt: ' + (err.response?.data?.message || err.message));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
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
      
      <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 z-10">
        <div className="mb-4 sm:mb-8">
          <div className="mb-2">
            <WorkspaceSwitcher />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <BackButton to="/dashboard" label={t('common.dashboard')} />
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 sm:mt-4">{t('prompts.title')}</h1>
            </div>
            <div className="flex gap-2 sm:gap-4 flex-wrap">
              <Link
                to="/batch"
                className="rounded bg-gradient-to-r from-green-600 to-emerald-600 px-3 sm:px-4 py-2 font-bold text-white hover:from-green-700 hover:to-emerald-700 transition shadow-lg shadow-green-600/20 text-sm sm:text-base"
              >
                {t('common.batch_run')}
              </Link>
              <Link
                to="/prompts/new"
                className="rounded bg-gradient-to-r from-blue-600 to-purple-600 px-3 sm:px-4 py-2 font-bold text-white hover:from-green-700 hover:to-purple-700 transition shadow-lg shadow-blue-600/20 text-sm sm:text-base"
              >
                {t('prompts.create_button')}
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            placeholder={t('prompts.search_placeholder')}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="w-full sm:w-auto rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
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
          <div className="mb-4 rounded-lg bg-red-900/30 p-4 text-red-400 border border-red-800">
            {error}
          </div>
        )}

        {prompts.length === 0 ? (
          <div className="rounded-xl bg-gray-800/60 p-12 text-center shadow-lg border border-gray-700">
            <h3 className="mb-2 text-xl font-semibold text-white">{t('prompts.no_prompts')}</h3>
            <p className="mb-6 text-gray-400">{t('prompts.create_first')}</p>
            <Link
              to="/prompts/new"
              className="rounded bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-600/20"
            >
              {t('common.create')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="flex flex-col rounded-xl bg-gray-800/60 p-4 sm:p-6 shadow-lg border border-gray-700 transition hover:shadow-xl hover:border-blue-500/50 transform transition-all duration-300 hover:scale-[1.02] min-h-[280px] sm:min-h-[300px]">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white line-clamp-2">{prompt.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prompt.tags && prompt.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="inline-block rounded-full bg-blue-900/50 px-2 py-0.5 text-xs font-medium text-blue-400 cursor-pointer hover:bg-blue-800/50 transition-colors duration-300"
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
                <p className="mb-4 line-clamp-3 flex-grow text-gray-300 text-sm font-mono bg-gray-900/60 p-3 rounded border border-gray-700">
                  {prompt.content}
                </p>
                <div className="mb-4 text-xs text-gray-500">
                  {t('prompts.updated', { date: new Date(prompt.updatedAt || prompt.createdAt).toLocaleDateString(i18n.language) })}  
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Link
                    to={`/playground?promptId=${prompt.id}`}
                    className="col-span-1 rounded bg-blue-900/30 border border-blue-800/50 px-3 py-2 text-center text-sm font-semibold text-blue-400 hover:bg-blue-800/30 flex items-center justify-center gap-1 transition-colors duration-300"
                     title={t('common.run')}
                   >
                     <span>▶️</span> {t('common.run')}
                   </Link>
                   <Link
                     to={`/optimizer?promptId=${prompt.id}`}
                     className="col-span-1 rounded bg-purple-900/30 border border-purple-800/50 px-3 py-2 text-center text-sm font-semibold text-purple-400 hover:bg-purple-800/30 flex items-center justify-center gap-1 transition-colors duration-300"
                     title={t('common.optimize')}
                   >
                      <span>✨</span> {t('common.optimize')}
                   </Link>
                  <Link
                    to={`/batch?promptId=${prompt.id}`}
                    className="col-span-1 rounded border border-green-800/50 bg-green-900/30 px-3 py-2 text-center text-sm font-semibold text-green-400 hover:bg-green-800/30 transition-colors duration-300"
                  >
                    {t('common.batch_run')}
                  </Link>
                  <Link
                    to={`/prompts/${prompt.id}`}
                    className="col-span-1 rounded border border-gray-700 bg-gray-800/60 px-3 py-2 text-center text-sm font-semibold text-gray-300 hover:bg-gray-700/60 transition-colors duration-300"
                  >
                    {t('common.edit')}
                  </Link>
                  {/* Only show Move if in personal workspace (currentWorkspace is null) */}
                  {!currentWorkspace && (
                    <button
                        onClick={() => { setMovePromptId(prompt.id); setTargetWorkspaceId(workspaces[0]?.id || ''); }}
                        className="col-span-1 rounded border border-orange-800/50 bg-orange-900/30 px-3 py-2 text-sm font-semibold text-orange-400 hover:bg-orange-800/30 transition-colors duration-300"
                    >
                        Move
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="col-span-2 rounded border border-red-800/50 bg-red-900/30 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-800/30 transition-colors duration-300"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Move Dialog */}
        <Dialog open={!!movePromptId} onClose={() => setMovePromptId(null)} className="relative z-50">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-sm rounded-xl bg-gray-800/80 p-6 shadow-2xl border border-gray-700">
                    <Dialog.Title className="text-lg font-bold mb-4 text-white">Move Prompt to Workspace</Dialog.Title>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Select Target Workspace</label>
                        <select 
                            className="w-full border border-gray-700 bg-gray-900 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            value={targetWorkspaceId}
                            onChange={e => setTargetWorkspaceId(e.target.value)}
                        >
                            {workspaces.map(ws => (
                                <option key={ws.id} value={ws.id}>{ws.name}</option>
                            ))}
                        </select>
                        {workspaces.length === 0 && <p className="text-red-400 text-xs mt-1">No workspaces available. Create one first.</p>}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setMovePromptId(null)} className="px-4 py-2 text-sm text-gray-400 hover:bg-gray-700/60 rounded-lg transition-colors duration-300">Cancel</button>
                        <button 
                            onClick={handleMove} 
                            disabled={!targetWorkspaceId}
                            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg disabled:opacity-50 transition-all duration-300"
                        >
                            Move
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
      </div>
    </div>
  );
}
