import { useState, useEffect } from 'react';
import { promptService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface Comment {
    id: string;
    userId: string;
    username: string;
    content: string;
    createdAt: string;
}

interface CommentsProps {
    promptId: string;
}

export default function Comments({ promptId }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        loadComments();
    }, [promptId]);

    const loadComments = async () => {
        try {
            const data = await promptService.getComments(promptId);
            setComments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        try {
            const added = await promptService.addComment(promptId, newComment);
            setComments([added, ...comments]);
            setNewComment('');
            toast.success('Comment added');
        } catch (err) {
            console.error(err);
            toast.error('Failed to add comment');
        }
    };

    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-bold text-sm mb-3 text-gray-700">Comments ({comments.length})</h4>
            
            {user ? (
                <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
                    <input 
                        className="flex-1 border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                        Post
                    </button>
                </form>
            ) : (
                <p className="text-xs text-gray-500 mb-4 italic">Login to comment</p>
            )}

            {loading ? (
                <div className="text-xs text-gray-400">Loading comments...</div>
            ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments.map(c => (
                        <div key={c.id} className="bg-gray-50 p-2 rounded text-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-xs text-blue-600">{c.username}</span>
                                <span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-700 text-xs">{c.content}</p>
                        </div>
                    ))}
                    {comments.length === 0 && <div className="text-xs text-gray-400">No comments yet.</div>}
                </div>
            )}
        </div>
    );
}
