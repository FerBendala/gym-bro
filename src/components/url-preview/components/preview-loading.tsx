import { THEME_URL_PREVIEW } from '@/constants/theme/index.constants';
import { Globe } from 'lucide-react';
import React from 'react';
import { cn } from '../../../utils/functions/style-utils';
import type { PreviewLoadingProps } from '../types';

export const PreviewLoading: React.FC<PreviewLoadingProps> = ({ className = '' }) => {
  return (
    <div className={cn(THEME_URL_PREVIEW.loading.container, className)}>
      <Globe className={THEME_URL_PREVIEW.loading.icon} />
      <span className={THEME_URL_PREVIEW.loading.message}>
        Cargando vista previa...
      </span>
    </div>
  );
}; 