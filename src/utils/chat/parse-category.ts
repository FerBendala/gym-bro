const CATEGORY_ALIASES: Record<string, string> = {
  'pecho': 'Pecho',
  'espalda': 'Espalda',
  'pierna': 'Piernas',
  'piernas': 'Piernas',
  'hombro': 'Hombros',
  'hombros': 'Hombros',
  'brazo': 'Brazos',
  'brazos': 'Brazos',
  'core': 'Core',
  'gluteo': 'Glúteos',
  'glúteo': 'Glúteos',
  'gluteos': 'Glúteos',
  'glúteos': 'Glúteos',
};

export const parseCategory = (text: string): string | null => {
  const q = text.toLowerCase();
  for (const key of Object.keys(CATEGORY_ALIASES)) {
    if (q.includes(key)) return CATEGORY_ALIASES[key];
  }
  return null;
};


