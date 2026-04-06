import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { track } from '@/lib/analytics';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    track('login_view');
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('Attempting to login with:', { email, password });
      
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      console.log('Login response:', response);
      
      const { access_token, user } = response.data;
      
      console.log('User data:', user);
      console.log('Access token:', access_token);
      
      // Ensure user has required fields
      if (!user || !user.id || !user.email) {
        throw new Error('Invalid user data');
      }
      
      console.log('Before calling login function');
      login(user, access_token);
      console.log('After calling login function');
      
      // Verify localStorage has been updated
      console.log('LocalStorage after login:', {
        access_token: localStorage.getItem('access_token'),
        user: localStorage.getItem('user')
      });
      
      track('login_success', { userId: user?.id });
      
      console.log('Login successful, redirecting to dashboard...');
      // Add a delay to allow time to see the console logs
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Login failed', err);
      console.error('Error response:', err.response);
      track('login_failed');
      // Handle GlobalExceptionHandler response
      const responseData = err.response?.data;
      if (responseData && responseData.error) {
           setError(responseData.error);
      } else {
           setError(t('auth.login_failed'));
      }
    } finally {
      setLoading(false);
    }
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
      
      <div className="absolute top-4 right-4 z-10">
        <select 
            onChange={(e) => changeLanguage(e.target.value)}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            value={i18n.language}
        >
            <option value="en">English</option>
            <option value="zh">中文</option>
        </select>
      </div>
      <div className="w-full max-w-md rounded-2xl bg-gray-800/80 p-8 shadow-2xl backdrop-blur-sm border border-gray-700 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl z-10">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-white">{t('auth.login_title')}</h2>
          <p className="mt-2 text-gray-400">使用您的邮箱和密码登录</p>
        </div>
        
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/30 p-3 text-red-400 border border-red-800">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="email">
              {t('auth.email')}
            </label>
            <input
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              id="email"
              type="email"
              placeholder={t('auth.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="password">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none transition-colors duration-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              className={`w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-medium text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? t('auth.signing_in') : t('auth.sign_in')}
            </button>
          </div>
          <div className="mt-6 text-center">
            <Link to="/register" className="inline-block text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300">
              {t('auth.create_account')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
