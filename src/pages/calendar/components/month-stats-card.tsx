import { Card, CardContent } from '@/components/card';
import { InfoTooltip } from '@/components/tooltip';
import type { MonthStatsCardProps } from '../types';

export const MonthStatsCard: React.FC<MonthStatsCardProps> = ({
  title,
  value,
  color,
  tooltipContent
}) => {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className={`text-2xl font-bold ${color}`}>
          {value}
        </p>
        <div className="text-sm text-gray-400 flex items-center justify-center">
          <span>{title}</span>
          <InfoTooltip
            content={tooltipContent}
            position="top"
            className="ml-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}; 