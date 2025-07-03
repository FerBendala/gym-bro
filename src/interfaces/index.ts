export interface Exercise {
  id: string;
  name: string;
  categories: string[];
  description?: string;
  url?: string;
}

export interface ExerciseAssignment {
  id: string;
  exerciseId: string;
  dayOfWeek: DayOfWeek;
  exercise?: Exercise;
  order?: number;
}

// Interface para una serie individual
export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface WorkoutRecord {
  id: string;
  exerciseId: string;
  weight: number;
  reps: number;
  sets: number;
  date: Date;
  dayOfWeek: DayOfWeek;
  exercise?: Exercise;
  // Nuevos campos opcionales para series individuales
  individualSets?: WorkoutSet[];
}

export type DayOfWeek = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo';

// Nueva interface para formulario con series individuales
export interface WorkoutFormDataAdvanced {
  sets: WorkoutSet[];
}

// Interface original mantenida para compatibilidad
export interface WorkoutFormData {
  weight: number;
  reps: number;
  sets: number;
}

export interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// UI types
export type { BaseUIProps, ContainerProps, UISize, UIVariant } from './ui';

