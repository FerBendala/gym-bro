import { Section } from '@/components/layout';
import { CALENDAR_CONSTANTS } from '../constants';
import type { MonthStats } from '../types';
import { formatStatsValue } from '../utils';
import { MonthStatsCard } from './month-stats-card';

interface MonthStatsSectionProps {
  monthStats: MonthStats;
}

export const MonthStatsSection: React.FC<MonthStatsSectionProps> = ({
  monthStats
}) => {
  return (
    <Section
      title="Resumen del Mes"
      subtitle="Estadísticas de entrenamientos del mes actual"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {CALENDAR_CONSTANTS.STATS_CARDS.map((card) => (
          <MonthStatsCard
            key={card.key}
            title={card.title}
            value={formatStatsValue(card.key, monthStats[card.key as keyof MonthStats] as number)}
            color={card.color}
            tooltipContent={card.tooltipContent}
          />
        ))}
      </div>
    </Section>
  );
}; 