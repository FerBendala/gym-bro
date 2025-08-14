export const parseHorizonWeeks = (text: string, defaultWeeks = 2): number => {
  const q = text.toLowerCase();
  const m = q.match(/(\d{1,2})\s*semana/);
  if (m) {
    const weeks = parseInt(m[1]!, 10);
    if (!Number.isNaN(weeks) && weeks > 0 && weeks <= 52) return weeks;
  }
  return defaultWeeks;
};



