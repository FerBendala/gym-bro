/**
 * Utilidades para operaciones de API y validación de URLs
 * Funciones puras para manejo de endpoints y validaciones
 */

/**
 * Valida si una URL es válida
 */
export const validateURL = (url: string): boolean => {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Analiza una URL y extrae información relevante
 */
export const analyzeURL = (url: string): {
  type: 'youtube' | 'image' | 'video' | 'document' | 'unknown';
  title: string;
  thumbnail?: string;
  embedUrl?: string;
  hostname?: string;
} => {
  if (!validateURL(url)) {
    return {
      type: 'unknown',
      title: 'URL inválida'
    };
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');

    // Detectar YouTube
    if (isYouTubeURL(urlObj)) {
      const videoId = extractYouTubeId(url);
      return {
        type: 'youtube',
        title: 'Video de YouTube',
        thumbnail: videoId ? getYouTubeThumbnail(videoId) : undefined,
        embedUrl: videoId ? getYouTubeEmbedUrl(videoId) : undefined,
        hostname
      };
    }

    // Detectar imágenes
    if (isImageURL(urlObj)) {
      return {
        type: 'image',
        title: 'Imagen',
        thumbnail: url,
        hostname
      };
    }

    // Detectar videos
    if (isVideoURL(urlObj)) {
      return {
        type: 'video',
        title: 'Video',
        hostname
      };
    }

    // Detectar documentos
    const fileInfo = getFileInfo(url);
    if (fileInfo.extension && !fileInfo.isMedia) {
      return {
        type: 'document',
        title: `Documento ${fileInfo.extension.toUpperCase()}`,
        hostname
      };
    }

    return {
      type: 'unknown',
      title: `Enlace de ${hostname}`,
      hostname
    };

  } catch {
    return {
      type: 'unknown',
      title: 'URL inválida'
    };
  }
};

/**
 * Verifica si es una URL de YouTube
 */
export const isYouTubeURL = (urlObj: URL): boolean => {
  return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
};

/**
 * Verifica si es una URL de imagen
 */
export const isImageURL = (urlObj: URL): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  return imageExtensions.some(ext => urlObj.pathname.toLowerCase().includes(ext));
};

/**
 * Verifica si es una URL de video
 */
export const isVideoURL = (urlObj: URL): boolean => {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
  return videoExtensions.some(ext => urlObj.pathname.toLowerCase().includes(ext));
};

/**
 * Extrae el ID de un video de YouTube
 */
export const extractYouTubeId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);

    // youtube.com/watch?v=ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      return urlObj.searchParams.get('v');
    }

    // youtu.be/ID
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }

    // youtube.com/embed/ID
    if (urlObj.pathname.startsWith('/embed/')) {
      return urlObj.pathname.split('/')[2];
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Obtiene la miniatura de un video de YouTube
 */
export const getYouTubeThumbnail = (
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'
): string => {
  const qualities = {
    default: 'default.jpg',
    medium: 'mqdefault.jpg',
    high: 'hqdefault.jpg',
    maxres: 'maxresdefault.jpg'
  };

  return `https://img.youtube.com/vi/${videoId}/${qualities[quality]}`;
};

/**
 * Obtiene la URL de embed de YouTube
 */
export const getYouTubeEmbedUrl = (
  videoId: string,
  options?: {
    autoplay?: boolean;
    mute?: boolean;
    start?: number;
    end?: number;
  }
): string => {
  const params = new URLSearchParams();

  if (options?.autoplay) params.append('autoplay', '1');
  if (options?.mute) params.append('mute', '1');
  if (options?.start) params.append('start', options.start.toString());
  if (options?.end) params.append('end', options.end.toString());

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Obtiene información de un archivo desde URL
 */
export const getFileInfo = (url: string): {
  extension: string;
  fileName: string;
  isMedia: boolean;
} => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const mediaExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv'];
    const isMedia = mediaExtensions.includes(extension);

    return {
      extension,
      fileName,
      isMedia
    };
  } catch {
    return {
      extension: '',
      fileName: '',
      isMedia: false
    };
  }
};

/**
 * Abre una URL de forma segura
 */
export const openURLSafely = (url: string): void => {
  if (!validateURL(url)) {
    console.error('URL inválida:', url);
    return;
  }

  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Error al abrir URL:', error);
  }
};

/**
 * Muestra notificación de éxito
 */
export const showSuccessToast = (
  showNotification: (message: string, type: any) => void,
  message: string
) => {
  showNotification(message, 'success');
};

/**
 * Muestra notificación de error
 */
export const showErrorToast = (
  showNotification: (message: string, type: any) => void,
  message: string
) => {
  showNotification(message, 'error');
};

/**
 * Muestra notificación de advertencia
 */
export const showWarningToast = (
  showNotification: (message: string, type: any) => void,
  message: string
) => {
  showNotification(message, 'warning');
};

/**
 * Muestra notificación informativa
 */
export const showInfoToast = (
  showNotification: (message: string, type: any) => void,
  message: string
) => {
  showNotification(message, 'info');
}; 