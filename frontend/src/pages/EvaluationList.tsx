import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import BackButton from '@/components/BackButton';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function EvaluationList() {
  const { t } = useTranslation();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      promptService.getEvaluations().then(setEvaluations);
    }
  }, [user]);

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

      <div className="mx-auto max-w-[1200px] z-10">
        <div className="flex justify-between items-center mb-8">
            <div>
                <BackButton to="/dashboard" label={t('evaluations.back')} />
                <h1 className="text-3xl font-bold mt-4 text-white">{t('evaluations.title')}</h1>
                <p className="text-gray-300">{t('evaluations.subtitle')}</p>
            </div>
            <Link 
                to="/evaluations/new" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded hover:from-blue-700 hover:to-purple-700 font-bold"
            >
                + {t('evaluations.create_new')}
            </Link>
        </div>

        <div className="bg-gray-800/60 rounded-lg shadow overflow-hidden border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('evaluations.name')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('evaluations.status')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('evaluations.created_at')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">{t('evaluations.actions')}</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-800/40 divide-y divide-gray-700">
                    {evaluations.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-700/30">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-white">{job.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${job.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400 border border-green-800' : 
                                      job.status === 'FAILED' ? 'bg-red-900/30 text-red-400 border border-red-800' : 
                                      'bg-yellow-900/30 text-yellow-400 border border-yellow-800'}`}>
                                    {job.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {job.createdAt ? format(new Date(job.createdAt), 'yyyy-MM-dd HH:mm') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/evaluations/${job.id}`} className="text-blue-400 hover:text-blue-300">{t('evaluations.view_report')}</Link>
                            </td>
                        </tr>
                    ))}
                    {evaluations.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                {t('evaluations.no_evaluations')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
