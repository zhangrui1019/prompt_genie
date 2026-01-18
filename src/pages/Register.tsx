import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const fetchCaptcha = async () => {
    try {
      const res = await api.get('/auth/captcha');
      setCaptchaId(res.data.uuid);
      setCaptchaImage(res.data.imageBase64);
    } catch (err) {
      console.error('Failed to fetch captcha', err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/auth/register', {
        email,
        password,
        username: name,
        invitationCode,
        captchaCode,
        captchaId
      });
      
      console.log('Registration successful');
      // Redirect to login after successful registration
      navigate('/login');
    } catch (err: any) {
      console.error('Registration failed', err);
      // Refresh captcha on failure
      fetchCaptcha();
      setCaptchaCode('');
      
      // Handle GlobalExceptionHandler map response or simple message
      const responseData = err.response?.data;
      if (responseData) {
          if (typeof responseData === 'string') {
               setError(responseData);
          } else if (responseData.error) {
               setError(responseData.error);
          } else {
              // Validation errors map
              const firstError = Object.values(responseData)[0];
              setError(String(firstError));
          }
      } else {
        setError(t('auth.register_failed'));
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
        <h2 className="mb-6 text-center text-2xl font-bold">{t('auth.register_title')}</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="name">
              {t('auth.name')}
            </label>
            <input
              className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder={t('auth.full_name_placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="password">
              {t('auth.password')}
            </label>
            <input
              className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder={t('auth.password_rules_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
             <p className="text-xs text-gray-500 mt-1">{t('auth.password_hint')}</p>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="invitationCode">
              {t('auth.invitation_code')}
            </label>
            <input
              className="w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline"
              id="invitationCode"
              type="text"
              placeholder={t('auth.invitation_code_placeholder')}
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="captcha">
              {t('auth.captcha')}
            </label>
            <div className="flex gap-2">
                <input
                className="flex-1 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline"
                id="captcha"
                type="text"
                placeholder={t('auth.enter_code')}
                value={captchaCode}
                onChange={(e) => setCaptchaCode(e.target.value)}
                required
                />
                {captchaImage && (
                    <img 
                        src={captchaImage} 
                        alt="Captcha" 
                        className="h-10 cursor-pointer border rounded" 
                        onClick={fetchCaptcha}
                        title={t('auth.refresh_captcha')}
                    />
                )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              className={`rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none focus:shadow-outline ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? t('auth.registering') : t('auth.register')}
            </button>
            <Link to="/login" className="inline-block align-baseline text-sm font-bold text-blue-500 hover:text-blue-800">
              {t('auth.have_account')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
