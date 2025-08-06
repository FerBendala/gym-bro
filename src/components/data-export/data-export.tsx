import {
  ExportInfoCard,
  ExportOptionButton,
  OfflineWarning,
  PrivacyNote
} from './components';
import { DataIntegrityWarning } from './components/data-integrity-warning';
import { EXPORT_OPTIONS } from './constants';
import { useDataExport } from './hooks';
import type { DataExportProps } from './types';

import { cn } from '@/utils';

/**
 * Componente para exportar todos los datos de la aplicación
 * Soporta exportación en formato JSON, CSV y Excel
 */
export const DataExport: React.FC<DataExportProps> = ({ className }) => {
  const { loading, exportingFormat, dataStats, isOnline, handleExport } = useDataExport();

  return (
    <div className={cn('space-y-6', className)}>

      {/* Advertencia de integridad de datos */}
      <DataIntegrityWarning />

      {/* Estado sin conexión */}
      {!isOnline && <OfflineWarning />}

      {/* Opciones de exportación */}
      <div className="space-y-4">
        {EXPORT_OPTIONS.map((option) => (
          <ExportOptionButton
            key={option.format}
            option={option}
            isExporting={loading}
            exportingFormat={exportingFormat}
            isDisabled={loading || !isOnline}
            onExport={handleExport}
          />
        ))}
      </div>

      {/* Información adicional */}
      <ExportInfoCard />

      {/* Nota de privacidad */}
      <PrivacyNote />
    </div>
  );
};
