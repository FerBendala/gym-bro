/**
 * Valida si una URL es válida
 * @param url - URL a validar
 * @returns true si la URL es válida, false si no
 */
export const validateURL = (url: string): boolean => {
  if (!url.trim()) return true; // URL is optional

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}; 