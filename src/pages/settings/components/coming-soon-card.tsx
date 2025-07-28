import { MODERN_THEME } from '@/constants/theme';
import { cn } from '@/utils';
import React from 'react';

interface ComingSoonCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
}

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({ icon: Icon, title, message }) => (
  <div className={cn(
    'p-6 rounded-xl text-center',
    MODERN_THEME.components.card.base
  )}>
    <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <div className="space-y-2">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
); 