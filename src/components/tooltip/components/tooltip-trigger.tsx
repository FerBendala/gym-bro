import { cn } from '@/utils';
import { Info } from 'lucide-react';
import React from 'react';
import { TooltipTriggerProps } from '../types';

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({
  children,
  showIcon = false,
  className
}) => {
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {children}
      {showIcon && (
        <Info className="w-4 h-4 text-gray-400 hover:text-gray-300 transition-colors" />
      )}
    </div>
  );
}; 