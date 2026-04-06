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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1200px]">
        <BackButton to="/dashboard" label={t('common.dashboard')} />
        
        <div className="flex justify-between items-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('knowledge.title')}</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + {t('knowledge.create_button')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow p-4 min-h-[500px]">
              <h2 className="text-sm font-bold text-gray-500 uppercase mb-4">{t('knowledge.title')}</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400">{t('common.loading')}</div>
              ) : kbs.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic">{t('knowledge.no_kbs')}</div>
              ) : (
                <div className="space-y-2">
                  {kbs.map(kb => (
                    <div 
                      key={kb.id} 
                      className={`p-4 rounded border cursor-pointer hover:border-blue-300 transition ${selectedKb?.id === kb.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => handleSelectKb(kb)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">{kb.name}</h3>
                        <div className="flex gap-1">
                            {!currentWorkspace && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setMoveKbId(kb.id); setTargetWorkspaceId(workspaces[0]?.id || ''); }} 
                                    className="text-orange-500 hover:text-orange-700 text-xs px-2 py-1 rounded hover:bg-orange-50"
                                >
                                    Move
                                </button>
                            )}
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteKb(kb.id); }} 
                                className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                            >
                                Delete
                            </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{kb.description || 'No description'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail Column */}
          <div className="lg:col-span-2">
            {selectedKb ? (
              <div className="bg-white rounded-lg shadow p-6 min-h-[500px]">
                <div className="flex justify-between items-start mb-6 border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedKb.name}</h2>
                    <p className="text-gray-500">{selectedKb.description}</p>
                  </div>
                  <div>
                    <label className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
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
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">{t('knowledge.documents')} ({documents.length})</h3>
                  {documents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-400">
                      {t('knowledge.no_documents')}
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {documents.map(doc => (
                        <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📄</span>
                            <div>
                              <div className="font-medium text-gray-700">{doc.filename}</div>
                              <div className="text-xs text-gray-400">
                                {doc.fileType} • {(doc.fileSize / 1024).toFixed(1)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-gray-400 hover:text-red-500 p-2"
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
              <div className="bg-white rounded-lg shadow p-6 min-h-[500px] flex items-center justify-center text-gray-400">
                {t('knowledge.select_kb')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('knowledge.create_title')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('knowledge.name_label')}</label>
                <input 
                  className="w-full border rounded p-2"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={t('knowledge.name_placeholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('knowledge.desc_label')}</label>
                <textarea 
                  className="w-full border rounded p-2"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder={t('knowledge.desc_placeholder')}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  onClick={handleCreateKb}
                  disabled={!newName}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
              <Dialog.Panel className="w-full max-w-sm rounded bg-white p-6 shadow-xl">
                  <Dialog.Title className="text-lg font-bold mb-4">Move Knowledge Base to Workspace</Dialog.Title>
                  <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Target Workspace</label>
                      <select 
                          className="w-full border rounded px-3 py-2"
                          value={targetWorkspaceId}
                          onChange={e => setTargetWorkspaceId(e.target.value)}
                      >
                          {workspaces.map(ws => (
                              <option key={ws.id} value={ws.id}>{ws.name}</option>
                          ))}
                      </select>
                  </div>
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setMoveKbId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                      <button 
                          onClick={handleMove} 
                          disabled={!targetWorkspaceId}
                          className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-50"
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
