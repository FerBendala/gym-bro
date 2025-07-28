export interface MonthStats {
  totalWorkouts: number;
  totalVolume: number;
  uniqueDays: number;
  averageVolumePerDay: number;
}

export interface MonthStatsCardProps {
  title: string;
  value: string | number;
  color: string;
  tooltipContent: string;
} 