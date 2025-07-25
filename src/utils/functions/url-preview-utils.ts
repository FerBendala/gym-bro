import type { ThemeUrlPreviewType } from '@/constants/theme/index.constants';

/**
 * Utilidades genéricas para URL previews
 * Reutilizable en URLPreview, LinkCard, MediaEmbed, etc.
 */

export interface URLPreviewData {
  type: ThemeUrlPreviewType;
  title: string;
  thumbnail?: string;
  embedUrl?: string;
  hostname?: string;
}

/**
 * Analiza una URL y devuelve información sobre el tipo de contenido
 */
export const analyzeURL = (url: string): URLPreviewData => {
  try {
    const urlObj = new URL(url);

    // YouTube
    if (isYouTubeURL(urlObj)) {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        return {
          type: 'youtube',
          title: 'Video de YouTube',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          hostname: urlObj.hostname
        };
      }
    }

    // Imágenes
    if (isImageURL(urlObj)) {
      return {
        type: 'image',
        title: 'Imagen de referencia',
        thumbnail: url,
        hostname: urlObj.hostname
      };
    }

    // Videos
    if (isVideoURL(urlObj)) {
      return {
        type: 'video',
        title: 'Video de referencia',
        hostname: urlObj.hostname
      };
    }

    // Sitio web genérico
    return {
      type: 'website',
      title: urlObj.hostname,
      hostname: urlObj.hostname
    };
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return {
      type: 'default',
      title: 'Enlace de referencia'
    };
  }
};

/**
 * Verifica si una URL es de YouTube
 */
export const isYouTubeURL = (urlObj: URL): boolean => {
  return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
};

/**
 * Verifica si una URL apunta a una imagen
 */
export const isImageURL = (urlObj: URL): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  return imageExtensions.some(ext => urlObj.pathname.toLowerCase().includes(ext));
};

/**
 * Verifica si una URL apunta a un video
 */
export const isVideoURL = (urlObj: URL): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv'];
  return videoExtensions.some(ext => urlObj.pathname.toLowerCase().includes(ext));
};

/**
 * Extrae el ID de video de YouTube de una URL
 */
export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^#&?]*)/,
    /youtube\.com\/v\/([^#&?]*)/,
    /youtube\.com\/user\/[^#]*#[^\/]*\/[^\/]*\/[^\/]*\/([^#&?]*)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }

  return null;
};

/**
 * Obtiene una URL de thumbnail para YouTube
 */
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'): string => {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault'
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

/**
 * Genera una URL de embed para YouTube
 */
export const getYouTubeEmbedUrl = (videoId: string, options?: {
  autoplay?: boolean;
  mute?: boolean;
  start?: number;
  end?: number;
}): string => {
  const { autoplay = false, mute = false, start, end } = options || {};

  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  if (mute) params.set('mute', '1');
  if (start) params.set('start', start.toString());
  if (end) params.set('end', end.toString());

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Extrae el dominio principal de una URL
 */
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return 'Enlace';
  }
};

/**
 * Genera un título automático basado en el tipo de contenido
 */
export const generateAutoTitle = (type: ThemeUrlPreviewType, hostname?: string): string => {
  const titles = {
    youtube: 'Video de YouTube',
    video: 'Video de referencia',
    image: 'Imagen de referencia',
    website: hostname || 'Sitio web',
    default: 'Enlace de referencia'
  };

  return titles[type];
};

/**
 * Valida si una URL es accesible (formato básico)
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Normaliza una URL agregando protocolo si falta
 */
export const normalizeURL = (url: string): string => {
  if (!url) return '';

  // Si no tiene protocolo, agregar https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
};

/**
 * Obtiene información de archivo de una URL
 */
export const getFileInfo = (url: string): {
  extension: string;
  fileName: string;
  isMedia: boolean;
} => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/');
    const fileName = parts[parts.length - 1] || 'archivo';
    const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || '' : '';

    const mediaExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', // imágenes
      'mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv' // videos
    ];

    return {
      extension,
      fileName,
      isMedia: mediaExtensions.includes(extension)
    };
  } catch {
    return {
      extension: '',
      fileName: 'archivo',
      isMedia: false
    };
  }
};

/**
 * Abre una URL de forma segura en una nueva pestaña
 */
export const openURLSafely = (url: string): void => {
  if (!isValidURL(url)) {
    console.warn('URL no válida:', url);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}; 