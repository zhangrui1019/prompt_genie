import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { promptService } from '@/lib/api';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const updatedUser = await promptService.upgradeUser(user.id);
      // Preserve token
      const token = localStorage.getItem('access_token');
      setUser({ ...updatedUser, token: token || undefined });
      alert('Successfully upgraded to Pro!');
    } catch (err) {
      console.error('Failed to upgrade', err);
      alert('Failed to upgrade.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Please login</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
           <Link to="/dashboard" className="mb-2 inline-block text-sm text-gray-500 hover:text-gray-700">
            &larr; {t('common.dashboard')}
          </Link>
          <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
        </div>

        <div className="rounded-lg bg-white p-8 shadow">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name || 'User'}</h2>
              <p className="text-gray-600">{user.email || 'user@example.com'}</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${user.plan === 'pro' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                {user.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </span>
            </div>
          </div>

          <div className="border-t pt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              <div className="mt-1 rounded-md bg-gray-50 p-3 text-gray-900 border">{user.name || 'Not set'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1 rounded-md bg-gray-50 p-3 text-gray-900 border">{user.email || 'Not set'}</div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.api_key')}</label>
                <div className="relative">
                    <input 
                        type={showApiKey ? "text" : "password"} 
                        className="w-full rounded-md border border-gray-300 bg-gray-50 p-3 pr-10 text-sm font-mono text-gray-600"
                        value={user.apiKey || 'No API Key generated'}
                        readOnly
                    />
                    <button 
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                        {showApiKey ? 'Hide' : 'Show'}
                    </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Use this key to access the Prompt API.</p>
            </div>

            {user.plan !== 'pro' && (
                <div className="rounded-lg bg-purple-50 p-4 border border-purple-100">
                    <h3 className="font-bold text-purple-800 mb-2">{t('profile.upgrade_pro')}</h3>
                    <p className="text-sm text-purple-600 mb-4">Unlock Batch Generation, API Access, and Unlimited Optimizations.</p>
                    <button 
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full rounded bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700 disabled:opacity-50"
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
              className="rounded border border-red-200 px-4 py-2 font-bold text-red-600 hover:bg-red-50 w-full"
            >
              {t('profile.sign_out')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
