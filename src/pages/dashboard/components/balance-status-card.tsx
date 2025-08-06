import { AlertTriangle, Award, TrendingUp } from 'lucide-react';
import React from 'react';

import { Card } from '@/components/card';
import { cn, formatNumberToString } from '@/utils';

interface BalanceStatusCardProps {
  balanceScore: number;
}

export const BalanceStatusCard: React.FC<BalanceStatusCardProps> = ({ balanceScore }) => {
  const balanceLevel = balanceScore >= 70 ? 'excellent' :
    balanceScore >= 50 ? 'good' :
      balanceScore >= 30 ? 'unbalanced' : 'critical';

  const getBalanceStatus = () => {
    if (balanceLevel === 'excellent') {
      return {
        title: 'Balance Excelente',
        description: 'Tu desarrollo muscular está perfectamente equilibrado',
        icon: Award,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        gradient: 'from-emerald-500/20 to-green-500/20',
      };
    } else if (balanceLevel === 'good') {
      return {
        title: 'Balance Bueno',
        description: 'Progreso sólido con oportunidades de mejora',
        icon: TrendingUp,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        gradient: 'from-blue-500/20 to-indigo-500/20',
      };
    } else if (balanceLevel === 'unbalanced') {
      return {
        title: 'Balance Desequilibrado',
        description: 'Necesitas enfocarte en grupos musculares débiles',
        icon: AlertTriangle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        gradient: 'from-yellow-500/20 to-orange-500/20',
      };
    } else {
      return {
        title: 'Balance Crítico',
        description: 'Requiere atención inmediata en tu rutina',
        icon: AlertTriangle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        gradient: 'from-red-500/20 to-pink-500/20',
      };
    }
  };

  const status = getBalanceStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={cn('p-3 rounded-xl ', status.bgColor, status.borderColor)}>
            <StatusIcon className={cn('w-6 h-6', status.color)} />
          </div>
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-white">
              {status.title}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {status.description}
            </p>
          </div>
        </div>

        {/* Score Principal */}
        <div className="relative">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-gray-700 flex items-center justify-center relative overflow-hidden">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${balanceScore >= 70 ? '#10b981' : balanceScore >= 50 ? '#3b82f6' : balanceScore >= 30 ? '#f59e0b' : '#ef4444'} 0deg, ${balanceScore * 3.6}deg, #374151 ${balanceScore * 3.6}deg, 360deg)`,
              }}
            />
            <div className="relative z-10 text-center">
              <div className={cn('text-xl lg:text-2xl font-bold', status.color)}>
                {formatNumberToString(balanceScore, 1)}%
              </div>
              <div className="text-xs text-gray-400">Score</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
