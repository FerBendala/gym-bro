import { MODERN_THEME } from '@/constants/theme';
import { cn } from '@/utils/functions';
import type { DataStats } from '../types';

interface DataStatsCardProps {
  dataStats: DataStats;
}

export const DataStatsCard: React.FC<DataStatsCardProps> = ({ dataStats }) => {
  return (
    <div className={cn(
      'mt-4 p-4 rounded-xl',
      MODERN_THEME.components.card.base
    )}>
      <h4 className="text-sm font-semibold text-gray-300 mb-2">Datos disponibles:</h4>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-blue-400">{dataStats.exercises}</div>
          <div className="text-xs text-gray-500">Ejercicios</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-400">{dataStats.workouts}</div>
          <div className="text-xs text-gray-500">Entrenamientos</div>
        </div>
        <div>
          <div className="text-lg font-bold text-orange-400">
            {dataStats.totalVolume.toLocaleString()}kg
          </div>
          <div className="text-xs text-gray-500">Volumen Total</div>
        </div>
      </div>
    </div>
  );
}; 