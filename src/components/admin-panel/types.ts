import type { DayOfWeek, Exercise, ExerciseAssignment } from '@/interfaces';

export type ExerciseCategory = 'all' | string;
export type AdminPanelTab = 'exercises' | 'assignments';

export interface AdminPanelProps {
  onClose: () => void;
  isPage?: boolean;
}

export interface ExerciseFormData {
  name: string;
  categories: string[];
  description: string;
  url: string;
}

export interface AssignmentFormData {
  exerciseId: string;
  dayOfWeek: DayOfWeek;
}

export interface ExerciseListProps {
  exercises: Exercise[];
  isOnline: boolean;
  onEditExercise: (exercise: Exercise) => void;
  onDelete: (exerciseId: string) => Promise<boolean>;
  onPreviewUrl: (url: string) => void;
}

export interface ExerciseAssignmentsProps {
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  exercises: Exercise[];
  assignments: ExerciseAssignment[];
  isOnline: boolean;
  loading: boolean;
  onCreateAssignment: (exerciseId: string, dayOfWeek: DayOfWeek) => Promise<boolean>;
  onDeleteAssignment: (assignmentId: string) => Promise<boolean>;
  onPreviewUrl: (url: string) => void;
}

export interface DataChangeEventDetail {
  type: 'assignments';
  data?: ExerciseAssignment | { deleted: string };
  timestamp: number;
}

export interface ExerciseDataChangeEventDetail {
  type: 'exercises';
  data?: Exercise | Partial<Exercise> | { deleted: string };
  timestamp: number;
}