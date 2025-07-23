import { MODERN_THEME } from '@/constants/modern-theme';
import { cn } from '@/utils/functions';
import { EXPORT_INCLUDES } from '../constants';

export const ExportInfoCard: React.FC = () => {
  return (
    <div className={cn(
      'p-4 rounded-xl',
      MODERN_THEME.components.card.base,
      'border border-blue-500/20'
    )}>
      <h4 className="font-semibold text-blue-400 mb-2">¿Qué incluye la exportación?</h4>
      <ul className="text-sm text-gray-400 space-y-1">
        {EXPORT_INCLUDES.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}; 