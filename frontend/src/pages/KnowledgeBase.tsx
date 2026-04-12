import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { promptService } from '@/lib/api';
import BackButton from '@/components/BackButton';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { Dialog } from '@headlessui/react';

export default function KnowledgeBase() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { workspaces, currentWorkspace } = useWorkspaceStore();
  
  const [kbs, setKbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKb, setSelectedKb] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  // Upload State
  const [uploading, setUploading] = useState(false);

  // Move State
  const [moveKbId, setMoveKbId] = useState<string | null>(null);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadKbs();
    }
  }, [user?.id, currentWorkspace]);

  const loadKbs = async () => {
    setLoading(true);
    try {
      // TODO: Backend filter by workspaceId
      const data = await promptService.getKnowledgeBases();
      const filtered = data.filter((kb: any) => {
          if (currentWorkspace) return kb.workspaceId === currentWorkspace.id;
          return !kb.workspaceId;
      });
      setKbs(filtered);
    } catch (error) {
      toast.error(t('knowledge.created_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
      if (!moveKbId || !targetWorkspaceId) return;
      try {
          await promptService.moveKnowledgeBase(moveKbId, targetWorkspaceId);
          toast.success('Knowledge Base moved successfully');
          setMoveKbId(null);
          setTargetWorkspaceId('');
          loadKbs();
      } catch (err: any) {
          console.error(err);
          toast.error('Failed to move KB');
      }
  };

  const loadDocuments = async (kbId: string) => {
    try {
      const docs = await promptService.getDocuments(kbId);
      setDocuments(docs);
    } catch (error) {
      toast.error(t('knowledge.load_doc_error'));
    }
  };

  const handleCreateKb = async () => {
    if (!newName) return;
    try {
      await promptService.createKnowledgeBase(newName, newDesc);
      setShowCreateModal(false);
      setNewName('');
      setNewDesc('');
      toast.success(t('knowledge.created_success'));
      loadKbs();
    } catch (error) {
      toast.error(t('knowledge.created_error'));
    }
  };

  const handleDeleteKb = async (id: string) => {
    if (!confirm(t('knowledge.delete_kb_confirm'))) return;
    try {
      await promptService.deleteKnowledgeBase(id);
      toast.success(t('knowledge.delete_success'));
      if (selectedKb?.id === id) setSelectedKb(null);
      loadKbs();
    } catch (error) {
      toast.error(t('common.delete') + ' Failed');
    }
  };

  const handleSelectKb = (kb: any) => {
    setSelectedKb(kb);
    loadDocuments(kb.id);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedKb) return;
    
    const file = e.target.files[0];
    setUploading(true);
    try {
      await promptService.uploadDocument(selectedKb.id, file);
      toast.success(t('knowledge.upload_success'));
      loadDocuments(selectedKb.id);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || t('knowledge.upload_error');
      toast.error(msg);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm(t('knowledge.delete_doc_confirm'))) return;
    try {
      await promptService.deleteDocument(docId);
      toast.success(t('knowledge.delete_success'));
      if (selectedKb) loadDocuments(selectedKb.id);
    } catch (error) {
      toast.error(t('common.delete') + ' Failed');
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

      <div className="mx-auto max-w-[1200px] z-10">
        <BackButton to="/dashboard" label={t('common.dashboard')} />
        
        <div className="flex justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-white">{t('knowledge.title')}</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium"
          >
            + {t('knowledge.create_button')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-800/60 rounded-lg shadow p-4 min-h-[500px] border border-gray-700">
              <h2 className="text-sm font-bold text-gray-300 uppercase mb-4">{t('knowledge.title')}</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400">{t('common.loading')}</div>
              ) : kbs.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic">{t('knowledge.no_kbs')}</div>
              ) : (
                <div className="space-y-2">
                  {kbs.map(kb => (
                    <div 
                      key={kb.id} 
                      className={`p-4 rounded border cursor-pointer transition ${selectedKb?.id === kb.id ? 'border-blue-500 bg-blue-900/30' : 'border-gray-600 hover:border-gray-500'}`}
                      onClick={() => handleSelectKb(kb)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white">{kb.name}</h3>
                        <div className="flex gap-1">
                            {!currentWorkspace && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setMoveKbId(kb.id); setTargetWorkspaceId(workspaces[0]?.id || ''); }} 
                                    className="text-orange-400 hover:text-orange-300 text-xs px-2 py-1 rounded hover:bg-orange-900/30"
                                >
                                    Move
                                </button>
                            )}
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteKb(kb.id); }} 
                                className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900/30"
                            >
                                Delete
                            </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{kb.description || 'No description'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail Column */}
          <div className="lg:col-span-2">
            {selectedKb ? (
              <div className="bg-gray-800/60 rounded-lg shadow p-6 min-h-[500px] border border-gray-700">
                <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedKb.name}</h2>
                    <p className="text-gray-400">{selectedKb.description}</p>
                  </div>
                  <div>
                    <label className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${uploading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'}`}>
                      {uploading ? t('knowledge.uploading') : t('knowledge.upload_button')}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleUpload} 
                        disabled={uploading}
                        accept=".txt,.md,.json,.csv,.log" 
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-1 text-right">{t('knowledge.supported_formats')}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-300 uppercase mb-4">{t('knowledge.documents')} ({documents.length})</h3>
                  {documents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900/60 rounded border border-dashed border-gray-700 text-gray-400">
                      {t('knowledge.no_documents')}
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {documents.map(doc => (
                        <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-900/60 rounded border border-gray-700">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📄</span>
                            <div>
                              <div className="font-medium text-gray-300">{doc.filename}</div>
                              <div className="text-xs text-gray-400">
                                {doc.fileType} • {(doc.fileSize / 1024).toFixed(1)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-gray-400 hover:text-red-400 p-2"
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/60 rounded-lg shadow p-6 min-h-[500px] flex items-center justify-center text-gray-400 border border-gray-700">
                {t('knowledge.select_kb')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800/80 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">{t('knowledge.create_title')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t('knowledge.name_label')}</label>
                <input 
                  className="w-full border border-gray-600 bg-gray-900 text-gray-300 rounded p-2"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={t('knowledge.name_placeholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t('knowledge.desc_label')}</label>
                <textarea 
                  className="w-full border border-gray-600 bg-gray-900 text-gray-300 rounded p-2"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder={t('knowledge.desc_placeholder')}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  onClick={handleCreateKb}
                  disabled={!newName}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                >
                  {t('common.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move Dialog */}
      <Dialog open={!!moveKbId} onClose={() => setMoveKbId(null)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-sm rounded bg-gray-800/80 p-6 shadow-xl border border-gray-700">
                  <Dialog.Title className="text-lg font-bold mb-4 text-white">Move Knowledge Base to Workspace</Dialog.Title>
                  <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Select Target Workspace</label>
                      <select 
                          className="w-full border border-gray-600 bg-gray-900 text-gray-300 rounded px-3 py-2"
                          value={targetWorkspaceId}
                          onChange={e => setTargetWorkspaceId(e.target.value)}
                      >
                          {workspaces.map(ws => (
                              <option key={ws.id} value={ws.id}>{ws.name}</option>
                          ))}
                      </select>
                  </div>
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setMoveKbId(null)} className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">Cancel</button>
                      <button 
                          onClick={handleMove} 
                          disabled={!targetWorkspaceId}
                          className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded disabled:opacity-50"
                      >
                          Move
                      </button>
                  </div>
              </Dialog.Panel>
          </div>
      </Dialog>
    </div>
  );
}
