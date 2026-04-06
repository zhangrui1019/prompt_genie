import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { track } from '@/lib/analytics';
import { CheckCircle, Mail, Lock, Users, ArrowRight } from 'lucide-react';

export default function RegisterSuccess() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    track('register_success_page_view');
  }, []);

  const handleLogin = () => {
    track('register_success_login_click');
    navigate('/login');
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

      <div className="w-full max-w-md rounded-2xl bg-gray-800/80 p-8 shadow-2xl backdrop-blur-sm border border-gray-700 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('auth.register_success_title')}</h1>
          <p className="text-gray-400">{t('auth.register_success_subtitle')}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center p-4 rounded-lg bg-gray-700/50 border border-gray-700/80">
            <Mail className="w-5 h-5 text-blue-400 mr-4" />
            <div>
              <h3 className="text-sm font-medium text-gray-300">{t('auth.register_success_verify_email')}</h3>
              <p className="text-xs text-gray-400">{t('auth.register_success_verify_email_desc')}</p>
            </div>
          </div>

          <div className="flex items-center p-4 rounded-lg bg-gray-700/50 border border-gray-700/80">
            <Lock className="w-5 h-5 text-blue-400 mr-4" />
            <div>
              <h3 className="text-sm font-medium text-gray-300">{t('auth.register_success_secure_account')}</h3>
              <p className="text-xs text-gray-400">{t('auth.register_success_secure_account_desc')}</p>
            </div>
          </div>

          <div className="flex items-center p-4 rounded-lg bg-gray-700/50 border border-gray-700/80">
            <Users className="w-5 h-5 text-blue-400 mr-4" />
            <div>
              <h3 className="text-sm font-medium text-gray-300">{t('auth.register_success_explore_features')}</h3>
              <p className="text-xs text-gray-400">{t('auth.register_success_explore_features_desc')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-medium text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {t('auth.register_success_login')}
            <ArrowRight size={16} />
          </button>

          <div className="text-center">
            <Link 
              to="/" 
              className="inline-block text-sm font-medium text-blue-400 hover:text-blue-300 transition-all duration-300"
            >
              {t('auth.register_success_back_home')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
