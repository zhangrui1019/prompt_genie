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

  const modelNames = job?.modelConfigs?.map((c: any) => c.model) || [];

  // Calculate Summary Stats
  const summary = modelNames.map((model: string) => {
      let totalScore = 0;
      let count = 0;
      let passCount = 0;
      
      results.forEach(res => {
          if (res.scores?.[model]?.totalScore !== undefined) {
              totalScore += res.scores[model].totalScore;
              count++;
              if (res.scores[model].totalScore >= 8) passCount++; // Assume 8 is pass
          }
      });
      
      return {
          model,
          avgScore: count > 0 ? (totalScore / count).toFixed(1) : '-',
          passRate: count > 0 ? ((passCount / count) * 100).toFixed(0) + '%' : '-',
          samples: count
      };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <BackButton to="/evaluations" label={t('evaluations.back')} />
        
        <div className="mt-4 mb-8 flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold">{job.name}</h1>
                <div className="text-gray-500 mt-2 flex gap-4">
                    <span>{t('evaluations.status')}: <span className={`font-semibold ${job.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>{job.status}</span></span>
                    <span>{t('evaluations.created_at')}: {format(new Date(job.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                </div>
            </div>
        </div>

        {/* Model Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {summary.map((stat: any) => (
                <div key={stat.model} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{stat.model}</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{stat.avgScore}</div>
                            <div className="text-xs text-gray-500">Avg Score</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">{stat.passRate}</div>
                            <div className="text-xs text-gray-500">Pass Rate (≥8.0)</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-600">{stat.samples}</div>
                            <div className="text-xs text-gray-500">Samples</div>
                        </div>
                    </div>
                </div>
            ))}
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
                                            <div className="text-xs bg-gray-50 border border-gray-200 p-2 rounded mt-2 space-y-1">
                                                <div className="font-bold text-gray-700 border-b border-gray-200 pb-1 mb-1 flex justify-between">
                                                    <span>Scores</span>
                                                    {res.scores[model].totalScore !== undefined && (
                                                        <span className="text-blue-600">Total: {res.scores[model].totalScore.toFixed(1)}</span>
                                                    )}
                                                </div>
                                                {Object.entries(res.scores[model]).map(([k, v]) => {
                                                    if (k === 'totalScore' || k.endsWith('_reason')) return null;
                                                    return (
                                                        <div key={k} className="flex justify-between items-center group relative">
                                                            <span className="capitalize text-gray-600">{k}:</span>
                                                            <span className={`font-semibold ${Number(v) >= 8 ? 'text-green-600' : Number(v) >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                                {Number(v).toFixed(1)}
                                                            </span>
                                                            {res.scores[model][`${k}_reason`] && (
                                                                <div className="absolute hidden group-hover:block bottom-full right-0 mb-1 w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-lg z-10">
                                                                    {res.scores[model][`${k}_reason`]}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
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
