import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { promptService } from '@/lib/api';
import { Prompt } from '@/types';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';

export default function PublicProfile() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<{ id: string; name: string; plan: string; createdAt: string } | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (userId: string) => {
    try {
      setLoading(true);
      const [profileData, promptsData] = await Promise.all([
        promptService.getPublicProfile(userId),
        promptService.getUserPublicPrompts(userId)
      ]);
      setProfile(profileData);
      setPrompts(promptsData);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;
  if (!profile) return <div className="p-8 text-center">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <BackButton to="/templates" label="Back to Community" />
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8 flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    {profile.name}
                    {profile.plan === 'pro' && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold shadow-sm">
                            PRO
                        </span>
                    )}
                </h1>
                <p className="text-gray-500 mt-1">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-6 mt-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-800">{prompts.length}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Public Prompts</div>
                    </div>
                    {/* Placeholder for future stats like Total Likes */}
                </div>
            </div>
        </div>

        {/* Public Prompts Grid */}
        <h2 className="text-xl font-bold mb-4 text-gray-700">Public Contributions</h2>
        
        {prompts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl text-gray-400">
                No public prompts yet.
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {prompts.map((prompt) => (
                  <div key={prompt.id} className="flex flex-col rounded-lg bg-white p-6 shadow transition hover:shadow-lg">
                    <div className="mb-2">
                       <div className="flex flex-wrap gap-1 mb-2">
                         {prompt.tags && prompt.tags.map((tag, idx) => (
                           <span key={idx} className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                             {tag.name}
                           </span>
                         ))}
                       </div>
                       <h3 className="text-lg font-bold text-gray-800">{prompt.title}</h3>
                    </div>
                    
                    <p className="mb-4 flex-grow text-gray-600 text-sm font-mono bg-gray-50 p-3 rounded border border-gray-100 line-clamp-4">
                      {prompt.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 px-1 mt-auto">
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg">❤️</span>
                            <span>{prompt.likesCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg">🔥</span>
                            <span>{prompt.usageCount || 0}</span>
                        </div>
                    </div>
                  </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
