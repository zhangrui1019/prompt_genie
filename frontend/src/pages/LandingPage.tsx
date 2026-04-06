import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
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
      
      {/* Navigation */}
      <nav className="fixed w-full bg-gray-900/60 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧞‍♂️</span>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Prompt Genie
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition">{t('landing.features')}</a>
              <Link to="/templates" className="text-gray-300 hover:text-white transition">{t('landing.community')}</Link>
              <a href="#pricing" className="text-gray-300 hover:text-white transition">{t('landing.pricing')}</a>
            </div>
            <div className="flex items-center gap-4">
              <select 
                onChange={(e) => changeLanguage(e.target.value)}
                className="rounded border border-gray-700 bg-gray-800/60 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={i18n.language}
              >
                 <option value="en">English</option>
                 <option value="zh">中文</option>
              </select>

              {user ? (
                <Link 
                  to="/dashboard" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-600/20"
                >
                  {t('common.dashboard')}
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-white font-medium">{t('landing.login')}</Link>
                  <Link 
                    to="/register" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition"
                  >
                    {t('landing.signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 text-blue-300 text-sm font-semibold mb-8 animate-fade-in-up">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          {t('landing.new_feature')}
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
          {t('landing.hero_title_1')} <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            {t('landing.hero_title_2')}
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t('landing.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to={user ? "/dashboard" : "/register"} 
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-xl shadow-blue-600/20 transform hover:-translate-y-1"
          >
            {t('landing.get_started')}
          </Link>
          <Link 
            to="/templates" 
            className="px-8 py-4 bg-gray-800/60 text-white border border-gray-700 rounded-xl font-bold text-lg hover:bg-gray-700/60 transition transform hover:-translate-y-1"
          >
            {t('landing.explore')}
          </Link>
        </div>
        
        {/* Hero Image/Preview */}
        <div className="mt-16 relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700 mx-auto max-w-5xl group">
           <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
           <div className="bg-gray-800/60 aspect-video flex items-center justify-center text-gray-400">
              {/* Placeholder for actual screenshot */}
              <div className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-gray-300">{t('landing.preview_caption')}</p>
              </div>
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.features_title')}</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t('landing.features_desc')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🤖" 
              title={t('landing.feat_1_title')}
              desc={t('landing.feat_1_desc')}
            />
            <FeatureCard 
              icon="🧩" 
              title={t('landing.feat_2_title')}
              desc={t('landing.feat_2_desc')}
            />
            <FeatureCard 
              icon="✨" 
              title={t('landing.feat_3_title')}
              desc={t('landing.feat_3_desc')}
            />
            <FeatureCard 
              icon="📂" 
              title={t('landing.feat_4_title')}
              desc={t('landing.feat_4_desc')}
            />
            <FeatureCard 
              icon="💡" 
              title={t('landing.feat_5_title')}
              desc={t('landing.feat_5_desc')}
            />
            <FeatureCard 
              icon="🤝" 
              title={t('landing.feat_6_title')}
              desc={t('landing.feat_6_desc')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden border border-gray-700">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">{t('landing.cta_title')}</h2>
            <p className="text-blue-200 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              {t('landing.cta_desc')}
            </p>
            <Link 
              to="/register" 
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg relative z-10"
            >
              {t('landing.cta_button')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/80 text-gray-400 py-12 border-t border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
              <span className="text-2xl">🧞‍♂️</span>
              <span className="text-xl font-bold">Prompt Genie</span>
            </div>
            <p className="text-sm max-w-xs text-gray-400">
              {t('landing.footer_slogan')}
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">{t('landing.footer_product')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">{t('landing.features')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('landing.pricing')}</a></li>
              <li><Link to="/templates" className="hover:text-white transition">{t('common.templates')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">{t('landing.footer_company')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center text-gray-500">
          © {new Date().getFullYear()} Prompt Genie. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-gray-800/60 p-8 rounded-2xl shadow-lg border border-gray-700 hover:shadow-xl transition group transform transition-all duration-300 hover:scale-[1.02]">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
