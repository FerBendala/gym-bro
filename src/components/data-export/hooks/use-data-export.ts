import { useOnlineStatus } from '@/stores/connection';
import { useNotification } from '@/stores/notification';
import {
  downloadFile,
  exportToCSV,
  exportToExcel,
  exportToJSON,
  generateExportData,
  generateFilename
} from '@/utils';
import { useEffect, useState } from 'react';
import { EXPORT_INFO } from '../constants';
import type { DataStats, ExportFormat } from '../types';
import { getExportData, loadDataStats } from '../utils';

export const useDataExport = () => {
  const { showNotification } = useNotification();
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [dataStats, setDataStats] = useState<DataStats | null>(null);

  // Cargar estadísticas básicas de datos
  useEffect(() => {
    const loadStats = async () => {
      if (!isOnline) return;

      const stats = await loadDataStats();
      if (stats) {
        setDataStats(stats);
      }
    };

    loadStats();
  }, [isOnline]);

  const handleExport = async (format: ExportFormat) => {
    if (!isOnline) {
      showNotification(EXPORT_INFO.offlineMessage, 'error');
      return;
    }

    setLoading(true);
    setExportingFormat(format);

    try {
      const data = await getExportData();
      if (!data) {
        showNotification(EXPORT_INFO.noDataMessage, 'warning');
        return;
      }

      const { exercises, workoutRecords } = data;

      // Generar datos de exportación
      showNotification(EXPORT_INFO.preparingMessage, 'info');
      const exportData = await generateExportData(exercises, workoutRecords);

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

    } catch (error: unknown) {
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

  return {
    loading,
    exportingFormat,
    dataStats,
    isOnline,
    handleExport
  };
}; 