import { THEME_URL_PREVIEW } from '@/constants/theme';
import { ExternalLink, FileText, Globe, Image, Play } from 'lucide-react';
import React from 'react';
import { cn } from '../../../utils/functions/style-utils';
import type { PreviewCompactProps } from '../types';

export const PreviewCompact: React.FC<PreviewCompactProps> = ({
  url,
  previewData,
  className = '',
  onClick
}) => {
  const getIcon = () => {
    switch (previewData.type) {
      case 'youtube':
      case 'video':
        return <Play className={THEME_URL_PREVIEW.compact.iconSize} />;
      case 'image':
        return <Image className={THEME_URL_PREVIEW.compact.iconSize} />;
      case 'website':
        return <Globe className={THEME_URL_PREVIEW.compact.iconSize} />;
      default:
        return <FileText className={THEME_URL_PREVIEW.compact.iconSize} />;
    }
  };

  const typeStyles = THEME_URL_PREVIEW.types[previewData.type] || THEME_URL_PREVIEW.types.default;

  return (
    <div
      className={cn(
        THEME_URL_PREVIEW.compact.container,
        onClick && THEME_URL_PREVIEW.compact.clickable,
        typeStyles.colors,
        className
      )}
      onClick={onClick}
    >
      <div className={THEME_URL_PREVIEW.compact.icon}>
        {getIcon()}
      </div>

      <div className={THEME_URL_PREVIEW.compact.content}>
        <p className={THEME_URL_PREVIEW.compact.title}>
          {previewData.title}
        </p>
        <p className={THEME_URL_PREVIEW.compact.url}>
          {url}
        </p>
      </div>

      {previewData.thumbnail && (
        <div className={THEME_URL_PREVIEW.compact.thumbnail}>
          <img
            src={previewData.thumbnail}
            alt="Vista previa"
            className={THEME_URL_PREVIEW.compact.thumbnailImg}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className={THEME_URL_PREVIEW.compact.icon}>
        <ExternalLink className={THEME_URL_PREVIEW.compact.externalIcon} />
      </div>
    </div>
  );
}; 