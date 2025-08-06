/**
 * Interfaces de dominio del negocio
 * Tipos relacionados con la lógica de negocio de la aplicación
 */

export interface Exercise {
  id: string;
  name: string;
  categories: string[];
  description?: string;
  url?: string;
  categoryPercentages?: Record<string, number>;
}

export interface ExerciseAssignment {
  id: string;
  exerciseId: string;
  dayOfWeek: DayOfWeek;
  exercise?: Exercise;
  order?: number;
}

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
  individualSets?: WorkoutSet[];
}

export type DayOfWeek = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo';

export interface WorkoutFormDataAdvanced {
  sets: WorkoutSet[];
  date?: Date;
}

export interface WorkoutFormData {
  weight: number;
  reps: number;
  sets: number;
  date?: Date;
}
