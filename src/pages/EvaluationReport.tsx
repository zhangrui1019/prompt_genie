import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { promptService } from '@/lib/api';
import BackButton from '@/components/BackButton';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function EvaluationReport() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
        Promise.all([
            promptService.getEvaluation(id),
            promptService.getEvaluationResults(id)
        ]).then(([jobData, resultsData]) => {
            setJob(jobData);
            setResults(resultsData);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">{t('evaluations.loading')}</div>;
  if (!job) return <div className="p-8 text-center">{t('evaluations.no_evaluations')}</div>;

  const modelNames = job.modelConfigs?.map((c: any) => c.model) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <BackButton to="/evaluations" label={t('evaluations.back')} />
        
        <div className="mt-4 mb-8 flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold">{job.name}</h1>
                <div className="text-gray-500 mt-2 flex gap-4">
                    <span>{t('evaluations.status')}: <span className="font-semibold">{job.status}</span></span>
                    <span>{t('evaluations.created_at')}: {format(new Date(job.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                </div>
            </div>
            {/* Future: Add Export Button */}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('evaluations.input_data')}</th>
                            {modelNames.map((model: string) => (
                                <th key={model} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">
                                    {model}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {results.map((res, index) => (
                            <tr key={res.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                    <pre className="whitespace-pre-wrap font-sans text-xs bg-gray-50 p-2 rounded border overflow-auto max-h-32">
                                        {JSON.stringify(res.inputData, null, 2)}
                                    </pre>
                                </td>
                                {modelNames.map((model: string) => (
                                    <td key={model} className="px-6 py-4 text-sm text-gray-900 align-top min-w-[300px]">
                                        <div className="mb-2 whitespace-pre-wrap">{res.modelOutputs?.[model] || '-'}</div>
                                        {res.scores?.[model] && (
                                            <div className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                                                {t('evaluations.score')}: {res.scores[model]}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {results.length === 0 && (
                            <tr>
                                <td colSpan={2 + modelNames.length} className="px-6 py-8 text-center text-gray-500">
                                    {t('evaluations.no_results')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
