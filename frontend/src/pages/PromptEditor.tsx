import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import BackButton from '@/components/BackButton';
import * as Diff from 'diff';

import { Tag, PromptVersion } from '@/types';

import MarkdownEditor from '@uiw/react-markdown-editor';

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
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  
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

  const diffResult = useMemo(() => {
    if (!compareVersionId || !versions.length) return null;
    const v = versions.find(v => v.id === compareVersionId);
    if (!v) return null;
    
    // Compare current editor content with selected version content
    return Diff.diffLines(v.content, content);
  }, [content, compareVersionId, versions]);

  const handleCreateVersion = async () => {
    if (!id) return;
    const note = prompt(t('editor.enter_note'));
    if (note === null) return; // Cancelled
    
    try {
      await promptService.createVersion(id, note);
      toast.success(t('editor.version_saved'));
      fetchVersions(id);
    } catch (err) {
      toast.error(t('editor.version_save_failed'));
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!id || !confirm(t('editor.restore_confirm'))) return;
    
    try {
      const updatedPrompt = await promptService.restoreVersion(id, versionId);
      setTitle(updatedPrompt.title);
      setContent(updatedPrompt.content);
      toast.success(t('editor.restored_success'));
      fetchVersions(id);
    } catch (err) {
      toast.error(t('editor.restore_failed'));
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
      setPlaygroundOutput(t('playground.error_msg'));
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
      setError(t('editor.prompt_load_failed'));
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
            setError(t('editor.user_not_identified'));
            return;
        }
        await promptService.create({ 
            title, 
            content,
            variables: variablesObj,
            tags,
            isPublic
        });
      }
      toast.success(isEditing ? t('editor.prompt_updated') : t('editor.prompt_created'));
      navigate('/prompts');
    } catch (err) {
      console.error('Failed to save prompt', err);
      setError(t('editor.save_failed'));
      toast.error(t('editor.save_failed'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center">{t('common.loading')}</div>;

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

      <div className={`mx-auto transition-all duration-300 ${sidebarMode !== 'none' ? 'max-w-[1600px] grid grid-cols-1 lg:grid-cols-3 gap-6' : 'max-w-[1200px]'}`}>
        
        {/* Main Editor */}
        <div className={`${sidebarMode !== 'none' ? 'lg:col-span-2' : ''} rounded-lg bg-gray-800/60 p-8 shadow border border-gray-700 z-10`}>
            <BackButton to="/prompts" label={t('common.back')} />

            <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">{isEditing ? t('editor.edit_title') : t('editor.new_title')}</h1>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => setSidebarMode(sidebarMode === 'playground' ? 'none' : 'playground')}
                    className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded border ${sidebarMode === 'playground' ? 'bg-purple-900/30 border-purple-700 text-purple-400' : 'border-gray-600 text-gray-300 hover:bg-gray-700/30'}`}
                >
                    <span className="text-lg">▶</span> {t('playground.run_button')}
                </button>
                {isEditing && (
                    <button
                    type="button"
                    onClick={() => setSidebarMode(sidebarMode === 'history' ? 'none' : 'history')}
                    className={`text-sm font-medium px-3 py-1 rounded border ${sidebarMode === 'history' ? 'bg-blue-900/30 border-blue-700 text-blue-400' : 'border-gray-600 text-gray-300 hover:bg-gray-700/30'}`}
                >
                    {t('editor.version_history')}
                </button>
                )}
                <label className="flex items-center cursor-pointer">
                    <div className="relative">
                    <input type="checkbox" className="sr-only" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                    <div className={`block w-10 h-6 rounded-full ${isPublic ? 'bg-green-600' : 'bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isPublic ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-gray-300 font-medium text-sm">
                    {t('editor.public')}
                    </div>
                </label>
            </div>
            </div>

            {error && (
            <div className="mb-4 rounded bg-red-900/30 p-4 text-red-400 border border-red-800">
                {error}
            </div>
            )}

            <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-300" htmlFor="title">
                {t('editor.title_label')}
                </label>
                <input
                className="w-full appearance-none rounded border border-gray-600 bg-gray-800 px-3 py-2 leading-tight text-gray-300 shadow focus:outline-none focus:shadow-outline"
                id="title"
                type="text"
                placeholder={t('editor.title_placeholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                />
            </div>

            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-300">
                {t('editor.tags_label')}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center rounded-full bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-400 border border-blue-800">
                    {tag.name}
                    <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full text-blue-400 hover:bg-blue-800/50 focus:outline-none"
                    >
                        &times;
                    </button>
                    </span>
                ))}
                </div>
                <input
                type="text"
                className="w-full appearance-none rounded border border-gray-600 bg-gray-800 px-3 py-2 leading-tight text-gray-300 shadow focus:outline-none focus:shadow-outline"
                placeholder={t('editor.tag_placeholder')}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                />
            </div>
            
            <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-gray-300" htmlFor="content">
                {t('editor.content_label')}
                </label>
                <div className="border border-gray-600 rounded-md overflow-hidden shadow-sm relative bg-gray-800">
                  {diffResult ? (
                    <div className="absolute inset-0 bg-gray-800 z-10 p-4 overflow-auto border-l-4 border-yellow-600">
                        <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-800 pb-2 border-b border-gray-700">
                            <h3 className="font-bold text-gray-300">Version Diff (v{versions.find(v => v.id === compareVersionId)?.versionNumber} vs Current)</h3>
                            <button onClick={() => setCompareVersionId(null)} type="button" className="text-gray-400 hover:text-gray-300">Close Diff</button>
                        </div>
                        <div className="font-mono text-sm whitespace-pre-wrap">
                            {diffResult.map((part, index) => (
                                <span 
                                    key={index} 
                                    className={part.added ? 'bg-green-900/30 text-green-400' : part.removed ? 'bg-red-900/30 text-red-400 decoration-line-through' : 'text-gray-300'}
                                >
                                    {part.value}
                                </span>
                            ))}
                        </div>
                    </div>
                  ) : (
                    <MarkdownEditor
                      value={content}
                      onChange={(value) => setContent(value)}
                      height="400px"
                      enableScroll={true}
                      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', backgroundColor: '#1f2937', color: '#e5e7eb' }}
                    />
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                {t('editor.variable_tip')}
                </p>
            </div>

            <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-gray-300">
                {t('editor.variables_label')} ({t('editor.default_values')})
                </label>
                {variables.map((variable, index) => (
                <div key={index} className="mb-2 flex gap-2">
                    <input
                    type="text"
                    placeholder={t('editor.variable_key_placeholder')}
                    className="flex-1 appearance-none rounded border border-gray-600 bg-gray-800 px-3 py-2 leading-tight text-gray-300 shadow focus:outline-none focus:shadow-outline"
                    value={variable.key}
                    onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                    />
                    <input
                    type="text"
                    placeholder={t('editor.variable_value_placeholder')}
                    className="flex-1 appearance-none rounded border border-gray-600 bg-gray-800 px-3 py-2 leading-tight text-gray-300 shadow focus:outline-none focus:shadow-outline"
                    value={variable.value}
                    onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                    />
                    <button
                    type="button"
                    onClick={() => handleRemoveVariable(index)}
                    className="rounded bg-red-900/30 px-3 py-2 text-red-400 hover:bg-red-800/50 border border-red-800"
                    >
                    &times;
                    </button>
                </div>
                ))}
                <button
                type="button"
                onClick={handleAddVariable}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300 font-semibold"
                >
                + {t('editor.add_variable')}
                </button>
            </div>

            <div className="flex items-center justify-end gap-4">
                <Link to="/prompts" className="rounded border border-gray-600 px-4 py-2 font-bold text-gray-300 hover:bg-gray-700/30">
                {t('common.cancel')}
                </Link>
                {isEditing && (
                    <button
                    type="button"
                    onClick={handleCreateVersion}
                    className="rounded border border-green-600 px-4 py-2 font-bold text-green-400 hover:bg-green-900/30"
                    >
                    {t('editor.save_version')}
                    </button>
                )}
                <button
                className={`rounded bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:shadow-outline ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                type="submit"
                disabled={loading}
                >
                {loading ? t('editor.saving') : t('editor.save_button')}
                </button>
            </div>
            </form>
        </div>

        {/* Sidebar: History or Playground */}
        {sidebarMode !== 'none' && (
            <div className="rounded-lg bg-gray-800/60 p-6 shadow h-fit max-h-[800px] overflow-y-auto flex flex-col border border-gray-700 z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{sidebarMode === 'history' ? t('editor.version_history') : t('playground.title')}</h2>
                    <button onClick={() => setSidebarMode('none')} className="text-gray-400 hover:text-gray-300">&times;</button>
                </div>

                {sidebarMode === 'history' && (
                    versions.length === 0 ? (
                        <p className="text-gray-400 text-sm">{t('editor.no_history')}</p>
                    ) : (
                        <div className="space-y-4">
                            {versions.map((v) => (
                                <div key={v.id} className={`border rounded p-3 text-sm relative ${compareVersionId === v.id ? 'border-blue-600 bg-blue-900/30' : 'border-gray-700 hover:border-gray-600'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-300">v{v.versionNumber}</span>
                                        <span className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-gray-400 mb-2 italic">{v.changeNote || 'No note'}</p>
                                    <div className="flex space-x-2 mt-2">
                                        <button
                                            onClick={() => handleRestoreVersion(v.id)}
                                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded flex-1"
                                        >
                                            {t('editor.restore_version')}
                                        </button>
                                        <button
                                            onClick={() => setCompareVersionId(compareVersionId === v.id ? null : v.id)}
                                            className={`text-xs px-2 py-1 rounded flex-1 ${compareVersionId === v.id ? 'bg-blue-600 text-white' : 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50'}`}
                                        >
                                            {compareVersionId === v.id ? 'Hide Diff' : 'Diff'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {sidebarMode === 'playground' && (
                    <div className="flex flex-col h-full">
                        <p className="text-sm text-gray-400 mb-4">{t('playground.subtitle')}</p>
                        
                        {variables.length > 0 && (
                            <div className="mb-4 space-y-3 border-b border-gray-700 pb-4">
                                <h3 className="text-sm font-bold text-gray-300">{t('playground.variables')}</h3>
                                {variables.map((v, i) => (
                                    <div key={i}>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">{v.key}</label>
                                        <input
                                            type="text"
                                            className="w-full text-sm border border-gray-600 bg-gray-800 rounded px-2 py-1 text-gray-300"
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
                            className="w-full rounded bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 font-bold text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 mb-4"
                        >
                            {isRunning ? t('playground.running') : t('playground.run_button')}
                        </button>

                        <div className="flex-1 min-h-[200px] bg-gray-900/60 rounded border border-gray-700 p-3 text-sm font-mono whitespace-pre-wrap overflow-auto text-gray-300">
                            {isRunning ? (
                                <span className="text-gray-400 italic">{t('playground.running')}...</span>
                            ) : (
                                playgroundOutput || <span className="text-gray-400 italic">{t('playground.output_label')}...</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
}
