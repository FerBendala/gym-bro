export type ExportFormat = 'json' | 'csv' | 'excel';

export interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  mimeType: string;
  extension: string;
  color: string;
}

export interface DataStats {
  exercises: number;
  workouts: number;
  totalVolume: number;
}

export interface DataExportProps {
  className?: string;
} 