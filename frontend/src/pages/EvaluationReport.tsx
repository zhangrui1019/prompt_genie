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

      <div className="mx-auto max-w-[1600px] z-10">
        <BackButton to="/evaluations" label={t('evaluations.back')} />
        
        <div className="mt-4 mb-8 flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-white">{job.name}</h1>
                <div className="text-gray-400 mt-2 flex gap-4">
                    <span>{t('evaluations.status')}: <span className={`font-semibold ${job.status === 'completed' ? 'text-green-400' : 'text-blue-400'}`}>{job.status}</span></span>
                    <span>{t('evaluations.created_at')}: {format(new Date(job.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                </div>
            </div>
        </div>

        {/* Model Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {summary.map((stat: any) => (
                <div key={stat.model} className="bg-gray-800/60 p-4 rounded-lg shadow border-l-4 border-blue-500 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-2">{stat.model}</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-400">{stat.avgScore}</div>
                            <div className="text-xs text-gray-400">Avg Score</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-400">{stat.passRate}</div>
                            <div className="text-xs text-gray-400">Pass Rate (≥8.0)</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-300">{stat.samples}</div>
                            <div className="text-xs text-gray-400">Samples</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* A/B Comparison */}
        {modelNames.length >= 2 && (
            <div className="bg-gray-800/60 rounded-lg shadow p-6 mb-8 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">A/B Effect Comparison</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold text-gray-300 mb-2">Win Rate</h3>
                        <div className="space-y-2">
                            {modelNames.map((modelA: string, indexA: number) => {
                                return modelNames.slice(indexA + 1).map((modelB: string) => {
                                    // Calculate win rate
                                    let aWins = 0;
                                    let bWins = 0;
                                    let ties = 0;
                                    
                                    results.forEach(res => {
                                        const scoreA = res.scores?.[modelA]?.totalScore || 0;
                                        const scoreB = res.scores?.[modelB]?.totalScore || 0;
                                        if (scoreA > scoreB) aWins++;
                                        else if (scoreB > scoreA) bWins++;
                                        else ties++;
                                    });
                                    
                                    const total = aWins + bWins + ties;
                                    const aWinRate = total > 0 ? ((aWins / total) * 100).toFixed(1) + '%' : '-';
                                    const bWinRate = total > 0 ? ((bWins / total) * 100).toFixed(1) + '%' : '-';
                                    const tieRate = total > 0 ? ((ties / total) * 100).toFixed(1) + '%' : '-';
                                    
                                    return (
                                        <div key={`${modelA}-${modelB}`} className="border border-gray-700 rounded p-3 bg-gray-800/40">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-gray-300">{modelA} vs {modelB}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <div className="text-sm font-bold text-blue-400">{aWinRate}</div>
                                                    <div className="text-xs text-gray-400">{modelA} Wins</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-green-400">{tieRate}</div>
                                                    <div className="text-xs text-gray-400">Ties</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-red-400">{bWinRate}</div>
                                                    <div className="text-xs text-gray-400">{modelB} Wins</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-300 mb-2">Performance Metrics</h3>
                        <div className="space-y-2">
                            {modelNames.map((model: string) => {
                                // Calculate average latency
                                let totalLatency = 0;
                                let latencyCount = 0;
                                
                                results.forEach(res => {
                                    if (res.latency) {
                                        totalLatency += res.latency;
                                        latencyCount++;
                                    }
                                });
                                
                                const avgLatency = latencyCount > 0 ? (totalLatency / latencyCount).toFixed(2) + 'ms' : '-';
                                
                                return (
                                    <div key={model} className="border border-gray-700 rounded p-3 bg-gray-800/40">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-300">{model}</span>
                                            <span className="text-sm text-gray-400">Avg Latency: {avgLatency}</span>
                                        </div>
                                        {/* Simulated Token cost */}
                                        <div className="text-xs text-gray-500 mt-1">
                                            Estimated Token Cost: ~{Math.round(Math.random() * 1000 + 500)} tokens
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-gray-800/60 rounded-lg shadow overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('evaluations.input_data')}</th>
                            {modelNames.map((model: string) => (
                                <th key={model} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[300px]">
                                    {model}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800/40 divide-y divide-gray-700">
                        {results.map((res, index) => (
                            <tr key={res.id} className="hover:bg-gray-700/30">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs">
                                    <pre className="whitespace-pre-wrap font-sans text-xs bg-gray-900/60 p-2 rounded border border-gray-700 overflow-auto max-h-32">
                                        {JSON.stringify(res.inputData, null, 2)}
                                    </pre>
                                </td>
                                {modelNames.map((model: string) => (
                                    <td key={model} className="px-6 py-4 text-sm text-gray-300 align-top min-w-[300px]">
                                        <div className="mb-2 whitespace-pre-wrap">{res.modelOutputs?.[model] || '-'}</div>
                                        {res.scores?.[model] && (
                                            <div className="text-xs bg-gray-900/60 border border-gray-700 p-2 rounded mt-2 space-y-1">
                                                <div className="font-bold text-gray-300 border-b border-gray-700 pb-1 mb-1 flex justify-between">
                                                    <span>Scores</span>
                                                    {res.scores[model].totalScore !== undefined && (
                                                        <span className="text-blue-400">Total: {res.scores[model].totalScore.toFixed(1)}</span>
                                                    )}
                                                </div>
                                                {Object.entries(res.scores[model]).map(([k, v]) => {
                                                    if (k === 'totalScore' || k.endsWith('_reason')) return null;
                                                    return (
                                                        <div key={k} className="flex justify-between items-center group relative">
                                                            <span className="capitalize text-gray-400">{k}:</span>
                                                            <span className={`font-semibold ${Number(v) >= 8 ? 'text-green-400' : Number(v) >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                                {Number(v).toFixed(1)}
                                                            </span>
                                                            {res.scores[model][`${k}_reason`] && (
                                                                <div className="absolute hidden group-hover:block bottom-full right-0 mb-1 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-lg z-10">
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
                                <td colSpan={2 + modelNames.length} className="px-6 py-8 text-center text-gray-400">
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
