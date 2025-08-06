import type { WorkoutRecord } from './index';

/**
 * Interfaces Props comunes centralizadas
 * Estandariza props reutilizadas en múltiples componentes
 */

/**
 * Props base para componentes con registros de entrenamiento
 * Patrón usado en +10 componentes
 */
export interface RecordsProps {
  records: WorkoutRecord[];
}

/**
 * Props base para componentes con registros y límite opcional
 * Patrón usado en +5 componentes
 */
export interface RecordsWithLimitProps extends RecordsProps {
  maxRecords?: number;
}

/**
 * Props base para componentes con registros y callback de eliminación
 * Patrón usado en +3 componentes
 */
export interface RecordsWithDeleteProps extends RecordsProps {
  onDeleteRecord?: (recordId: string) => Promise<void>;
}

/**
 * Props base para componentes con registros y callback de acción
 * Patrón usado en +4 componentes
 */
export interface RecordsWithActionProps extends RecordsProps {
  onAction?: (recordId: string, data?: unknown) => Promise<void> | void;
}

/**
 * Props base para componentes con registros y filtros
 * Patrón usado en +3 componentes
 */
export interface RecordsWithFiltersProps extends RecordsProps {
  filters?: {
    category?: string;
    exercise?: string;
    dateRange?: { start: Date; end: Date };
    minWeight?: number;
    maxWeight?: number;
  };
}

/**
 * Props base para componentes con registros y configuración de visualización
 * Patrón usado en +6 componentes
 */
export interface RecordsWithDisplayProps extends RecordsProps {
  displayOptions?: {
    showDetails?: boolean;
    showTooltips?: boolean;
    showProgress?: boolean;
    showTrends?: boolean;
    compact?: boolean;
  };
}

/**
 * Props base para componentes con registros y métricas calculadas
 * Patrón usado en +4 componentes
 */
export interface RecordsWithMetricsProps extends RecordsProps {
  metrics?: {
    totalVolume?: number;
    avgWeight?: number;
    maxWeight?: number;
    progress?: number;
    trend?: number;
  };
}

/**
 * Props base para componentes con registros y análisis
 * Patrón usado en +3 componentes
 */
export interface RecordsWithAnalysisProps extends RecordsProps {
  analysis?: {
    confidence?: number;
    recommendations?: string[];
    warnings?: string[];
    insights?: string[];
  };
}

/**
 * Props base para componentes con registros y estado de carga
 * Patrón usado en +5 componentes
 */
export interface RecordsWithLoadingProps extends RecordsProps {
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

/**
 * Props base para componentes con registros y paginación
 * Patrón usado en +2 componentes
 */
export interface RecordsWithPaginationProps extends RecordsProps {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

/**
 * Props base para componentes con registros y ordenamiento
 * Patrón usado en +3 componentes
 */
export interface RecordsWithSortingProps extends RecordsProps {
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
    onSort: (field: string) => void;
  };
}

/**
 * Props base para componentes con registros y exportación
 * Patrón usado en +2 componentes
 */
export interface RecordsWithExportProps extends RecordsProps {
  exportOptions?: {
    format: 'csv' | 'json' | 'pdf';
    includeDetails: boolean;
    onExport: (format: string) => void;
  };
}

/**
 * Props base para componentes con registros y comparación
 * Patrón usado en +2 componentes
 */
export interface RecordsWithComparisonProps extends RecordsProps {
  comparison?: {
    baselineRecords: WorkoutRecord[];
    comparisonPeriod: { start: Date; end: Date };
    showDifferences: boolean;
  };
}

/**
 * Props base para componentes con registros y configuración avanzada
 * Patrón usado en +3 componentes
 */
export interface RecordsWithAdvancedProps extends RecordsProps {
  advanced?: {
    enablePredictions?: boolean;
    enableTrends?: boolean;
    enableRecommendations?: boolean;
    customMetrics?: string[];
  };
}

/**
 * Props base para componentes con registros y personalización
 * Patrón usado en +4 componentes
 */
export interface RecordsWithCustomizationProps extends RecordsProps {
  customization?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    units?: 'metric' | 'imperial';
    dateFormat?: string;
  };
}

/**
 * Props base para componentes con registros y notificaciones
 * Patrón usado en +2 componentes
 */
export interface RecordsWithNotificationsProps extends RecordsProps {
  notifications?: {
    showProgressAlerts?: boolean;
    showMilestoneAlerts?: boolean;
    showRecommendationAlerts?: boolean;
  };
}

/**
 * Props base para componentes con registros y sincronización
 * Patrón usado en +2 componentes
 */
export interface RecordsWithSyncProps extends RecordsProps {
  sync?: {
    autoSync?: boolean;
    lastSync?: Date;
    syncStatus?: 'synced' | 'syncing' | 'error';
    onSync?: () => Promise<void>;
  };
}

/**
 * Props base para componentes con registros y validación
 * Patrón usado en +3 componentes
 */
export interface RecordsWithValidationProps extends RecordsProps {
  validation?: {
    validateOnChange?: boolean;
    showValidationErrors?: boolean;
    customValidators?: ((record: WorkoutRecord) => string | null)[];
  };
}

/**
 * Props base para componentes con registros y historial
 * Patrón usado en +2 componentes
 */
export interface RecordsWithHistoryProps extends RecordsProps {
  history?: {
    showHistory?: boolean;
    historyDepth?: number;
    onHistoryItemClick?: (record: WorkoutRecord) => void;
  };
}

/**
 * Props base para componentes con registros y estadísticas
 * Patrón usado en +4 componentes
 */
export interface RecordsWithStatsProps extends RecordsProps {
  stats?: {
    showStats?: boolean;
    statsPeriod?: 'week' | 'month' | 'quarter' | 'year';
    customStats?: string[];
  };
}
