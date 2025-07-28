/**
 * Constantes puras de ejercicios - Categorías, iconos y colores básicos
 * Sin lógica de negocio ni funciones complejas
 */

import { Activity, Dumbbell, Footprints, Hexagon, RotateCcw, Shield, Triangle } from 'lucide-react';

/**
 * Categorías disponibles para ejercicios
 */
export const EXERCISE_CATEGORIES = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Hombros',
  'Brazos',
  'Core'
] as const;

export type ExerciseCategory = typeof EXERCISE_CATEGORIES[number];

/**
 * Iconos específicos para cada categoría muscular
 * Centralizados para mantener consistencia en toda la aplicación
 */
export const CATEGORY_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  'Pecho': Hexagon,        // Hexágono representa la forma de los pectorales
  'Espalda': Shield,       // Escudo representa la protección/soporte de la espalda
  'Piernas': Footprints,   // Huellas representan el movimiento de piernas
  'Hombros': Triangle,     // Triángulo representa la forma de los deltoides
  'Brazos': Dumbbell,      // Mancuerna es el icono más representativo para brazos
  'Core': RotateCcw,       // Rotación representa los movimientos de core/abdominales
  'Sin categoría': Activity // Icono genérico para ejercicios sin categoría
};

/**
 * Colores de gradiente para cada categoría muscular
 * Centralizados para mantener consistencia en toda la aplicación
 */
export const CATEGORY_COLORS: Record<string, string> = {
  'Pecho': 'from-red-500/80 to-pink-500/80',
  'Espalda': 'from-blue-500/80 to-cyan-500/80',
  'Piernas': 'from-green-500/80 to-emerald-500/80',
  'Hombros': 'from-purple-500/80 to-violet-500/80',
  'Brazos': 'from-orange-500/80 to-amber-500/80',
  'Core': 'from-indigo-500/80 to-blue-500/80',
  'Sin categoría': 'from-gray-500/80 to-gray-600/80'
};

/**
 * Distribución ideal de volumen por categoría muscular (porcentajes recomendados)
 * Basada en principios de anatomía funcional, prevención de lesiones y desarrollo equilibrado
 */
export const IDEAL_VOLUME_DISTRIBUTION: Record<string, number> = {
  'Pecho': 20,        // Aumentado por redistribución
  'Espalda': 25,      // Aumentado por balance postural y redistribución  
  'Piernas': 30,      // Reducido ligeramente por redistribución
  'Hombros': 10,      // Mantenido
  'Brazos': 10,       // Reducido ligeramente
  'Core': 5           // Reducido ligeramente
};

/**
 * Base de datos de ejercicios conocidos con distribuciones realistas de esfuerzo
 * Basada en análisis biomecánico y patrones de activación muscular
 */
export const KNOWN_EXERCISE_DISTRIBUTIONS: Record<string, Record<string, number>> = {
  // === PIERNAS ===
  'Press de pierna': { 'Piernas': 1.0 },
  'Press de piernas': { 'Piernas': 1.0 },
  'Sentadilla búlgara con mancuernas': { 'Piernas': 0.85, 'Core': 0.15 },
  'Extensiones de cuádriceps en máquina': { 'Piernas': 1.0 },
  'Hip Thrust': { 'Piernas': 0.9, 'Core': 0.1 },
  'Elevación de talones en prensa': { 'Piernas': 1.0 },
  'Curl femoral en máquina': { 'Piernas': 1.0 },
  'Zancadas caminando con pesas': { 'Piernas': 0.9, 'Core': 0.1 },

  // === PECHO ===
  'Press banca inclinado con mancuernas': { 'Pecho': 0.7, 'Hombros': 0.2, 'Brazos': 0.1 },
  'Press en banca con mancuernas': { 'Pecho': 0.7, 'Hombros': 0.2, 'Brazos': 0.1 },
  'Fondos en paralelas': { 'Pecho': 0.6, 'Brazos': 0.3, 'Hombros': 0.1 },
  'Cruces en polea alta': { 'Pecho': 0.9, 'Hombros': 0.1 },
  'Pullover con máquina': { 'Pecho': 0.6, 'Espalda': 0.4 },

  // === ESPALDA ===
  'Dominadas': { 'Espalda': 0.7, 'Brazos': 0.3 },
  'Remo en banco con apoyo': { 'Espalda': 0.8, 'Brazos': 0.2 },
  'Remo con mancuerna unilateral': { 'Espalda': 0.8, 'Brazos': 0.2 },
  'Remo inclinado en banco con mancuernas (agarre prono)': { 'Espalda': 0.8, 'Brazos': 0.2 },

  // === HOMBROS ===
  'Press militar con barra o mancuerna': { 'Hombros': 0.7, 'Brazos': 0.2, 'Core': 0.1 },
  'Elevaciones laterales estrictas': { 'Hombros': 1.0 },
  'Pájaros en máquina': { 'Hombros': 0.8, 'Espalda': 0.2 },
  'Elevaciones frontales con polea unilateral': { 'Hombros': 1.0 },
  'Aperturas invertidas en máquina': { 'Hombros': 0.8, 'Espalda': 0.2 },

  // === BRAZOS ===
  'Extensión de tríceps en cuerda': { 'Brazos': 1.0 },
  'Curl bíceps alterno en banco inclinado': { 'Brazos': 1.0 },

  // === CORE ===
  'Plancha abdominal': { 'Core': 1.0 },
  'Elevaciones de piernas colgado': { 'Core': 0.8, 'Brazos': 0.2 },
  'Rueda abdominal de rodillas': { 'Core': 0.9, 'Brazos': 0.1 }
};

/**
 * Pesos relativos para el esfuerzo muscular en ejercicios multi-categoría
 * Representa qué porcentaje del esfuerzo total recibe cada categoría muscular
 */
export const CATEGORY_EFFORT_WEIGHTS: Record<string, Record<string, number>> = {
  // Ejercicios comunes de pecho + hombros
  'Pecho-Hombros': {
    'Pecho': 0.7,
    'Hombros': 0.3
  },
  // Ejercicios comunes de espalda + brazos
  'Espalda-Brazos': {
    'Espalda': 0.7,
    'Brazos': 0.3
  },
  // Ejercicios comunes de piernas + core
  'Piernas-Core': {
    'Piernas': 0.8,
    'Core': 0.2
  },
  // Ejercicios comunes de hombros + brazos
  'Hombros-Brazos': {
    'Hombros': 0.6,
    'Brazos': 0.4
  },
  // Ejercicios comunes de pecho + brazos
  'Pecho-Brazos': {
    'Pecho': 0.6,
    'Brazos': 0.4
  },
  // Ejercicios comunes de espalda + hombros
  'Espalda-Hombros': {
    'Espalda': 0.7,
    'Hombros': 0.3
  }
}; 