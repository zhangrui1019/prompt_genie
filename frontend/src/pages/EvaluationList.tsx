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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex justify-between items-center mb-8">
            <div>
                <BackButton to="/dashboard" label={t('evaluations.back')} />
                <h1 className="text-3xl font-bold mt-4">{t('evaluations.title')}</h1>
                <p className="text-gray-600">{t('evaluations.subtitle')}</p>
            </div>
            <Link 
                to="/evaluations/new" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold"
            >
                + {t('evaluations.create_new')}
            </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('evaluations.name')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('evaluations.status')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('evaluations.created_at')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('evaluations.actions')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {evaluations.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{job.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                      job.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                                      'bg-yellow-100 text-yellow-800'}`}>
                                    {job.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {job.createdAt ? format(new Date(job.createdAt), 'yyyy-MM-dd HH:mm') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/evaluations/${job.id}`} className="text-blue-600 hover:text-blue-900">{t('evaluations.view_report')}</Link>
                            </td>
                        </tr>
                    ))}
                    {evaluations.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
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
