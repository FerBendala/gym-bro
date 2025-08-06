import React from 'react';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  hoverBorderColor?: string;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  className = '',
  borderColor = 'border-gray-700/50',
  hoverBorderColor = 'hover:border-gray-600/50',
}) => {
  return (
    <div className={`relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border ${borderColor} ${hoverBorderColor} transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
};
