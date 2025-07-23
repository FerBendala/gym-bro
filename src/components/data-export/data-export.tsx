import { getExercises, getWorkoutRecords } from '@/api/services';
import { MODERN_THEME } from '@/constants/modern-theme';
import { useOnlineStatus } from '@/hooks';
import type { Exercise, WorkoutRecord } from '@/interfaces';
import { useNotification } from '@/stores/notification-store';
import { cn } from '@/utils/functions';
import {
  downloadFile,
  exportToCSV,
  exportToExcel,
  exportToJSON,
  generateExportData,
  generateFilename,
  type ExportData
} from '@/utils/functions/export-utils';
import { Database, Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

type ExportFormat = 'json' | 'csv' | 'excel';

interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  mimeType: string;
  extension: string;
  color: string;
}

const exportOptions: ExportOption[] = [
  {
    format: 'json',
    label: 'JSON',
    description: 'Formato estructurado ideal para desarrolladores y análisis programático',
    icon: Database,
    mimeType: 'application/json',
    extension: 'json',
    color: 'text-blue-400'
  },
  {
    format: 'csv',
    label: 'CSV',
    description: 'Archivos CSV separados para cada tabla, compatibles con Excel y Google Sheets',
    icon: FileText,
    mimeType: 'text/csv',
    extension: 'csv',
    color: 'text-green-400'
  },
  {
    format: 'excel',
    label: 'Excel',
    description: 'Archivo Excel con múltiples hojas organizadas y fáciles de analizar',
    icon: FileSpreadsheet,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
    color: 'text-orange-400'
  }
];

interface DataExportProps {
  className?: string;
}

/**
 * Componente para exportar todos los datos de la aplicación
 * Soporta exportación en formato JSON, CSV y Excel
 */
export const DataExport: React.FC<DataExportProps> = ({ className }) => {
  const { showNotification } = useNotification();
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [dataStats, setDataStats] = useState<{
    exercises: number;
    workouts: number;
    totalVolume: number;
  } | null>(null);

  // Cargar estadísticas básicas de datos
  React.useEffect(() => {
    const loadDataStats = async () => {
      if (!isOnline) return;

      try {
        const [exercises, workoutRecords] = await Promise.all([
          getExercises(),
          getWorkoutRecords()
        ]);

        const totalVolume = workoutRecords.reduce((sum, record) =>
          sum + (record.weight * record.reps * record.sets), 0
        );

        setDataStats({
          exercises: exercises.length,
          workouts: workoutRecords.length,
          totalVolume: Math.round(totalVolume)
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };

    loadDataStats();
  }, [isOnline]);

  const handleExport = async (format: ExportFormat) => {
    if (!isOnline) {
      showNotification('Se requiere conexión a internet para exportar datos', 'error');
      return;
    }

    setLoading(true);
    setExportingFormat(format);

    try {
      // Obtener todos los datos
      const [exercises, workoutRecords]: [Exercise[], WorkoutRecord[]] = await Promise.all([
        getExercises(),
        getWorkoutRecords()
      ]);

      if (exercises.length === 0 && workoutRecords.length === 0) {
        showNotification('No hay datos para exportar', 'warning');
        return;
      }

      // Generar datos de exportación
      showNotification('Preparando datos para exportación...', 'info');
      const exportData: ExportData = await generateExportData(exercises, workoutRecords);

      // Exportar según el formato seleccionado
      switch (format) {
        case 'json': {
          const jsonContent = exportToJSON(exportData);
          const filename = generateFilename('gym-tracker-data', 'json');
          downloadFile(jsonContent, filename, 'application/json');
          showNotification(`Datos exportados como ${filename}`, 'success');
          break;
        }

        case 'csv': {
          const csvFiles = exportToCSV(exportData);

          // Crear archivo ZIP con todos los CSVs
          const JSZip = await import('jszip');
          const zip = new JSZip.default();

          Object.entries(csvFiles).forEach(([filename, content]) => {
            zip.file(filename, content);
          });

          const zipContent = await zip.generateAsync({ type: 'arraybuffer' });
          const zipFilename = generateFilename('gym-tracker-data', 'zip');
          downloadFile(zipContent, zipFilename, 'application/zip');
          showNotification(`${Object.keys(csvFiles).length} archivos CSV exportados como ${zipFilename}`, 'success');
          break;
        }

        case 'excel': {
          const excelContent = exportToExcel(exportData);
          const filename = generateFilename('gym-tracker-data', 'xlsx');
          downloadFile(
            excelContent,
            filename,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );
          showNotification(`Datos exportados como ${filename}`, 'success');
          break;
        }
      }

    } catch (error: any) {
      console.error('Error durante la exportación:', error);
      showNotification(
        error.message || 'Error al exportar los datos. Inténtalo de nuevo.',
        'error'
      );
    } finally {
      setLoading(false);
      setExportingFormat(null);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Exportar Datos</h3>
        <p className="text-gray-400">
          Descarga todos tus datos de entrenamiento en diferentes formatos
        </p>

        {/* Estadísticas de datos */}
        {dataStats && (
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
        )}
      </div>

      {/* Estado sin conexión */}
      {!isOnline && (
        <div className={cn(
          'p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10',
          'flex items-center space-x-3'
        )}>
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div>
            <p className="text-yellow-400 font-medium">Sin conexión</p>
            <p className="text-yellow-300/70 text-sm">
              Se requiere conexión a internet para exportar datos
            </p>
          </div>
        </div>
      )}

      {/* Opciones de exportación */}
      <div className="space-y-4">
        {exportOptions.map((option) => {
          const isExporting = exportingFormat === option.format;
          const Icon = option.icon;

          return (
            <button
              key={option.format}
              onClick={() => handleExport(option.format)}
              disabled={loading || !isOnline}
              className={cn(
                'w-full p-4 rounded-xl text-left transition-all duration-200',
                MODERN_THEME.components.card.base,
                MODERN_THEME.touch.tap,
                MODERN_THEME.accessibility.focusRing,
                loading || !isOnline
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-800/50 active:scale-[0.98]',
                isExporting && 'bg-gray-800/70 scale-[0.98]'
              )}
            >
              <div className="flex items-start space-x-4">
                {/* Icono */}
                <div className={cn(
                  'p-3 rounded-lg flex-shrink-0',
                  isExporting
                    ? 'bg-blue-600/20'
                    : 'bg-gray-800/50'
                )}>
                  {isExporting ? (
                    <Loader2 className={cn('w-6 h-6 animate-spin', option.color)} />
                  ) : (
                    <Icon className={cn('w-6 h-6', option.color)} />
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-white">{option.label}</h4>
                    <span className="text-xs px-2 py-1 rounded-md bg-gray-700/50 text-gray-300">
                      .{option.extension}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {option.description}
                  </p>

                  {isExporting && (
                    <div className="mt-2 text-xs text-blue-400 font-medium">
                      Exportando datos...
                    </div>
                  )}
                </div>

                {/* Icono de descarga */}
                {!isExporting && (
                  <div className="flex-shrink-0 text-gray-500">
                    <Download className="w-5 h-5" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className={cn(
        'p-4 rounded-xl',
        MODERN_THEME.components.card.base,
        'border border-blue-500/20'
      )}>
        <h4 className="font-semibold text-blue-400 mb-2">¿Qué incluye la exportación?</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Todos tus ejercicios y categorías</li>
          <li>• Registros completos de entrenamientos</li>
          <li>• Análisis de volumen por ejercicio y categoría</li>
          <li>• Estadísticas semanales y mensuales</li>
          <li>• Métricas de progreso y tendencias</li>
          <li>• Récords personales y recomendaciones</li>
        </ul>
      </div>

      {/* Nota de privacidad */}
      <div className="text-xs text-gray-500 text-center">
        Todos los archivos se generan localmente en tu dispositivo.
        Tus datos nunca se envían a servidores externos.
      </div>
    </div>
  );
}; 