import type { URLPreviewData } from '../../utils/functions/url-preview-utils';

/**
 * Interfaces específicas para URLPreview
 */

export interface URLPreviewProps {
  url: string;
  className?: string;
  showFullPreview?: boolean;
  onClose?: () => void;
  onClick?: () => void;
}

export interface PreviewCompactProps {
  url: string;
  previewData: URLPreviewData;
  className?: string;
  onClick?: () => void;
}

export interface PreviewFullProps {
  url: string;
  previewData: URLPreviewData;
  onClose?: () => void;
}

export interface PreviewLoadingProps {
  className?: string;
}

export interface PreviewContentProps {
  url: string;
  previewData: URLPreviewData;
} 