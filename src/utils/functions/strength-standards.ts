/**
 * Estándares de fuerza por categoría muscular (1RM estimado en kg)
 * Basados en estándares de powerlifting y levantamiento de pesas
 */
export const STRENGTH_STANDARDS: Record<string, {
  beginner: number;
  intermediate: number;
  advanced: number;
  elite: number;
}> = {
  'Pecho': {
    beginner: 40,      // Press de banca
    intermediate: 70,
    advanced: 100,
    elite: 130
  },
  'Espalda': {
    beginner: 50,      // Peso muerto / Dominadas lastradas
    intermediate: 80,
    advanced: 120,
    elite: 160
  },
  'Piernas': {
    beginner: 60,      // Sentadilla
    intermediate: 100,
    advanced: 140,
    elite: 180
  },
  'Hombros': {
    beginner: 25,      // Press militar
    intermediate: 45,
    advanced: 65,
    elite: 85
  },
  'Brazos': {
    beginner: 30,      // Curl de bíceps / Press francés
    intermediate: 50,
    advanced: 70,
    elite: 90
  },
  'Core': {
    beginner: 20,      // Plancha con peso / Crunch con disco
    intermediate: 40,
    advanced: 60,
    elite: 80
  }
}; 