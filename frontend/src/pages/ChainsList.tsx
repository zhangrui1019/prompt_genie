import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { PromptChain } from '@/types';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';
import { Dialog } from '@headlessui/react';

export default function ChainsList() {
  const { t } = useTranslation();
  const [chains, setChains] = useState<PromptChain[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Move State
  const [moveChainId, setMoveChainId] = useState<string | null>(null);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>('');
  
  const user = useAuthStore((state) => state.user);
  const { workspaces, currentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (user?.id) {
      fetchChains();
    } else {
      setLoading(false);
    }
  }, [user?.id, currentWorkspace]); // Reload on workspace change

  const fetchChains = async () => {
    try {
      if (!user?.id) return;
      // TODO: Backend getChains needs to support workspaceId filter
      // For MVP, assuming backend returns user's chains, frontend might need filter if not
      const data = await promptService.getChains();
      // Filter by workspace
      const filtered = data.filter(c => {
          if (currentWorkspace) return c.workspaceId === currentWorkspace.id;
          return !c.workspaceId; // Personal
      });
      setChains(filtered);
    } catch (err) {
      console.error('Failed to fetch chains', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
      if (!moveChainId || !targetWorkspaceId) return;
      try {
          await promptService.moveChain(moveChainId, targetWorkspaceId);
          toast.success('Chain moved successfully');
          setMoveChainId(null);
          setTargetWorkspaceId('');
          fetchChains();
      } catch (err: any) {
          console.error(err);
          toast.error('Failed to move chain');
      }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await promptService.deleteChain(id);
      setChains(chains.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete chain');
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex items-center justify-between">
          <div>
             <BackButton to="/dashboard" label={t('common.dashboard')} />
            <h1 className="text-3xl font-bold mt-4">{t('chains.title')}</h1>
            <p className="text-gray-600">{t('chains.subtitle')}</p>
          </div>
          <Link
            to="/chains/new"
            className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            {t('chains.create_button')}
          </Link>
        </div>

        {chains.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-medium text-gray-600 mb-4">{t('chains.no_chains')}</h3>
            <Link to="/chains/new" className="text-blue-600 hover:underline">{t('chains.create_button')}</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {chains.map(chain => (
              <div key={chain.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-bold mb-2">{chain.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{chain.description || 'No description'}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                    Workflow
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/chains/${chain.id}/run`} className="text-green-600 hover:text-green-800 font-bold text-sm flex items-center gap-1">
                        <span>▶️</span> {t('common.run')}
                    </Link>
                    <Link to={`/chains/${chain.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">{t('common.edit')}</Link>
                    {!currentWorkspace && (
                        <button onClick={() => { setMoveChainId(chain.id); setTargetWorkspaceId(workspaces[0]?.id || ''); }} className="text-orange-600 hover:text-orange-800 font-medium text-sm">Move</button>
                    )}
                    <button onClick={() => handleDelete(chain.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">{t('common.delete')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Move Dialog */}
        <Dialog open={!!moveChainId} onClose={() => setMoveChainId(null)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-sm rounded bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-bold mb-4">Move Chain to Workspace</Dialog.Title>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Target Workspace</label>
                        <select 
                            className="w-full border rounded px-3 py-2"
                            value={targetWorkspaceId}
                            onChange={e => setTargetWorkspaceId(e.target.value)}
                        >
                            {workspaces.map(ws => (
                                <option key={ws.id} value={ws.id}>{ws.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setMoveChainId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button 
                            onClick={handleMove} 
                            disabled={!targetWorkspaceId}
                            className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-50"
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
