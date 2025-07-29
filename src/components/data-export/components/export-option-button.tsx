import { Download, Loader2 } from 'lucide-react';

import type { ExportFormat, ExportOption } from '../types';

import { MODERN_THEME } from '@/constants/theme';
import { cn } from '@/utils';

interface ExportOptionButtonProps {
  option: ExportOption;
  isExporting: boolean;
  exportingFormat: ExportFormat | null;
  isDisabled: boolean;
  onExport: (format: ExportFormat) => void;
}

export const ExportOptionButton: React.FC<ExportOptionButtonProps> = ({
  option,
  isExporting,
  exportingFormat,
  isDisabled,
  onExport,
}) => {
  const Icon = option.icon;
  const isCurrentlyExporting = isExporting && exportingFormat === option.format;

  return (
    <button
      onClick={() => onExport(option.format)}
      disabled={isDisabled}
      className={cn(
        'w-full p-4 rounded-xl text-left transition-all duration-200',
        MODERN_THEME.components.card.base,
        MODERN_THEME.touch.tap,
        MODERN_THEME.accessibility.focusRing,
        isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-gray-800/50 active:scale-[0.98]',
        isCurrentlyExporting && 'bg-gray-800/70 scale-[0.98]',
      )}
    >
      <div className="flex items-start space-x-4">
        {/* Icono */}
        <div className={cn(
          'p-3 rounded-lg flex-shrink-0',
          isCurrentlyExporting
            ? 'bg-blue-600/20'
            : 'bg-gray-800/50',
        )}>
          {isCurrentlyExporting ? (
            <Loader2 className={cn('w-6 h-6 animate-spin', option.color)} />
          ) : (
            <Icon className={cn('w-6 h-6', option.color)} />
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-white">{option.label}</h4>
            <span className="text-xs px-2 py-1 rounded-md bg-gray-700/50 text-gray-300">
              .{option.extension}
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            {option.description}
          </p>

          {isCurrentlyExporting && (
            <div className="mt-2 text-xs text-blue-400 font-medium">
              Exportando datos...
            </div>
          )}
        </div>

        {/* Icono de descarga */}
        {!isCurrentlyExporting && (
          <div className="flex-shrink-0 text-gray-500">
            <Download className="w-5 h-5" />
          </div>
        )}
      </div>
    </button>
  );
};
