import { format } from 'date-fns';

/**
 * Descarga un archivo
 */
export const downloadFile = (content: string | ArrayBuffer, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Genera nombre de archivo con timestamp
 */
export const generateFilename = (baseName: string, extension: string): string => {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
  return `${baseName}_${timestamp}.${extension}`;
}; 