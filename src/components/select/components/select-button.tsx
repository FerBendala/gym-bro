import { ChevronDown } from 'lucide-react';
import React from 'react';

import { cn } from '@/utils';
import { SelectButtonProps } from '../types';

export const SelectButton: React.FC<SelectButtonProps> = ({
  isOpen,
  disabled,
  hasError,
  displayText,
  placeholder,
  onToggle,
}) => {
  const buttonClasses = cn(
    'flex items-center justify-between w-full px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg border',
    'bg-gray-800/50 text-gray-300 border-gray-600/50',
    'hover:bg-gray-700/50 hover:text-white hover:border-gray-500/50',
    'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
    {
      'opacity-50 cursor-not-allowed': disabled,
      'border-red-500/50 text-red-400': hasError,
      'bg-blue-600/20 text-blue-400 border-blue-500/30': isOpen,
    }
  );

  const iconClasses = cn(
    'w-4 h-4 transition-transform duration-200',
    {
      'rotate-180': isOpen,
    }
  );

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={onToggle}
      disabled={disabled}
    >
      <span className="truncate">
        {displayText || placeholder || 'Seleccionar...'}
      </span>
      <ChevronDown className={iconClasses} />
    </button>
  );
}; 