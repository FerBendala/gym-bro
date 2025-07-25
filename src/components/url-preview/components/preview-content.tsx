import { THEME_URL_PREVIEW } from '@/constants/theme/index.constants';
import { ExternalLink, Globe } from 'lucide-react';
import React from 'react';
import { openURLSafely } from '../../../utils/functions/url-preview-utils';
import { Button } from '../../button';
import type { PreviewContentProps } from '../types';

export const PreviewContent: React.FC<PreviewContentProps> = ({ url, previewData }) => {
  if (previewData.type === 'youtube' && previewData.embedUrl) {
    return (
      <div className={THEME_URL_PREVIEW.media.aspectVideo}>
        <iframe
          src={previewData.embedUrl}
          className={THEME_URL_PREVIEW.media.iframe}
          allowFullScreen
          title="YouTube video"
        />
      </div>
    );
  }

  if (previewData.type === 'image') {
    return (
      <div className={THEME_URL_PREVIEW.media.centeredImage}>
        <img
          src={url}
          alt="Imagen de referencia"
          className={THEME_URL_PREVIEW.media.image}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  if (previewData.type === 'video') {
    return (
      <div className={THEME_URL_PREVIEW.media.aspectVideo}>
        <video
          src={url}
          controls
          className={THEME_URL_PREVIEW.media.video}
        >
          Tu navegador no soporta el elemento video.
        </video>
      </div>
    );
  }

  // Website o default
  return (
    <div className={THEME_URL_PREVIEW.website.container}>
      <Globe className={THEME_URL_PREVIEW.website.icon} />
      <p className={THEME_URL_PREVIEW.website.description}>
        Sitio web externo
      </p>
      <Button
        onClick={() => openURLSafely(url)}
        className={THEME_URL_PREVIEW.website.button}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Abrir en nueva pestaña
      </Button>
    </div>
  );
}; 