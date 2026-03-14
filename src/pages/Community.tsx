import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';
import { 
  HeartIcon as HeartOutline, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface Comment {
    id: string;
    userId: string;
    username: string;
    content: string;
    createdAt: string;
}

export default function Community() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { workspaces } = useWorkspaceStore();
  
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fork State
  const [forkPromptId, setForkPromptId] = useState<string | null>(null);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>(''); // '' means personal

  // Comment State
  const [activePromptId, setActivePromptId] = useState<string | null>(null); // For showing comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    loadCommunityPrompts();
  }, []);

  const loadCommunityPrompts = async () => {
    try {
      // Assuming backend getAll returns public prompts if no userId/workspaceId
      // Or we need a dedicated getPublic endpoint. For now reusing getAll with filter
      const data = await promptService.getAll(); 
      // Filter for isPublic=true in frontend for MVP if backend doesn't support
      const publicPrompts = data.filter((p: any) => p.isPublic);
      setPrompts(publicPrompts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFork = async () => {
      if (!forkPromptId) return;
      try {
          await promptService.fork(forkPromptId, targetWorkspaceId || undefined);
          toast.success('Prompt forked successfully');
          setForkPromptId(null);
      } catch (error) {
          toast.error('Failed to fork prompt');
      }
  };

  const loadComments = async (promptId: string) => {
      setActivePromptId(promptId);
      setLoadingComments(true);
      try {
          const data = await promptService.getComments(promptId);
          setComments(data);
      } catch (error) {
          console.error(error);
      } finally {
          setLoadingComments(false);
      }
  };

  const handlePostComment = async () => {
      if (!activePromptId || !newComment.trim()) return;
      try {
          const comment = await promptService.addComment(activePromptId, newComment);
          setComments([comment, ...comments]);
          setNewComment('');
          toast.success('Comment posted');
      } catch (error) {
          toast.error('Failed to post comment');
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Community Square</h1>
        
        {loading ? (
            <div>Loading...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prompts.map(prompt => (
                    <div key={prompt.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-5 flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <UserCircleIcon className="w-6 h-6 text-gray-400" />
                                <span className="text-sm text-gray-600 font-medium">User {prompt.userId}</span>
                                <span className="text-xs text-gray-400 ml-auto">{new Date(prompt.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{prompt.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-3 mb-4">{prompt.content}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {prompt.tags?.map((tag: any) => (
                                    <span key={tag.id} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex gap-4">
                                <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition">
                                    <HeartOutline className="w-5 h-5" />
                                    <span className="text-xs">{prompt.likesCount || 0}</span>
                                </button>
                                <button 
                                    onClick={() => loadComments(prompt.id)}
                                    className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition"
                                >
                                    <ChatBubbleLeftIcon className="w-5 h-5" />
                                    <span className="text-xs">Comments</span>
                                </button>
                            </div>
                            
                            <button 
                                onClick={() => setForkPromptId(prompt.id)}
                                className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition font-medium text-sm"
                            >
                                <ShareIcon className="w-4 h-4" />
                                Fork
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Fork Dialog */}
        <Dialog open={!!forkPromptId} onClose={() => setForkPromptId(null)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-sm rounded bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-bold mb-4">Fork to Workspace</Dialog.Title>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Target Workspace</label>
                        <select 
                            className="w-full border rounded px-3 py-2"
                            value={targetWorkspaceId}
                            onChange={e => setTargetWorkspaceId(e.target.value)}
                        >
                            <option value="">Personal Workspace</option>
                            {workspaces.map(ws => (
                                <option key={ws.id} value={ws.id}>{ws.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setForkPromptId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button 
                            onClick={handleFork} 
                            className="px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded"
                        >
                            Fork Prompt
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>

        {/* Comments Dialog */}
        <Dialog open={!!activePromptId} onClose={() => setActivePromptId(null)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-lg font-bold">Comments</Dialog.Title>
                        <button onClick={() => setActivePromptId(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                        {loadingComments ? (
                            <div className="text-center text-gray-400 py-4">Loading comments...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">No comments yet. Be the first!</div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-sm text-gray-800">{comment.username}</span>
                                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-auto border-t pt-4">
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 border rounded px-3 py-2 text-sm"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                            />
                            <button 
                                onClick={handlePostComment}
                                disabled={!newComment.trim()}
                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
      </div>
    </div>
  );
}
