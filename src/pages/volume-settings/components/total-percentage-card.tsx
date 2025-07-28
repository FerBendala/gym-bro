import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { cn } from '@/utils';
import React from 'react';
import { getTotalStatus } from '../utils';

interface TotalPercentageCardProps {
  totalPercentage: number;
  onNormalize: () => void;
}

export const TotalPercentageCard: React.FC<TotalPercentageCardProps> = ({
  totalPercentage,
  onNormalize,
}) => {
  const status = getTotalStatus(totalPercentage);

  return (
    <Card className={cn('p-4', status.className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Total: {totalPercentage.toFixed(1)}%</h3>
          <p className="text-sm text-gray-400">{status.message}</p>
        </div>
        {!status.isValid && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onNormalize}
            className="text-blue-400 border-blue-500/30 hover:bg-blue-950/20"
          >
            Normalizar
          </Button>
        )}
      </div>
    </Card>
  );
}; 