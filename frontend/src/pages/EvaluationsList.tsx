import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';

export default function EvaluationsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadEvaluations();
    }
  }, [user]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const data = await promptService.getEvaluations();
      setEvaluations(data);
    } catch (error) {
      console.error('Failed to load evaluations', error);
      toast.error('Failed to load evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/evaluations/create');
  };

  const handleView = (id: string) => {
    navigate(`/evaluations/${id}`);
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleMenuAction = (action: string, id: string) => {
    setOpenMenuId(null);
    // 这里可以添加不同操作的处理逻辑
    switch (action) {
      case 'duplicate':
        toast.success('Duplicate functionality not yet implemented');
        break;
      case 'delete':
        toast.success('Delete functionality not yet implemented');
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'RUNNING':
        return 'text-blue-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden p-6">
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

      <div className="mx-auto max-w-7xl z-10">
        <BackButton to="/" label={t('evaluations.back')} />
        
        <div className="mt-4 mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">{t('evaluations.title')}</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('evaluations.create')}
          </button>
        </div>

        {evaluations.length === 0 ? (
          <div className="bg-gray-800/60 rounded-lg shadow p-8 text-center border border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">{t('evaluations.no_evaluations')}</h3>
            <p className="text-gray-400 mb-4">{t('evaluations.no_evaluations_desc')}</p>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700"
            >
              {t('evaluations.create')}
            </button>
          </div>
        ) : (
          <div className="bg-gray-800/60 rounded-lg shadow overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {t('evaluations.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {t('evaluations.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {t('evaluations.models')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {t('evaluations.created_at')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {t('evaluations.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/40 divide-y divide-gray-700">
                  {evaluations.map((evaluation) => (
                    <tr key={evaluation.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {evaluation.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getStatusColor(evaluation.status).replace('text-', 'text-').replace('600', '400')}>
                          {evaluation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {evaluation.modelConfigs?.map((config: any) => config.model).join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {format(new Date(evaluation.createdAt), 'yyyy-MM-dd HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => handleView(evaluation.id)}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                          >
                            {t('evaluations.view')}
                          </button>
                          <div className="inline-block relative">
                            <button 
                              onClick={() => toggleMenu(evaluation.id)}
                              className="text-gray-400 hover:text-white focus:outline-none"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                            {openMenuId === evaluation.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20">
                                <button
                                  onClick={() => handleMenuAction('duplicate', evaluation.id)}
                                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                                >
                                  Duplicate
                                </button>
                                <button
                                  onClick={() => handleMenuAction('delete', evaluation.id)}
                                  className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}