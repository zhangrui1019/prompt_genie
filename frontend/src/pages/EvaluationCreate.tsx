import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function EvaluationCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [prompts, setPrompts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [models, setModels] = useState<string[]>([]); // Default selected handled in effect
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['accuracy']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datasetPreview, setDatasetPreview] = useState<any[]>([]);
  const [datasetHeaders, setDatasetHeaders] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const availableDimensions = [
      { id: 'accuracy', label: '准确性（需要expected列）', desc: '检查输出是否与预期匹配' },
      { id: 'format', label: '格式（JSON）', desc: '检查输出是否为有效 JSON' },
      { id: 'safety', label: '安全性', desc: '检查是否包含被屏蔽的关键词' },
      { id: 'llm_judge', label: 'LLM 评判', desc: '使用 GPT-4 评估输出质量' }
  ];

  useEffect(() => {
    if (user?.id) {
      promptService.getAll().then(setPrompts);
      promptService.getModelCatalog().then(catalog => {
        const list = catalog.text || [];
        setAvailableModels(list);
        if (models.length === 0 && list.length > 0) {
          setModels([list[0].id]);
        }
      });
    }
  }, [user]);

  const handleModelToggle = (model: string) => {
    if (models.includes(model)) {
        setModels(models.filter(m => m !== model));
    } else {
        setModels([...models, model]);
    }
  };

  const handleDimensionToggle = (dimId: string) => {
    if (selectedDimensions.includes(dimId)) {
        // Prevent deselecting if it's the last one
        if (selectedDimensions.length > 1) {
            setSelectedDimensions(selectedDimensions.filter(d => d !== dimId));
        } else {
            toast.error('At least one dimension must be selected');
        }
    } else {
        setSelectedDimensions([...selectedDimensions, dimId]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null;
      setFile(selectedFile);
      setDatasetHeaders([]);
      setDatasetPreview([]);
      setValidationErrors([]);
      
      if (!selectedFile) return;
      
      // Basic CSV parsing for preview
      if (selectedFile.name.endsWith('.csv')) {
          const text = await selectedFile.text();
          const lines = text.trim().split(/\r?\n/);
          if (lines.length > 0) {
              const headers = lines[0].split(',').map(h => h.trim());
              setDatasetHeaders(headers);
              
              const preview = lines.slice(1, 6).map(line => {
                  if (!line.trim()) return null;
                  const values = line.split(',').map(v => v.trim());
                  const row: Record<string, string> = {};
                  headers.forEach((h, i) => {
                      row[h] = values[i] || '';
                  });
                  return row;
              }).filter(r => r !== null);
              
              setDatasetPreview(preview);
              validateDataset(headers, selectedPromptId);
          }
      } else {
          // For Excel we'd ideally need a library like xlsx, for MVP just skip preview
          setDatasetHeaders(['Preview not available for Excel files. Ensure headers match prompt variables.']);
      }
  };

  const validateDataset = (headers: string[], promptId: string) => {
      if (!promptId || headers.length === 0) return;
      const prompt = prompts.find(p => p.id === promptId);
      if (!prompt) return;

      const errors: string[] = [];
      let varKeys: string[] = [];
      
      if (prompt.variables && Object.keys(prompt.variables).length > 0) {
          varKeys = Object.keys(prompt.variables);
      } else if (prompt.content) {
          const matches = prompt.content.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
          if (matches) {
              varKeys = [...new Set(matches.map((m: string) => m.replace(/\{\{|\}\}/g, '').trim()))] as string[];
          }
      }

      varKeys.forEach(key => {
          if (!headers.includes(key)) {
              errors.push(`Missing required column for variable: {{${key}}}`);
          }
      });
      
      setValidationErrors(errors);
  };

  useEffect(() => {
      if (selectedPromptId && datasetHeaders.length > 0) {
          validateDataset(datasetHeaders, selectedPromptId);
      }
  }, [selectedPromptId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !selectedPromptId || models.length === 0 || selectedDimensions.length === 0) return;
    
    if (validationErrors.length > 0) {
        toast.error('Please fix dataset mapping errors before continuing');
        return;
    }

    setIsSubmitting(true);
    try {
        const modelConfigs = models.map(m => ({ model: m }));
        
        await promptService.createEvaluation(name, selectedPromptId, file, modelConfigs, selectedDimensions);
        toast.success(t('evaluations.success_msg'));
        navigate('/evaluations');
    } catch (error) {
        console.error(error);
        toast.error(t('evaluations.failed_msg'));
    } finally {
        setIsSubmitting(false);
    }
  };

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

      <div className="mx-auto max-w-2xl z-10">
        <BackButton to="/evaluations" label={t('evaluations.back')} />
        <h1 className="text-3xl font-bold mt-4 mb-8 text-white">{t('evaluations.create_title')}</h1>

        <form onSubmit={handleSubmit} className="bg-gray-800/60 rounded-lg shadow p-6 space-y-6 border border-gray-700">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('evaluations.name_label')}</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full border border-gray-600 bg-gray-800 text-gray-300 rounded px-3 py-2" 
                    placeholder={t('evaluations.name_placeholder')}
                    required 
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('evaluations.select_prompt')}</label>
                <select 
                    value={selectedPromptId} 
                    onChange={e => setSelectedPromptId(e.target.value)} 
                    className="w-full border border-gray-600 bg-gray-800 text-gray-300 rounded px-3 py-2"
                    required
                >
                    <option value="">-- {t('evaluations.select_prompt')} --</option>
                    {prompts.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('evaluations.dataset_label')}</label>
                <input 
                    type="file" 
                    accept=".csv,.xlsx" 
                    onChange={handleFileUpload}
                    className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900/30 file:text-blue-400 hover:file:bg-blue-800/50"
                    required
                />
                <p className="text-xs text-gray-400 mt-1">{t('evaluations.dataset_tip')}</p>
                
                {validationErrors.length > 0 && (
                    <div className="mt-2 p-2 bg-red-900/30 border border-red-800 rounded text-xs text-red-400">
                        <p className="font-bold mb-1">Validation Errors:</p>
                        <ul className="list-disc list-inside">
                            {validationErrors.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {datasetPreview.length > 0 && (
                    <div className="mt-2 border border-gray-700 rounded overflow-hidden">
                        <div className="bg-gray-700/50 px-3 py-1 text-xs font-bold text-gray-300 uppercase">Preview (Top 5 rows)</div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700/50">
                                    <tr>
                                        {datasetHeaders.map((h, i) => (
                                            <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800/40 divide-y divide-gray-700">
                                    {datasetPreview.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-700/30">
                                            {datasetHeaders.map((h, j) => (
                                                <td key={j} className="px-3 py-2 whitespace-nowrap text-xs text-gray-300">{row[h]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('evaluations.compare_models')}</label>
                <div className="space-y-2">
                    {availableModels.map(model => (
                        <label key={model.id} className="flex items-center space-x-2 text-gray-300">
                            <input 
                                type="checkbox" 
                                checked={models.includes(model.id)} 
                                onChange={() => handleModelToggle(model.id)}
                                className="rounded text-blue-400 focus:ring-blue-500"
                            />
                            <span>{model.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">评测维度</label>
                <div className="space-y-3">
                    {availableDimensions.map(dim => (
                        <label key={dim.id} className="flex items-start space-x-3 cursor-pointer p-2 rounded hover:bg-gray-700/30">
                            <input 
                                type="checkbox" 
                                checked={selectedDimensions.includes(dim.id)} 
                                onChange={() => handleDimensionToggle(dim.id)}
                                className="mt-1 rounded text-blue-400 focus:ring-blue-500"
                            />
                            <div>
                                <div className="font-medium text-white">{dim.label}</div>
                                <div className="text-xs text-gray-400">{dim.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting || !file || selectedDimensions.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
                {isSubmitting ? t('evaluations.creating') : t('evaluations.start_button')}
            </button>
        </form>
      </div>
    </div>
  );
}
