import type { DayOfWeek, Exercise } from '@/interfaces';

// Tipos para el admin panel (compartidos entre stores)
export interface AdminPanelState {
  isOpen: boolean;
  activeTab: 'exercises' | 'assignments';
  selectedDay: DayOfWeek;
  editingExercise: Exercise | null;
  previewUrl: string | null;
}
