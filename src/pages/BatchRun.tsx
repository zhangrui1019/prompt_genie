import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (user?.id) {
      promptService.getAll(user.id).then(setPrompts);
    }
  }, [user?.id]);

  if (user?.plan !== 'pro') {
      return (
          <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
              <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-4xl mb-4">💎</div>
                  <h1 className="text-2xl font-bold mb-2">{t('batch.pro_feature')}</h1>
                  <p className="text-gray-600 mb-6">{t('batch.upgrade_msg')}</p>
                  <div className="flex gap-3 justify-center">
                      <Link to="/prompts" className="px-4 py-2 border rounded hover:bg-gray-50">{t('common.back')}</Link>
                      <Link to="/profile" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-bold">{t('common.upgrade')}</Link>
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

    // Reset results in rows
    const newRows = rows.map(r => ({ ...r, _result: t('batch.pending'), _status: 'pending' }));
    setRows(newRows);

    try {
      // Use fetch for SSE
      const response = await fetch('http://localhost:8080/api/batch/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: selectedPromptId,
          rows: newRows
        })
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
          if (line.startsWith('data:')) {
            const jsonStr = line.substring(5).trim();
            if (jsonStr === 'Batch processing finished') {
               setIsRunning(false);
               break;
            }
            try {
               const data = JSON.parse(jsonStr);
               if (data._rowIndex !== undefined) {
                 // Update row result
                 setRows(prev => {
                   const updated = [...prev];
                   updated[data._rowIndex] = { 
                       ...updated[data._rowIndex], 
                       _result: data._result,
                       _status: 'completed' 
                   };
                   return updated;
                 });
                 setProgress(prev => prev + 1);
               } else if (data.error) {
                   console.error('Row error:', data.error);
               }
            } catch (e) {
                // ignore parse error for non-json data
            }
          }
        }
      }

    } catch (err) {
      console.error('Batch run failed', err);
      toast.error(t('batch.run_failed'));
    } finally {
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <BackButton to="/prompts" label={t('common.back')} />
          <h1 className="text-3xl font-bold mt-4">{t('batch.title')}</h1>
          <p className="text-gray-600">{t('batch.subtitle')}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-bold mb-4">{t('batch.select_label')}</h2>
              <select
                className="w-full rounded border p-2"
                value={selectedPromptId}
                onChange={(e) => setSelectedPromptId(e.target.value)}
              >
                <option value="">-- {t('playground.select_prompt')} --</option>
                {prompts.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-bold mb-4">{t('batch.input_label')}</h2>
              
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('batch.step_download')}</label>
                      <button
                        onClick={handleDownloadTemplate}
                        disabled={!selectedPromptId}
                        className="w-full rounded border border-blue-500 px-4 py-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400"
                      >
                        {t('batch.btn_download_template')}
                      </button>
                      <p className="text-xs text-gray-500 mt-1">{t('batch.download_desc')}</p>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('batch.step_upload')}</label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                  </div>
              </div>
            </div>
            
            <button
                onClick={handleRun}
                disabled={isRunning || !selectedPromptId || rows.length === 0}
                className={`w-full rounded bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 ${isRunning || !selectedPromptId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isRunning ? `${t('playground.running')} (${progress}/${rows.length})...` : t('batch.start_button')}
            </button>
            
             <button
                onClick={handleExport}
                disabled={rows.length === 0}
                className="w-full rounded border border-green-600 px-6 py-3 font-bold text-green-600 hover:bg-green-50 disabled:opacity-50"
            >
                {t('batch.download_button')}
            </button>
          </div>

          <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow overflow-hidden flex flex-col">
            <h2 className="text-lg font-bold mb-4">{t('batch.preview_label')}</h2>
            <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-2 border-r text-sm font-semibold w-12">#</th>
                            {headers.map(h => (
                                <th key={h} className="p-2 border-r text-sm font-semibold">{h}</th>
                            ))}
                            <th className="p-2 text-sm font-semibold min-w-[200px]">{t('batch.result_header')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="p-2 border-r text-sm text-gray-500">{i + 1}</td>
                                {headers.map(h => (
                                    <td key={h} className="p-2 border-r text-sm">{row[h]}</td>
                                ))}
                                <td className="p-2 text-sm">
                                    {row._status === 'pending' ? (
                                        <span className="text-gray-400 italic">{t('batch.pending')}</span>
                                    ) : (
                                        <div className="max-h-24 overflow-y-auto whitespace-pre-wrap">{row._result}</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={headers.length + 2} className="p-8 text-center text-gray-400">
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
