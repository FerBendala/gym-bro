export const getQuickDateRange = (type: 'week' | 'month') => {
  const today = new Date();

  if (type === 'week') {
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from: weekAgo, to: today };
  } else {
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: monthAgo, to: today };
  }
};

export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}; 