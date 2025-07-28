import { MODERN_THEME } from '@/constants/theme';
import { cn } from '@/utils';
import React from 'react';

interface SectionHeaderProps {
  title: string;
  onBack: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onBack }) => (
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
    <h2 className="text-xl font-bold text-white">{title}</h2>
  </div>
); 