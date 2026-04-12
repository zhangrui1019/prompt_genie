import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Prompt } from '@/types';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import BackButton from '@/components/BackButton';

export default function BatchRun() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialPromptId = searchParams.get('promptId');
  const user = useAuthStore((state) => state.user);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState(initialPromptId || '');
  const [csvContent, setCsvContent] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (user?.id) {
      promptService.getAll(user.id).then(setPrompts);
    }
  }, [user?.id]);

  if (user?.plan !== 'pro') {
      return (
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden p-8">
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
              <div className="max-w-md w-full bg-gray-800/80 rounded-lg shadow p-8 text-center border border-gray-700 z-10">
                  <div className="text-4xl mb-4">💎</div>
                  <h1 className="text-2xl font-bold mb-2 text-white">{t('batch.pro_feature')}</h1>
                  <p className="text-gray-400 mb-6">{t('batch.upgrade_msg')}</p>
                  <div className="flex gap-3 justify-center">
                      <Link to="/prompts" className="px-4 py-2 border border-gray-700 rounded bg-gray-800/60 hover:bg-gray-700 text-gray-300">{t('common.back')}</Link>
                      <Link to="/profile" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 font-bold">{t('common.upgrade')}</Link>
                  </div>
              </div>
          </div>
      );
  }

  const handleDownloadTemplate = () => {
    if (!selectedPromptId) return;
    const prompt = prompts.find(p => p.id === selectedPromptId);
    if (!prompt) return;

    // Get variable keys
    const variableKeys = Object.keys(prompt.variables || {});
    if (variableKeys.length === 0) {
        toast.error(t('batch.no_vars'));
        return;
    }
    
    const csvContent = variableKeys.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.title.replace(/\s+/g, '_')}_template.csv`;
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        const content = evt.target?.result as string;
        setCsvContent(content);
        parseCsv(content);
    };
    reader.readAsText(file);
  };

  const parseCsv = (content: string) => {
    if (!content.trim()) {
      setHeaders([]);
      setRows([]);
      return;
    }
    const lines = content.trim().split(/\r?\n/);
    if (lines.length > 0) {
      const headerLine = lines[0].split(',').map(h => h.trim());
      setHeaders(headerLine);
      const dataRows = lines.slice(1).map(line => {
        if (!line.trim()) return null; // Skip empty lines
        const values = line.split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headerLine.forEach((h, i) => {
          row[h] = values[i] || '';
        });
        return row;
      }).filter(r => r !== null) as Record<string, string>[];
      setRows(dataRows);
    }
  };

  const handleRun = async () => {
    if (!selectedPromptId || rows.length === 0) return;
    setIsRunning(true);
    setProgress(0);
    
    // Create new AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Reset results in rows
    setRows(prev => prev.map(r => ({ ...r, _result: t('batch.pending'), _status: 'pending', _error: undefined })));

    try {
      // Use fetch for SSE
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/batch/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          promptId: selectedPromptId,
          rows: rows // Pass current rows
        }),
        signal
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete data

        for (const line of lines) {
            if (!line.trim()) continue;
            if (line.startsWith('data:')) {
                const jsonStr = line.substring(5).trim();
                
                // Check for completion message
                if (jsonStr === 'Batch processing finished') {
                   setIsRunning(false);
                   toast.success(t('batch.completed'));
                   break;
                }
                
                // Check for error message
                if (jsonStr.startsWith('Error processing row')) {
                    // Try to extract row index if possible, or just toast
                    // Format: "Error processing row 5: ..."
                    const match = jsonStr.match(/row (\d+): (.*)/);
                    if (match) {
                        const rowIndex = parseInt(match[1]);
                        const errorMsg = match[2];
                        setRows(prev => {
                            const updated = [...prev];
                            if (updated[rowIndex]) {
                                updated[rowIndex] = { ...updated[rowIndex], _result: 'Error', _status: 'failed', _error: errorMsg };
                            }
                            return updated;
                        });
                    }
                    continue;
                }

                try {
                   const data = JSON.parse(jsonStr);
                   if (data._rowIndex !== undefined) {
                     // Update row result
                     setRows(prev => {
                        const updated = [...prev];
                        if (updated[data._rowIndex]) {
                            updated[data._rowIndex] = { 
                                ...updated[data._rowIndex], 
                                _result: data._result, 
                                _status: 'completed',
                                _error: undefined
                            };
                        }
                        return updated;
                     });
                     setProgress(prev => prev + 1);
                   }
                } catch (e) {
                    console.error('Failed to parse SSE data', e);
                }
            }
        }
      }
    } catch (err: any) {
        if (err.name === 'AbortError') {
            toast.error(t('batch.cancelled'));
        } else {
            console.error('Batch run failed', err);
            toast.error(t('batch.failed'));
        }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          setIsRunning(false);
      }
  };

  const handleExport = () => {
    if (rows.length === 0) return;
    const exportHeaders = [...headers, 'Result'];
    const csvLines = [
        exportHeaders.join(','),
        ...rows.map(row => {
            return exportHeaders.map(h => {
                let val = h === 'Result' ? (row._result || '') : (row[h] || '');
                // Escape quotes
                if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                    val = `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            }).join(',');
        })
    ];
    
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_results.csv';
    a.click();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden p-6">
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
        <div className="mb-8">
          <BackButton to="/prompts" label={t('common.back')} />
          <h1 className="text-3xl font-bold mt-4 text-white">{t('batch.title')}</h1>
          <p className="text-gray-300">{t('batch.subtitle')}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl bg-gray-800/60 p-6 shadow-lg border border-gray-700">
              <h2 className="text-lg font-bold mb-4 text-white">{t('batch.select_label')}</h2>
              <select
                className="w-full rounded border border-gray-600 bg-gray-800 text-gray-300 p-2"
                value={selectedPromptId}
                onChange={(e) => setSelectedPromptId(e.target.value)}
              >
                <option value="">-- {t('playground.select_prompt')} --</option>
                {prompts.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl bg-gray-800/60 p-6 shadow-lg border border-gray-700">
              <h2 className="text-lg font-bold mb-4 text-white">{t('batch.input_label')}</h2>
              
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">{t('batch.step_download')}</label>
                      <button
                        onClick={handleDownloadTemplate}
                        disabled={!selectedPromptId}
                        className="w-full rounded border border-blue-600 bg-gray-800/60 text-blue-400 px-4 py-2 hover:bg-blue-900/30 disabled:opacity-50 disabled:border-gray-700 disabled:text-gray-500"
                      >
                        {t('batch.btn_download_template')}
                      </button>
                      <p className="text-xs text-gray-400 mt-1">{t('batch.download_desc')}</p>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">{t('batch.step_upload')}</label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900/30 file:text-blue-400 hover:file:bg-blue-800/50"
                      />
                  </div>
              </div>
            </div>
            
            <button
                onClick={handleRun}
                disabled={isRunning || !selectedPromptId || rows.length === 0}
                className={`w-full rounded bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-bold text-white hover:from-blue-700 hover:to-purple-700 ${isRunning || !selectedPromptId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isRunning ? `${t('playground.running')} (${progress}/${rows.length})...` : t('batch.start_button')}
            </button>
            
            {isRunning && (
                <button
                    onClick={handleCancel}
                    className="w-full rounded border border-red-600 bg-gray-800/60 text-red-400 px-6 py-3 font-bold hover:bg-red-900/30"
                >
                    {t('common.cancel')}
                </button>
            )}
            
             <button
                onClick={handleExport}
                disabled={rows.length === 0}
                className="w-full rounded border border-green-600 bg-gray-800/60 text-green-400 px-6 py-3 font-bold hover:bg-green-900/30 disabled:opacity-50"
            >
                {t('batch.download_button')}
            </button>
          </div>

          <div className="lg:col-span-2 rounded-xl bg-gray-800/60 p-6 shadow-lg overflow-hidden flex flex-col border border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-white">{t('batch.preview_label')}</h2>
            <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-700/50 border-b border-gray-600">
                            <th className="p-2 border-r border-gray-600 text-sm font-semibold w-12 text-gray-300">#</th>
                            {headers.map(h => (
                                <th key={h} className="p-2 border-r border-gray-600 text-sm font-semibold text-gray-300">{h}</th>
                            ))}
                            <th className="p-2 text-sm font-semibold min-w-[200px] text-gray-300">{t('batch.result_header')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/30">
                                <td className="p-2 border-r border-gray-700 text-sm text-gray-400">{i + 1}</td>
                                {headers.map(h => (
                                    <td key={h} className="p-2 border-r border-gray-700 text-sm text-gray-300">{row[h]}</td>
                                ))}
                                <td className="p-2 text-sm text-gray-300">
                                    {row._status === 'pending' ? (
                                        <span className="text-gray-500 italic">{t('batch.pending')}</span>
                                    ) : (
                                        <div className="max-h-24 overflow-y-auto whitespace-pre-wrap">{row._result}</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={headers.length + 2} className="p-8 text-center text-gray-500">
                                    {t('batch.empty_preview')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
