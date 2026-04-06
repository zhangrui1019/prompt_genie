import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { promptService } from '@/lib/api';
import { Prompt } from '@/types';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher';

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
      
      <div className="w-full max-w-[1600px] mx-auto p-6 z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2">
                <WorkspaceSwitcher />
            </div>
            <h1 className="text-3xl font-bold text-white">
              {t('dashboard.welcome', { name: user?.name || 'User', defaultValue: 'Welcome, {{name}}!' })}
            </h1>
            <p className="text-gray-300 mt-1">
              {user?.plan === 'pro' ? t('dashboard.pro_plan', { defaultValue: '专业计划' }) : t('dashboard.free_plan', { defaultValue: '免费计划' })}
            </p>
          </div>
          <div className="flex gap-4 items-center">
             <select 
                onChange={(e) => changeLanguage(e.target.value)}
                className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                value={i18n.language}
             >
                 <option value="en">English</option>
                 <option value="zh">中文</option>
             </select>
             
             <Link to="/profile" className="flex items-center gap-2 rounded-full bg-gray-800/80 px-4 py-2 shadow hover:shadow-md transition border border-gray-700">
                <div className="h-8 w-8 rounded-full bg-blue-900/50 flex items-center justify-center font-bold text-blue-400">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-medium text-gray-300">{t('common.profile')}</span>
             </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Link to="/prompts" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-blue-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">📂</div>
                <h3 className="font-bold text-lg text-white">{t('common.my_prompts', { defaultValue: '我的提示' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.desc_prompts', { defaultValue: '管理和优化您的提示' })}</p>
            </Link>
            <Link to="/playground" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-purple-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">⚡</div>
                <h3 className="font-bold text-lg text-white">{t('common.playground', { defaultValue: 'Playground' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.desc_playground', { defaultValue: '测试和运行您的提示' })}</p>
            </Link>
            <Link to="/optimizer" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-green-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">✨</div>
                <h3 className="font-bold text-lg text-white">{t('common.optimizer', { defaultValue: '优化器' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.desc_optimizer', { defaultValue: '优化您的提示，提升效果' })}</p>
            </Link>
             <Link to="/chains" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-orange-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🔗</div>
                <h3 className="font-bold text-lg text-white">{t('common.chains', { defaultValue: '链管理' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.desc_chains', { defaultValue: '创建和管理提示链' })}</p>
            </Link>
            <Link to="/evaluations" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-pink-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">📊</div>
                <h3 className="font-bold text-lg text-white">{t('evaluations.title', { defaultValue: '评估管理' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('evaluations.subtitle', { defaultValue: '评估您的提示效果' })}</p>
            </Link>
            <Link to="/knowledge" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-cyan-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">📚</div>
                <h3 className="font-bold text-lg text-white">{t('knowledge.title', { defaultValue: '知识库' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.desc_knowledge', { defaultValue: '管理您的知识库' })}</p>
            </Link>
            <Link to="/templates/management" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-yellow-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">📋</div>
                <h3 className="font-bold text-lg text-white">{t('common.template_management', { defaultValue: '模板管理' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.desc_template_management', { defaultValue: '管理和优化您的模板' })}</p>
            </Link>
            <Link to="/agents" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-purple-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🤖</div>
                <h3 className="font-bold text-lg text-white">{t('common.agent_builder', { defaultValue: '智能体构建器' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.desc_agent_builder', { defaultValue: '创建和部署智能体' })}</p>
            </Link>
            <Link to="/marketplace" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-green-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🛍️</div>
                <h3 className="font-bold text-lg text-white">{t('common.marketplace', { defaultValue: '市场' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.desc_marketplace', { defaultValue: '购买和销售提示' })}</p>
            </Link>
            <Link to="/private-models" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-indigo-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🔒</div>
                <h3 className="font-bold text-lg text-white">{t('common.private_models', { defaultValue: '私有模型' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.desc_private_models', { defaultValue: '管理私有模型和微调' })}</p>
            </Link>
            <Link to="/community" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-orange-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">👥</div>
                <h3 className="font-bold text-lg text-white">{t('common.community', { defaultValue: '社区' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.desc_community', { defaultValue: '与其他提示工程师连接' })}</p>
            </Link>
            <Link to="/v2/collaboration" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-cyan-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🔄</div>
                <h3 className="font-bold text-lg text-white">跨平台协作</h3>
                <p className="text-sm text-gray-400 mt-1">在多设备间同步工作，与团队实时协作</p>
            </Link>
            <Link to="/admin" className="block p-6 bg-gray-800/60 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-red-500/50 group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">⚙️</div>
                <h3 className="font-bold text-lg text-white">{t('common.admin_console', { defaultValue: '控制台' })}</h3>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.desc_admin_console', { defaultValue: '管理系统和用户' })}</p>
            </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-gray-800/60 shadow-lg border border-gray-700 overflow-hidden h-full flex flex-col">
              <div className="border-b border-gray-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">{t('dashboard.recent_prompts', { defaultValue: '最近的提示' })}</h2>
                <Link to="/prompts" className="text-sm text-blue-400 hover:text-blue-300 font-medium">{t('dashboard.view_all', { defaultValue: '查看全部' })}</Link>
              </div>
              <div className="divide-y divide-gray-700 flex-1 overflow-auto">
                {recentPrompts.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center h-48">
                    <p className="mb-4">{t('dashboard.no_recent', { defaultValue: '没有最近的提示' })}</p>
                    <Link
                      to="/prompts/new"
                      className="rounded bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white hover:from-blue-700 hover:to-purple-700 transition"
                    >
                      + {t('dashboard.create_new', { defaultValue: '创建新提示' })}
                    </Link>
                  </div>
                ) : (
                  recentPrompts.map((prompt) => (
                    <div key={prompt.id} className="flex items-center justify-between p-4 hover:bg-gray-700/30 transition">
                      <div>
                        <h3 className="font-bold text-white">{prompt.title}</h3>
                        <div className="flex gap-2 mt-1">
                            {prompt.tags?.map(tag => (
                                <span key={tag.id} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded-full">{tag.name}</span>
                            ))}
                        </div>
                      </div>
                      <Link
                        to={`/prompts/${prompt.id}`}
                        className="rounded border border-gray-600 px-3 py-1 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-blue-400 hover:border-blue-500 transition"
                      >
                        {t('common.edit', { defaultValue: '编辑' })}
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
             <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg p-6">
                <h2 className="text-xl font-bold mb-2">{t('dashboard.explore', { defaultValue: '探索' })}</h2>
                <p className="opacity-90 mb-6 text-sm">{t('dashboard.explore_desc', { defaultValue: '发现新的提示和模板，提升您的工作效率。' })}</p>
                <Link to="/templates" className="block w-full text-center bg-white text-blue-600 py-2 rounded-lg font-bold hover:bg-blue-50 transition">
                    {t('dashboard.browse_templates', { defaultValue: '浏览模板' })}
                </Link>
             </div>
              
             <div className="rounded-xl bg-gray-800/60 shadow-lg border border-gray-700 p-6">
                <h3 className="font-bold text-white mb-4">{t('dashboard.quick_tools', { defaultValue: '快速工具' })}</h3>
                <div className="space-y-3">
                    <Link to="/batch" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/30 transition border border-transparent hover:border-gray-600">
                        <span className="text-xl">📚</span>
                        <div>
                            <div className="font-medium text-white">{t('common.batch_run', { defaultValue: '批量运行' })}</div>
                            <div className="text-xs text-gray-400">{t('dashboard.desc_batch', { defaultValue: '批量运行提示' })}</div>
                        </div>
                    </Link>
                    <Link to="/prompts/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/30 transition border border-transparent hover:border-gray-600">
                        <span className="text-xl">✍️</span>
                        <div>
                            <div className="font-medium text-white">{t('dashboard.create_new', { defaultValue: '创建新提示' })}</div>
                            <div className="text-xs text-gray-400">{t('dashboard.desc_create', { defaultValue: '创建新提示' })}</div>
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