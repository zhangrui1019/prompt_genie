import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  to: string;
  label?: string;
  className?: string;
}

export default function BackButton({ to, label, className = '' }: BackButtonProps) {
  const { t } = useTranslation();
  
  return (
    <Link 
      to={to} 
      className={`mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition font-medium shadow-sm ${className}`}
    >
      <span>&larr;</span> {label || t('common.back')}
    </Link>
  );
}
