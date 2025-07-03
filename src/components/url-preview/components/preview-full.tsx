import { ExternalLink, X } from 'lucide-react';
import React from 'react';
import { THEME_URL_PREVIEW } from '../../../constants/theme';
import { openURLSafely } from '../../../utils/functions/url-preview-utils';
import { Button } from '../../button';
import type { PreviewFullProps } from '../types';
import { PreviewContent } from './preview-content';

export const PreviewFull: React.FC<PreviewFullProps> = ({ url, previewData, onClose }) => {
  return (
    <div className={THEME_URL_PREVIEW.full.overlay}>
      <div className={THEME_URL_PREVIEW.full.container}>
        <div className={THEME_URL_PREVIEW.full.header}>
          <h3 className={THEME_URL_PREVIEW.full.title}>
            {previewData.title}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className={THEME_URL_PREVIEW.full.content}>
          <PreviewContent url={url} previewData={previewData} />
        </div>

        <div className={THEME_URL_PREVIEW.full.footer}>
          <div className={THEME_URL_PREVIEW.full.footerContent}>
            <span className={THEME_URL_PREVIEW.full.url}>
              {url}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openURLSafely(url)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir original
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 