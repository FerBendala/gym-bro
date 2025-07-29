import type { DataStore } from './types';

import type { Exercise, ExerciseAssignment } from '@/interfaces';

// Tipos para las acciones
type SetStateFunction = (fn: (state: DataStore) => Partial<DataStore>) => void;

// Acciones de ejercicios
export const createExerciseActions = (set: SetStateFunction) => ({
  setExercises: (exercises: Exercise[]) => set((state: DataStore) => ({
    exercises: { ...state.exercises, items: exercises },
  })),

  addExercise: (exercise: Exercise) => set((state: DataStore) => ({
    exercises: {
      ...state.exercises,
      items: [...state.exercises.items, exercise],
    },
  })),

  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => set((state: DataStore) => ({
    exercises: {
      ...state.exercises,
      items: state.exercises.items.map((ex: Exercise) =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex,
      ),
    },
  })),

  removeExercise: (exerciseId: string) => set((state: DataStore) => ({
    exercises: {
      ...state.exercises,
      items: state.exercises.items.filter((ex: Exercise) => ex.id !== exerciseId),
    },
  })),

  setExercisesLoading: (loading: boolean) => set((state: DataStore) => ({
    exercises: { ...state.exercises, loading },
  })),

  setExercisesError: (error: string | null) => set((state: DataStore) => ({
    exercises: { ...state.exercises, error },
  })),
});

// Acciones de asignaciones
export const createAssignmentActions = (set: SetStateFunction) => ({
  setAssignments: (assignments: ExerciseAssignment[]) => set((state: DataStore) => ({
    assignments: { ...state.assignments, items: assignments },
  })),

  addAssignment: (assignment: ExerciseAssignment) => set((state: DataStore) => ({
    assignments: {
      ...state.assignments,
      items: [...state.assignments.items, assignment],
    },
  })),

  removeAssignment: (assignmentId: string) => set((state: DataStore) => ({
    assignments: {
      ...state.assignments,
      items: state.assignments.items.filter((assignment: ExerciseAssignment) => assignment.id !== assignmentId),
    },
  })),

  setAssignmentsLoading: (loading: boolean) => set((state: DataStore) => ({
    assignments: { ...state.assignments, loading },
  })),

  setAssignmentsError: (error: string | null) => set((state: DataStore) => ({
    assignments: { ...state.assignments, error },
  })),
});
