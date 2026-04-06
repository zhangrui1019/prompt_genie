import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';

interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'prompt' | 'agent' | 'discussion';
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  promptId?: string;
  agentId?: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

export default function Community() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'prompts' | 'agents' | 'discussions'>('all');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');

  useEffect(() => {
    // Check if user is logged in
    if (!user?.id) {
      navigate('/login');
      toast.success('Please login to access the community');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Only fetch posts if user is logged in
    if (user?.id) {
      fetchCommunityPosts();
    }
  }, [filter, sort, user]);

  const fetchCommunityPosts = async () => {
    try {
      setLoading(true);
      // 这里应该调用获取社区帖子的API
      // 暂时使用模拟数据
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Prompt Master',
          userAvatar: 'https://i.pravatar.cc/150?img=1',
          type: 'prompt',
          title: 'How to write effective marketing prompts',
          content: 'I\'ve been experimenting with different prompt structures for marketing campaigns and found these techniques work best...',
          tags: ['Marketing', 'Prompt Engineering', 'Tips'],
          likes: 128,
          comments: 24,
          shares: 15,
          isLiked: false,
          isBookmarked: false,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          promptId: 'prompt1'
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'AI Enthusiast',
          userAvatar: 'https://i.pravatar.cc/150?img=2',
          type: 'agent',
          title: 'My customer support agent is now handling 80% of inquiries',
          content: 'I built a custom agent using the Agent Builder and it\'s been a game changer for my business...',
          tags: ['Agents', 'Customer Support', 'AI'],
          likes: 96,
          comments: 18,
          shares: 8,
          isLiked: true,
          isBookmarked: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          agentId: 'agent1'
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Data Scientist',
          userAvatar: 'https://i.pravatar.cc/150?img=3',
          type: 'discussion',
          title: 'Best practices for fine-tuning models',
          content: 'What are your favorite techniques for fine-tuning language models? I\'ve been having success with these approaches...',
          tags: ['Fine-tuning', 'Models', 'Discussion'],
          likes: 75,
          comments: 32,
          shares: 12,
          isLiked: false,
          isBookmarked: true,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          userId: 'user4',
          userName: 'Content Creator',
          userAvatar: 'https://i.pravatar.cc/150?img=4',
          type: 'prompt',
          title: 'Prompt for creating engaging social media content',
          content: 'This prompt has helped me generate hundreds of social media posts in minutes...',
          tags: ['Social Media', 'Content Creation', 'Prompt'],
          likes: 156,
          comments: 28,
          shares: 22,
          isLiked: false,
          isBookmarked: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          promptId: 'prompt2'
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to fetch community posts', error);
      toast.error('Failed to load community');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      // 这里应该调用获取评论的API
      // 暂时使用模拟数据
      const mockComments: Comment[] = [
        {
          id: 'comment1',
          userId: 'user5',
          userName: 'Marketing Expert',
          userAvatar: 'https://i.pravatar.cc/150?img=5',
          content: 'Great tips! I\'ve been using similar techniques with good results.',
          likes: 12,
          isLiked: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          replies: [
            {
              id: 'reply1',
              userId: 'user1',
              userName: 'Prompt Master',
              userAvatar: 'https://i.pravatar.cc/150?img=1',
              content: 'Thanks! Glad you found them helpful.',
              likes: 5,
              isLiked: false,
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'comment2',
          userId: 'user6',
          userName: 'Digital Marketer',
          userAvatar: 'https://i.pravatar.cc/150?img=6',
          content: 'Have you tried combining these with A/B testing?',
          likes: 8,
          isLiked: true,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setComments(mockComments);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) {
      toast.error('Please login to like');
      return;
    }
    try {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1 
            } 
          : post
      ));
    } catch (error) {
      console.error('Failed to like post', error);
      toast.error('Failed to like');
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user?.id) {
      toast.error('Please login to bookmark');
      return;
    }
    try {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, isBookmarked: !post.isBookmarked } 
          : post
      ));
    } catch (error) {
      console.error('Failed to bookmark post', error);
      toast.error('Failed to bookmark');
    }
  };

  const handleComment = async () => {
    if (!user?.id) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim()) {
      return;
    }
    try {
      const newCommentObj: Comment = {
        id: `comment${Date.now()}`,
        userId: user.id,
        userName: user.name || 'User',
        userAvatar: user.avatar || 'https://i.pravatar.cc/150?img=0',
        content: newComment,
        likes: 0,
        isLiked: false,
        createdAt: new Date().toISOString()
      };
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
      if (selectedPost) {
        setPosts(prev => prev.map(post => 
          post.id === selectedPost.id 
            ? { ...post, comments: post.comments + 1 } 
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to add comment', error);
      toast.error('Failed to add comment');
    }
  };

  const handleViewPost = (post: CommunityPost) => {
    setSelectedPost(post);
    fetchComments(post.id);
    setShowComments(true);
  };

  const handleViewUser = (userId: string) => {
    navigate(`/u/${userId}`);
  };

  const handleViewContent = (post: CommunityPost) => {
    if (post.type === 'prompt' && post.promptId) {
      navigate(`/prompts/${post.promptId}`);
    } else if (post.type === 'agent' && post.agentId) {
      navigate(`/agents/${post.agentId}`);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
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
      
      <div className="w-full max-w-[1200px] mx-auto p-6 relative z-10">
        <BackButton to="/dashboard" label="Back to Dashboard" />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mt-4 text-white">Community</h1>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 font-medium"
          >
            + New Post
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            className={`px-4 py-2 rounded-full font-medium ${filter === 'all' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-full font-medium ${filter === 'prompts' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'}`}
            onClick={() => setFilter('prompts')}
          >
            Prompts
          </button>
          <button
            className={`px-4 py-2 rounded-full font-medium ${filter === 'agents' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'}`}
            onClick={() => setFilter('agents')}
          >
            Agents
          </button>
          <button
            className={`px-4 py-2 rounded-full font-medium ${filter === 'discussions' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'}`}
            onClick={() => setFilter('discussions')}
          >
            Discussions
          </button>
          <div className="ml-auto">
            <select
              className="border border-gray-700 bg-gray-800/60 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sort}
              onChange={(e) => setSort(e.target.value as 'latest' | 'popular')}
            >
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/60 rounded-xl shadow-lg border border-gray-700">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-medium text-white mb-2">No community posts yet</h3>
            <p className="text-gray-400 mb-6">Be the first to share something</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-800/60 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={post.userAvatar} 
                      alt={post.userName} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => handleViewUser(post.userId)}
                          className="font-semibold text-white hover:underline"
                        >
                          {post.userName}
                        </button>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${post.type === 'prompt' ? 'bg-blue-900/50 text-blue-300' : post.type === 'agent' ? 'bg-purple-900/50 text-purple-300' : 'bg-green-900/50 text-green-300'}`}>
                          {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                      <p className="text-gray-300 mb-4">{post.content}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-700/50 text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1 text-sm ${post.isLiked ? 'text-red-400' : 'text-gray-400'}`}
                        >
                          <span>{post.isLiked ? '❤️' : '🤍'}</span>
                          <span>{post.likes}</span>
                        </button>
                        <button
                          onClick={() => handleViewPost(post)}
                          className="flex items-center gap-1 text-sm text-gray-400"
                        >
                          <span>💬</span>
                          <span>{post.comments}</span>
                        </button>
                        <button
                          className="flex items-center gap-1 text-sm text-gray-400"
                        >
                          <span>↗️</span>
                          <span>{post.shares}</span>
                        </button>
                        <button
                          onClick={() => handleBookmark(post.id)}
                          className={`flex items-center gap-1 text-sm ${post.isBookmarked ? 'text-yellow-400' : 'text-gray-400'}`}
                        >
                          <span>{post.isBookmarked ? '🔖' : '📑'}</span>
                          <span>Save</span>
                        </button>
                        {post.type !== 'discussion' && (
                          <button
                            onClick={() => handleViewContent(post)}
                            className="ml-auto flex items-center gap-1 text-sm text-blue-400 hover:underline"
                          >
                            <span>View {post.type}</span>
                            <span>→</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Comments Modal */}
        {showComments && selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800/60 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Comments</h3>
                  <button
                    onClick={() => setShowComments(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-white">{selectedPost.title}</h4>
                  <p className="text-gray-300">{selectedPost.content}</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-300">{user?.name?.charAt(0) || 'U'}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <textarea
                        placeholder="Write a comment..."
                        className="w-full border border-gray-700 bg-gray-700/50 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleComment}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium"
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <img 
                          src={comment.userAvatar} 
                          alt={comment.userName} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <button
                              onClick={() => handleViewUser(comment.userId)}
                              className="font-semibold text-white hover:underline"
                            >
                              {comment.userName}
                            </button>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-2">{comment.content}</p>
                          <div className="flex items-center gap-4 mb-2">
                            <button className="text-sm text-gray-400 hover:text-red-400">
                              Like ({comment.likes})
                            </button>
                            <button className="text-sm text-gray-400 hover:text-blue-400">
                              Reply
                            </button>
                          </div>
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-4 mt-3 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-3">
                                  <img 
                                    src={reply.userAvatar} 
                                    alt={reply.userName} 
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <button
                                        onClick={() => handleViewUser(reply.userId)}
                                        className="font-semibold text-white hover:underline"
                                      >
                                        {reply.userName}
                                      </button>
                                      <span className="text-xs text-gray-400">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-gray-300 mb-2">{reply.content}</p>
                                    <div className="flex items-center gap-4">
                                      <button className="text-sm text-gray-400 hover:text-red-400">
                                        Like ({reply.likes})
                                      </button>
                                      <button className="text-sm text-gray-400 hover:text-blue-400">
                                        Reply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}