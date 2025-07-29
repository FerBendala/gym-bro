import type { WorkoutRecord } from '@/interfaces';

/**
 * Tipos específicos del componente RecentWorkouts
 */

export interface RecentWorkoutsProps {
  records: WorkoutRecord[];
  maxRecords?: number;
  onDeleteRecord?: (recordId: string) => Promise<void>;
}

export interface WorkoutItemProps {
  record: WorkoutRecord;
  index: number;
  onDelete?: (recordId: string) => Promise<void>;
}

export interface WorkoutItemData {
  record: WorkoutRecord;
  volume: number;
  formattedVolume: string;
  relativeTime: string;
  volumeColor: string;
}

export interface WorkoutDisplayConfig {
  maxRecords: number;
  showFooter: boolean;
  showEmptyState: boolean;
}
