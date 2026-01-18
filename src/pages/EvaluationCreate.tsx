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
  const [models, setModels] = useState<string[]>(['qwen-turbo']); // Default selected
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableModels = ['qwen-turbo', 'qwen-plus', 'qwen-max'];

  useEffect(() => {
    if (user?.id) {
      promptService.getAll(user.id).then(setPrompts);
    }
  }, [user]);

  const handleModelToggle = (model: string) => {
    if (models.includes(model)) {
        setModels(models.filter(m => m !== model));
    } else {
        setModels([...models, model]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !selectedPromptId || models.length === 0) return;

    setIsSubmitting(true);
    try {
        const modelConfigs = models.map(m => ({ model: m }));
        const dimensions = ['accuracy']; // Default
        
        await promptService.createEvaluation(name, selectedPromptId, file, modelConfigs, dimensions);
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
                    onChange={e => setFile(e.target.files?.[0] || null)} 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">{t('evaluations.dataset_tip')}</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('evaluations.compare_models')}</label>
                <div className="space-y-2">
                    {availableModels.map(model => (
                        <label key={model} className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                checked={models.includes(model)} 
                                onChange={() => handleModelToggle(model)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>{model}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting || !file}
                className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
            >
                {isSubmitting ? t('evaluations.creating') : t('evaluations.start_button')}
            </button>
        </form>
      </div>
    </div>
  );
}
