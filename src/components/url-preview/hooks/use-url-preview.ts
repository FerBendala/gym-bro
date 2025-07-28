import { analyzeURL, type URLPreviewData } from '@/utils';
import { useEffect, useState } from 'react';

/**
 * Hook para manejar la lógica de URL preview
 * Maneja análisis de URL, estado de carga y datos del preview
 */
export const useURLPreview = (url: string) => {
  const [previewData, setPreviewData] = useState<URLPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setPreviewData(null);
      setIsLoading(false);
      setError('URL no válida');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simular un pequeño delay para mostrar el estado de carga
    const timer = setTimeout(() => {
      try {
        const data = analyzeURL(url);
        setPreviewData(data);
        setError(null);
      } catch (err) {
        console.error('Error al analizar URL:', err);
        setError('Error al analizar la URL');
        setPreviewData({
          type: 'default',
          title: 'Error en la URL'
        });
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [url]);

  return {
    previewData,
    isLoading,
    error,
    hasData: !!previewData && !isLoading && !error
  };
}; 