import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { promptService } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { track } from '@/lib/analytics';

export default function Profile() {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user?.id) return;
    track('upgrade_click', { source: 'profile' });
    setLoading(true);
    try {
      const updatedUser = await promptService.upgradeUser(user.id);
      // Preserve token
      const token = localStorage.getItem('access_token');
      setUser({ ...updatedUser, token: token || undefined });
      track('upgrade_success', { userId: user.id });
      alert('Successfully upgraded to Pro!');
    } catch (err) {
      console.error('Failed to upgrade', err);
      track('upgrade_failed', { userId: user.id });
      alert('Failed to upgrade.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Please login</div>;

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
      
      <div className="w-full max-w-2xl mx-auto p-8 z-10">
        <div className="mb-8">
           <Link to="/dashboard" className="mb-2 inline-block text-sm text-gray-300 hover:text-white">
            &larr; {t('common.dashboard')}
          </Link>
          <h1 className="text-3xl font-bold text-white">{t('profile.title')}</h1>
        </div>

        <div className="rounded-xl bg-gray-800/60 p-8 shadow-lg border border-gray-700">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-20 w-20 rounded-full bg-blue-900/50 flex items-center justify-center text-2xl font-bold text-blue-400">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.name || 'User'}</h2>
              <p className="text-gray-300">{user.email || 'user@example.com'}</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${user.plan === 'pro' ? 'bg-purple-900/50 text-purple-300' : 'bg-green-900/50 text-green-300'}`}>
                {user.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">Display Name</label>
              <div className="mt-1 rounded-md bg-gray-700/50 p-3 text-white border border-gray-600">{user.name || 'Not set'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email Address</label>
              <div className="mt-1 rounded-md bg-gray-700/50 p-3 text-white border border-gray-600">{user.email || 'Not set'}</div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('profile.api_key')}</label>
                <div className="relative">
                    <input 
                        type={showApiKey ? "text" : "password"} 
                        className="w-full rounded-md border border-gray-600 bg-gray-700/50 p-3 pr-10 text-sm font-mono text-gray-300"
                        value={user.apiKey || 'No API Key generated'}
                        readOnly
                    />
                    <button 
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                    >
                        {showApiKey ? 'Hide' : 'Show'}
                    </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">Use this key to access the Prompt API.</p>
            </div>

            {user.plan !== 'pro' && (
                <div className="rounded-lg bg-purple-900/30 p-4 border border-purple-800/50">
                    <h3 className="font-bold text-purple-300 mb-2">{t('profile.upgrade_pro')}</h3>
                    <p className="text-sm text-purple-400 mb-4">Unlock Batch Generation, API Access, and Unlimited Optimizations.</p>
                    <button 
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full rounded bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                    >
                        {loading ? 'Upgrading...' : 'Upgrade Now ($9/mo)'}
                    </button>
                </div>
            )}

            <button 
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
              className="rounded border border-red-800/50 px-4 py-2 font-bold text-red-400 hover:bg-red-900/30 w-full"
            >
              {t('profile.sign_out')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
