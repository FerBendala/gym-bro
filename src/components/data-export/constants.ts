import { Database, FileSpreadsheet, FileText } from 'lucide-react';
import type { ExportOption } from './types';

export const EXPORT_OPTIONS: ExportOption[] = [
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

export const EXPORT_INFO = {
  title: 'Exportar Datos',
  description: 'Descarga todos tus datos de entrenamiento en diferentes formatos',
  offlineMessage: 'Se requiere conexión a internet para exportar datos',
  noDataMessage: 'No hay datos para exportar',
  preparingMessage: 'Preparando datos para exportación...',
  privacyNote: 'Todos los archivos se generan localmente en tu dispositivo. Tus datos nunca se envían a servidores externos.'
};

export const EXPORT_INCLUDES = [
  'Todos tus ejercicios y categorías',
  'Registros completos de entrenamientos',
  'Análisis de volumen por ejercicio y categoría',
  'Estadísticas semanales y mensuales',
  'Métricas de progreso y tendencias',
  'Récords personales y recomendaciones'
]; 