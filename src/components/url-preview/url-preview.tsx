import React from 'react';

import { PreviewCompact, PreviewFull } from './components';
import { useURLPreview } from './hooks';
import type { URLPreviewProps } from './types';

/**
 * Componente URLPreview refactorizado con arquitectura modular
 * - Hook específico para lógica de estado
 * - Subcomponentes modulares
 * - Sistema de tema genérico
 * - Utilidades reutilizables
 */
export const URLPreview: React.FC<URLPreviewProps> = ({
  url,
  className = '',
  showFullPreview = false,
  onClose,
  onClick,
}) => {
  const { previewData, isLoading, hasData } = useURLPreview(url);

  // Sin datos válidos
  if (isLoading || !hasData || !previewData) {
    return null;
  }

  // Vista completa (modal)
  if (showFullPreview) {
    return (
      <PreviewFull
        url={url}
        previewData={previewData}
        onClose={onClose}
      />
    );
  }

  // Vista compacta (por defecto)
  return (
    <PreviewCompact
      url={url}
      previewData={previewData}
      className={className}
      onClick={onClick}
    />
  );
};
