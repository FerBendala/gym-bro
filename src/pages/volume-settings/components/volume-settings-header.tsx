import { MODERN_THEME } from '@/constants/theme';
import { cn } from '@/utils';
import React from 'react';
import type { VolumeSettingsProps } from '../types';

type VolumeSettingsHeaderProps = VolumeSettingsProps;

export const VolumeSettingsHeader: React.FC<VolumeSettingsHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <button
        onClick={onBack}
        className={cn(
          'p-2 rounded-lg',
          MODERN_THEME.components.button.base,
          MODERN_THEME.touch.tap,
          MODERN_THEME.accessibility.focusRing
        )}
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h2 className="text-xl font-bold text-white">Configuración de Volumen</h2>
        <p className="text-gray-400 text-sm">
          Personaliza la distribución ideal de volumen por grupo muscular
        </p>
      </div>
    </div>
  );
}; 