import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      const { access_token, user } = response.data;
      
      login(user, access_token);
      
      console.log('Login successful', user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login failed', err);
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="absolute top-4 right-4">
        <select 
            onChange={(e) => changeLanguage(e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={i18n.language}
        >
            <option value="en">English</option>
            <option value="zh">中文</option>
        </select>
      </div>
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">{t('auth.login_title')}</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="email">
              {t('auth.email')}
            </label>
            <input
              className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder={t('auth.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="password">
              {t('auth.password')}
            </label>
            <input
              className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder={t('auth.password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className={`rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? t('auth.signing_in') : t('auth.sign_in')}
            </button>
            <Link to="/register" className="inline-block align-baseline text-sm font-bold text-blue-500 hover:text-blue-800">
              {t('auth.create_account')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
