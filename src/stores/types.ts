import type { DayOfWeek, Exercise, ExerciseAssignment } from '@/interfaces';

// Tipos para notificaciones
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationState {
  show: boolean;
  message: string;
  type: NotificationType;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
}

// Tipos para el admin panel
export interface AdminPanelState {
  isOpen: boolean;
  activeTab: 'exercises' | 'assignments';
  selectedDay: DayOfWeek;
  editingExercise: Exercise | null;
  previewUrl: string | null;
}

// Tipos para ejercicios
export interface ExercisesState {
  items: Exercise[];
  loading: boolean;
  error: string | null;
}

// Tipos para asignaciones
export interface AssignmentsState {
  items: ExerciseAssignment[];
  loading: boolean;
  error: string | null;
} 