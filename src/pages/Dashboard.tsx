import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { promptService } from '@/lib/api';
import { Prompt } from '@/types';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { t, i18n } = useTranslation();
  const [recentPrompts, setRecentPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    if (user?.id) {
        promptService.getAll(user.id).then(data => {
            setRecentPrompts(data.slice(0, 5));
        });
    }
  }, [user?.id]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('dashboard.welcome', { name: user?.name || 'User' })}
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.plan === 'pro' ? t('dashboard.pro_plan') : t('dashboard.free_plan')}
            </p>
          </div>
          <div className="flex gap-4 items-center">
             <select 
                onChange={(e) => changeLanguage(e.target.value)}
                className="rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                value={i18n.language}
             >
                 <option value="en">English</option>
                 <option value="zh">中文</option>
             </select>
             
             <Link to="/profile" className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow hover:shadow-md transition border border-gray-200">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-medium text-gray-700">{t('common.profile')}</span>
             </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Link to="/prompts" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-transparent hover:border-blue-100 group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">📂</div>
                <h3 className="font-bold text-lg text-gray-800">{t('common.my_prompts')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('dashboard.desc_prompts')}</p>
            </Link>
            <Link to="/playground" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-transparent hover:border-purple-100 group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">⚡</div>
                <h3 className="font-bold text-lg text-gray-800">{t('common.playground')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('dashboard.desc_playground')}</p>
            </Link>
            <Link to="/optimizer" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-transparent hover:border-green-100 group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">✨</div>
                <h3 className="font-bold text-lg text-gray-800">{t('common.optimizer')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('dashboard.desc_optimizer')}</p>
            </Link>
             <Link to="/chains" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-transparent hover:border-orange-100 group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🔗</div>
                <h3 className="font-bold text-lg text-gray-800">{t('common.chains')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('dashboard.desc_chains')}</p>
            </Link>
            <Link to="/knowledge" className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-transparent hover:border-cyan-100 group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">📚</div>
                <h3 className="font-bold text-lg text-gray-800">Knowledge Base</h3>
                <p className="text-sm text-gray-500 mt-1">Manage private documents</p>
            </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="border-b bg-gray-50/50 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">{t('dashboard.recent_prompts')}</h2>
                <Link to="/prompts" className="text-sm text-blue-600 hover:text-blue-800 font-medium">{t('dashboard.view_all')}</Link>
              </div>
              <div className="divide-y flex-1 overflow-auto">
                {recentPrompts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-48">
                    <p className="mb-4">{t('dashboard.no_recent')}</p>
                    <Link
                      to="/prompts/new"
                      className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 transition"
                    >
                      + {t('dashboard.create_new')}
                    </Link>
                  </div>
                ) : (
                  recentPrompts.map((prompt) => (
                    <div key={prompt.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                      <div>
                        <h3 className="font-bold text-gray-800">{prompt.title}</h3>
                        <div className="flex gap-2 mt-1">
                            {prompt.tags?.map(tag => (
                                <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag.name}</span>
                            ))}
                        </div>
                      </div>
                      <Link
                        to={`/prompts/${prompt.id}`}
                        className="rounded border px-3 py-1 text-sm font-medium text-gray-600 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition"
                      >
                        {t('common.edit')}
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
             <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg p-6">
                <h2 className="text-xl font-bold mb-2">{t('dashboard.explore')}</h2>
                <p className="opacity-90 mb-6 text-sm">{t('dashboard.explore_desc')}</p>
                <Link to="/templates" className="block w-full text-center bg-white text-blue-600 py-2 rounded-lg font-bold hover:bg-blue-50 transition">
                    {t('dashboard.browse_templates')}
                </Link>
             </div>
             
             <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4">{t('dashboard.quick_tools')}</h3>
                <div className="space-y-3">
                    <Link to="/batch" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200">
                        <span className="text-xl">📚</span>
                        <div>
                            <div className="font-medium text-gray-800">{t('common.batch_run')}</div>
                            <div className="text-xs text-gray-500">{t('dashboard.desc_batch')}</div>
                        </div>
                    </Link>
                    <Link to="/prompts/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200">
                        <span className="text-xl">✍️</span>
                        <div>
                            <div className="font-medium text-gray-800">{t('dashboard.create_new')}</div>
                            <div className="text-xs text-gray-500">{t('dashboard.desc_create')}</div>
                        </div>
                    </Link>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}