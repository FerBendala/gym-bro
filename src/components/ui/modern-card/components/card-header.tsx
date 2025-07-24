import React from 'react';
import type { ModernCardHeaderProps } from '../types';
import { getCardHeaderClasses } from '../utils';

export const CardHeader: React.FC<ModernCardHeaderProps> = ({
  title,
  subtitle,
  actions,
  className
}) => {
  return (
    <div className={getCardHeaderClasses(className)}>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold text-white leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center space-x-2 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
}; 