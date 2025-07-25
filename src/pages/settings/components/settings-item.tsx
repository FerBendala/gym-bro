import { MODERN_THEME } from '@/constants/theme/index.constants';
import { cn } from '@/utils';
import React from 'react';
import { SettingsItem } from '../types';

interface SettingsItemProps {
  item: SettingsItem;
  onClick: () => void;
}

export const SettingsItemComponent: React.FC<SettingsItemProps> = ({ item, onClick }) => (
  <button
    onClick={onClick}
    disabled={item.disabled}
    className={cn(
      'w-full p-4 rounded-xl text-left transition-all duration-200',
      MODERN_THEME.components.card.base,
      MODERN_THEME.touch.tap,
      MODERN_THEME.accessibility.focusRing,
      item.disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:bg-gray-800/50 active:scale-[0.98]'
    )}
  >
    <div className="flex items-center space-x-4">
      <div className={cn(
        'p-3 rounded-lg',
        item.disabled
          ? 'bg-gray-800/50'
          : 'bg-blue-600/20 text-blue-400'
      )}>
        <item.icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3 className={cn(
          'font-semibold',
          item.disabled ? 'text-gray-500' : 'text-white'
        )}>
          {item.label}
        </h3>
        <p className={cn(
          'text-sm',
          item.disabled ? 'text-gray-600' : 'text-gray-400'
        )}>
          {item.description}
        </p>
      </div>
      {!item.disabled && (
        <div className="text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  </button>
); 