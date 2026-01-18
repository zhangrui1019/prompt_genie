import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PageTitleUpdater() {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const path = location.pathname;
    let titleKey = '';

    if (path === '/') titleKey = 'titles.home';
    else if (path === '/login') titleKey = 'titles.login';
    else if (path === '/register') titleKey = 'titles.register';
    else if (path === '/dashboard') titleKey = 'titles.dashboard';
    else if (path.startsWith('/templates')) titleKey = 'titles.templates';
    else if (path === '/profile') titleKey = 'titles.profile';
    else if (path === '/playground') titleKey = 'titles.playground';
    else if (path === '/optimizer') titleKey = 'titles.optimizer';
    else if (path.startsWith('/chains')) titleKey = 'titles.chains';
    else if (path === '/knowledge') titleKey = 'titles.knowledge';

    const title = titleKey ? t(titleKey) : '';
    document.title = title ? `${title} - Prompt Genie` : 'Prompt Genie - AI Prompt Engineering Platform';
    
  }, [location, t]);

  return null;
}
