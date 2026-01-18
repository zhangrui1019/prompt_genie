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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧞‍♂️</span>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Prompt Genie
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition">{t('landing.features')}</a>
              <Link to="/templates" className="text-gray-600 hover:text-blue-600 transition">{t('landing.community')}</Link>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition">{t('landing.pricing')}</a>
            </div>
            <div className="flex items-center gap-4">
              <select 
                onChange={(e) => changeLanguage(e.target.value)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={i18n.language}
              >
                 <option value="en">English</option>
                 <option value="zh">中文</option>
              </select>

              {user ? (
                <Link 
                  to="/dashboard" 
                  className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                >
                  {t('common.dashboard')}
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">{t('landing.login')}</Link>
                  <Link 
                    to="/register" 
                    className="bg-gray-900 text-white px-5 py-2 rounded-full font-medium hover:bg-black transition"
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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-8 animate-fade-in-up">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
          {t('landing.new_feature')}
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
          {t('landing.hero_title_1')} <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {t('landing.hero_title_2')}
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t('landing.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to={user ? "/dashboard" : "/register"} 
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 transform hover:-translate-y-1"
          >
            {t('landing.get_started')}
          </Link>
          <Link 
            to="/templates" 
            className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition transform hover:-translate-y-1"
          >
            {t('landing.explore')}
          </Link>
        </div>
        
        {/* Hero Image/Preview */}
        <div className="mt-16 relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 mx-auto max-w-5xl group">
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
           <div className="bg-gray-100 aspect-video flex items-center justify-center text-gray-400">
              {/* Placeholder for actual screenshot */}
              <div className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <p>{t('landing.preview_caption')}</p>
              </div>
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('landing.features_title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('landing.features_desc')}</p>
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
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">{t('landing.cta_title')}</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              {t('landing.cta_desc')}
            </p>
            <Link 
              to="/register" 
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg relative z-10"
            >
              {t('landing.cta_button')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
              <span className="text-2xl">🧞‍♂️</span>
              <span className="text-xl font-bold">Prompt Genie</span>
            </div>
            <p className="text-sm max-w-xs">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          © {new Date().getFullYear()} Prompt Genie. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition group">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
