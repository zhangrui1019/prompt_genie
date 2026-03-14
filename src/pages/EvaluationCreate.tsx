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
      { id: 'accuracy', label: 'Accuracy (Requires "expected" column)', desc: 'Checks if output matches expected' },
      { id: 'format', label: 'Format (JSON)', desc: 'Checks if output is valid JSON' },
      { id: 'safety', label: 'Safety', desc: 'Checks for blocked keywords' }
  ];

  useEffect(() => {
    if (user?.id) {
      promptService.getAll(user.id).then(setPrompts);
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
              varKeys = [...new Set(matches.map((m: string) => m.replace(/\{\{|\}\}/g, '').trim()))];
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <BackButton to="/evaluations" label={t('evaluations.back')} />
        <h1 className="text-3xl font-bold mt-4 mb-8">{t('evaluations.create_title')}</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('evaluations.name_label')}</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full border rounded px-3 py-2" 
                    placeholder={t('evaluations.name_placeholder')}
                    required 
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('evaluations.select_prompt')}</label>
                <select 
                    value={selectedPromptId} 
                    onChange={e => setSelectedPromptId(e.target.value)} 
                    className="w-full border rounded px-3 py-2"
                    required
                >
                    <option value="">-- {t('evaluations.select_prompt')} --</option>
                    {prompts.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('evaluations.dataset_label')}</label>
                <input 
                    type="file" 
                    accept=".csv,.xlsx" 
                    onChange={handleFileUpload}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">{t('evaluations.dataset_tip')}</p>
                
                {validationErrors.length > 0 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <p className="font-bold mb-1">Validation Errors:</p>
                        <ul className="list-disc list-inside">
                            {validationErrors.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {datasetPreview.length > 0 && (
                    <div className="mt-2 border rounded overflow-hidden">
                        <div className="bg-gray-50 px-3 py-1 text-xs font-bold text-gray-500 uppercase">Preview (Top 5 rows)</div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {datasetHeaders.map((h, i) => (
                                            <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {datasetPreview.map((row, i) => (
                                        <tr key={i}>
                                            {datasetHeaders.map((h, j) => (
                                                <td key={j} className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{row[h]}</td>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('evaluations.compare_models')}</label>
                <div className="space-y-2">
                    {availableModels.map(model => (
                        <label key={model.id} className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                checked={models.includes(model.id)} 
                                onChange={() => handleModelToggle(model.id)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>{model.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Dimensions</label>
                <div className="space-y-3">
                    {availableDimensions.map(dim => (
                        <label key={dim.id} className="flex items-start space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                            <input 
                                type="checkbox" 
                                checked={selectedDimensions.includes(dim.id)} 
                                onChange={() => handleDimensionToggle(dim.id)}
                                className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <div className="font-medium text-gray-800">{dim.label}</div>
                                <div className="text-xs text-gray-500">{dim.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting || !file || selectedDimensions.length === 0}
                className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
            >
                {isSubmitting ? t('evaluations.creating') : t('evaluations.start_button')}
            </button>
        </form>
      </div>
    </div>
  );
}
