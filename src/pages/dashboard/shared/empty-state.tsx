import { LucideIcon } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
  icon: LucideIcon | (() => React.ReactElement);
  title: string;
  description: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  className = '',
}) => {
  const IconComponent = typeof icon === 'function' ? icon : icon;

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        {typeof icon === 'function' ? <IconComponent /> : <IconComponent className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">
        {title}
      </h3>
      <p className="text-gray-500">
        {description}
      </p>
    </div>
  );
};
