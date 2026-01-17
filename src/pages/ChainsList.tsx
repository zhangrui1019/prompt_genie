import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { PromptChain } from '@/types';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';

export default function ChainsList() {
  const { t } = useTranslation();
  const [chains, setChains] = useState<PromptChain[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user?.id) {
      fetchChains();
    }
  }, [user?.id]);

  const fetchChains = async () => {
    try {
      if (!user?.id) return;
      const data = await promptService.getChains(user.id);
      setChains(data);
    } catch (err) {
      console.error('Failed to fetch chains', err);
    } finally {
      setLoading(false);
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
                    {/* We don't have step count in basic entity unless we fetch details, but let's assume API returns it or we just link */}
                    Workflow
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/chains/${chain.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">{t('common.edit')}</Link>
                    <button onClick={() => handleDelete(chain.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">{t('common.delete')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
