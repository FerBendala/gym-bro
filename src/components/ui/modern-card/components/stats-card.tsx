import { cn } from '@/utils/functions/style-utils';
import React from 'react';
import { STATS_CARD_ICON_CLASSES } from '../constants';
import { ModernCard } from '../modern-card';
import type { ModernStatsCardProps } from '../types';
import { CardContent } from './index';

export const StatsCard: React.FC<ModernStatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  className
}) => {
  return (
    <ModernCard
      variant="default"
      className={cn('text-center', className)}
    >
      <CardContent>
        <div className="flex flex-col items-center space-y-3">
          <div className={STATS_CARD_ICON_CLASSES}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {value}
            </p>
            <p className="text-sm text-gray-400">
              {title}
            </p>
            {trend && (
              <p className={cn(
                'text-xs mt-1',
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              )}>
                {trend.isPositive ? '↗' : '↘'} {trend.value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </ModernCard>
  );
}; 