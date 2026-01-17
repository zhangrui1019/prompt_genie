import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import BackButton from '@/components/BackButton';

import { Tag, PromptVersion } from '@/types';

export default function PromptEditor() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isEditing = Boolean(id);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [variables, setVariables] = useState<{ key: string; value: string }[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState('');
  
  // Version Control
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [sidebarMode, setSidebarMode] = useState<'none' | 'history' | 'playground'>('none');
  
  // Playground
  const [playgroundOutput, setPlaygroundOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      fetchPrompt(id);
      fetchVersions(id);
    } else {
      setInitialLoading(false);
    }
  }, [id, isEditing]);
  
  // Sync test variables with defined variables when they change
  useEffect(() => {
    const newTestVars = { ...testVariables };
    variables.forEach(v => {
        if (!newTestVars[v.key]) {
            newTestVars[v.key] = v.value;
        }
    });
    setTestVariables(newTestVars);
  }, [variables]);

  const fetchVersions = async (promptId: string) => {
    try {
      const data = await promptService.getVersions(promptId);
      setVersions(data);
    } catch (err) {
      console.error('Failed to fetch versions', err);
    }
  };

  const handleCreateVersion = async () => {
    if (!id) return;
    const note = prompt('Enter a note for this version (optional):');
    if (note === null) return; // Cancelled
    
    try {
      await promptService.createVersion(id, note);
      toast.success('Version saved!');
      fetchVersions(id);
    } catch (err) {
      toast.error('Failed to save version');
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!id || !confirm('Are you sure? Current content will be overwritten (a backup version will be created).')) return;
    
    try {
      const updatedPrompt = await promptService.restoreVersion(id, versionId);
      setTitle(updatedPrompt.title);
      setContent(updatedPrompt.content);
      toast.success('Restored successfully!');
      fetchVersions(id);
    } catch (err) {
      toast.error('Failed to restore version');
    }
  };

  const handleRunPlayground = async () => {
    setIsRunning(true);
    setPlaygroundOutput('');
    try {
      // Use current content from editor, not saved content
      const result = await promptService.runPlayground(content, testVariables);
      setPlaygroundOutput(result.result);
    } catch (err) {
      setPlaygroundOutput('Error running prompt. Please check your network or API configuration.');
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const fetchPrompt = async (promptId: string) => {
    try {
      const data = await promptService.getById(promptId);
      setTitle(data.title);
      setContent(data.content);
      setIsPublic(data.isPublic || false);
      if (data.variables) {
        setVariables(Object.entries(data.variables).map(([key, value]) => ({ key, value: String(value) })));
      }
      if (data.tags) {
        setTags(data.tags);
      }
    } catch (err) {
      console.error('Failed to fetch prompt', err);
      setError('Failed to load prompt details.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAddVariable = () => {
    setVariables([...variables, { key: '', value: '' }]);
  };

  const handleVariableChange = (index: number, field: 'key' | 'value', val: string) => {
    const newVars = [...variables];
    newVars[index][field] = val;
    setVariables(newVars);
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.some(t => t.name === tagInput.trim())) {
        setTags([...tags, { name: tagInput.trim() }]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const variablesObj = variables.reduce((acc, curr) => {
      if (curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, any>);

    try {
      if (isEditing && id) {
        await promptService.update(id, { title, content, variables: variablesObj, tags, isPublic });
      } else {
        if (!user?.id) {
            setError('User not identified. Please login again.');
            return;
        }
        await promptService.create({ 
            title, 
            content,
            variables: variablesObj,
            tags,
            isPublic,
            userId: user.id
        });
      }
      toast.success(isEditing ? 'Prompt updated' : 'Prompt created');
      navigate('/prompts');
    } catch (err) {
      console.error('Failed to save prompt', err);
      setError('Failed to save prompt.');
      toast.error('Failed to save prompt.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className={`mx-auto transition-all duration-300 ${sidebarMode !== 'none' ? 'max-w-[1600px] grid grid-cols-1 lg:grid-cols-3 gap-6' : 'max-w-[1200px]'}`}>
        
        {/* Main Editor */}
        <div className={`${sidebarMode !== 'none' ? 'lg:col-span-2' : ''} rounded-lg bg-white p-8 shadow`}>
            <BackButton to="/prompts" label={t('common.back')} />

            <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">{isEditing ? t('editor.edit_title') : t('editor.new_title')}</h1>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => setSidebarMode(sidebarMode === 'playground' ? 'none' : 'playground')}
                    className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded border ${sidebarMode === 'playground' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                    <span className="text-lg">▶</span> {t('playground.run_button')}
                </button>
                {isEditing && (
                    <button
                        type="button"
                        onClick={() => setSidebarMode(sidebarMode === 'history' ? 'none' : 'history')}
                        className={`text-sm font-medium px-3 py-1 rounded border ${sidebarMode === 'history' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                        History
                    </button>
                )}
                <label className="flex items-center cursor-pointer">
                    <div className="relative">
                    <input type="checkbox" className="sr-only" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                    <div className={`block w-10 h-6 rounded-full ${isPublic ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isPublic ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium text-sm">
                    {t('editor.public')}
                    </div>
                </label>
            </div>
            </div>

            {error && (
            <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
                {error}
            </div>
            )}

            <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="title">
                {t('editor.title_label')}
                </label>
                <input
                className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline"
                id="title"
                type="text"
                placeholder="e.g. Email Summarizer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                />
            </div>

            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                {t('editor.tags_label')}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {tag.name}
                    <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                    >
                        &times;
                    </button>
                    </span>
                ))}
                </div>
                <input
                type="text"
                className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline"
                placeholder="Type tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                />
            </div>
            
            <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="content">
                {t('editor.content_label')}
                </label>
                <textarea
                className="h-64 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline font-mono"
                id="content"
                placeholder="Enter your prompt here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                />
                <p className="mt-1 text-xs text-gray-500">
                Tip: You can use variables like {'{{variable_name}}'} in your prompt.
                </p>
            </div>

            <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                {t('editor.variables_label')} (Default Values)
                </label>
                {variables.map((variable, index) => (
                <div key={index} className="mb-2 flex gap-2">
                    <input
                    type="text"
                    placeholder="Key (e.g. topic)"
                    className="flex-1 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline"
                    value={variable.key}
                    onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                    />
                    <input
                    type="text"
                    placeholder="Default Value"
                    className="flex-1 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline"
                    value={variable.value}
                    onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                    />
                    <button
                    type="button"
                    onClick={() => handleRemoveVariable(index)}
                    className="rounded bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
                    >
                    &times;
                    </button>
                </div>
                ))}
                <button
                type="button"
                onClick={handleAddVariable}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                + {t('editor.add_variable')}
                </button>
            </div>

            <div className="flex items-center justify-end gap-4">
                <Link to="/prompts" className="rounded border border-gray-300 px-4 py-2 font-bold text-gray-700 hover:bg-gray-100">
                {t('common.cancel')}
                </Link>
                {isEditing && (
                    <button
                    type="button"
                    onClick={handleCreateVersion}
                    className="rounded border border-green-600 px-4 py-2 font-bold text-green-600 hover:bg-green-50"
                    >
                    Save Version
                    </button>
                )}
                <button
                className={`rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                type="submit"
                disabled={loading}
                >
                {loading ? 'Saving...' : t('editor.save_button')}
                </button>
            </div>
            </form>
        </div>

        {/* Sidebar: History or Playground */}
        {sidebarMode !== 'none' && (
            <div className="rounded-lg bg-white p-6 shadow h-fit max-h-[800px] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{sidebarMode === 'history' ? 'Version History' : t('playground.title')}</h2>
                    <button onClick={() => setSidebarMode('none')} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                {sidebarMode === 'history' && (
                    versions.length === 0 ? (
                        <p className="text-gray-500 text-sm">No history yet. Save a version to start tracking.</p>
                    ) : (
                        <div className="space-y-4">
                            {versions.map(v => (
                                <div key={v.id} className="border-b border-gray-100 pb-3 last:border-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-800">v{v.versionNumber}</span>
                                        <span className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {v.changeNote && <p className="text-xs text-gray-600 italic mb-2">"{v.changeNote}"</p>}
                                    <div className="text-xs text-gray-400 mb-2 line-clamp-2">{v.content.substring(0, 100)}...</div>
                                    <button
                                        onClick={() => handleRestoreVersion(v.id)}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded w-full"
                                    >
                                        Restore this version
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {sidebarMode === 'playground' && (
                    <div className="flex flex-col h-full">
                        <p className="text-sm text-gray-600 mb-4">{t('playground.subtitle')}</p>
                        
                        {variables.length > 0 && (
                            <div className="mb-4 space-y-3 border-b pb-4">
                                <h3 className="text-sm font-bold text-gray-700">{t('playground.variables')}</h3>
                                {variables.map((v, i) => (
                                    <div key={i}>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">{v.key}</label>
                                        <input
                                            type="text"
                                            className="w-full text-sm border rounded px-2 py-1"
                                            value={testVariables[v.key] || ''}
                                            onChange={(e) => setTestVariables({...testVariables, [v.key]: e.target.value})}
                                            placeholder={`Value for ${v.key}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleRunPlayground}
                            disabled={isRunning}
                            className="w-full rounded bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700 disabled:opacity-50 mb-4"
                        >
                            {isRunning ? t('playground.running') : t('playground.run_button')}
                        </button>

                        <div className="flex-1 min-h-[200px] bg-gray-50 rounded border p-3 text-sm font-mono whitespace-pre-wrap overflow-auto">
                            {playgroundOutput || <span className="text-gray-400 italic">{t('playground.output_label')}...</span>}
                        </div>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
}
