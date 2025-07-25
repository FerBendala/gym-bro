import type { Exercise, ExerciseAssignment } from '@/interfaces';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AssignmentsState, ExercisesState } from './types';

interface DataState {
  exercises: ExercisesState;
  assignments: AssignmentsState;
}

interface DataActions {
  // Acciones de ejercicios
  setExercises: (exercises: Exercise[]) => void;
  addExercise: (exercise: Exercise) => void;
  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
  removeExercise: (exerciseId: string) => void;
  setExercisesLoading: (loading: boolean) => void;
  setExercisesError: (error: string | null) => void;

  // Acciones de asignaciones
  setAssignments: (assignments: ExerciseAssignment[]) => void;
  addAssignment: (assignment: ExerciseAssignment) => void;
  removeAssignment: (assignmentId: string) => void;
  setAssignmentsLoading: (loading: boolean) => void;
  setAssignmentsError: (error: string | null) => void;
}

type DataStore = DataState & DataActions;

const initialState: DataState = {
  exercises: {
    items: [],
    loading: false,
    error: null,
  },
  assignments: {
    items: [],
    loading: false,
    error: null,
  },
};

export const useDataStore = create<DataStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Acciones de ejercicios
        setExercises: (items) => set((state) => ({
          exercises: { ...state.exercises, items }
        })),

        addExercise: (exercise) => set((state) => ({
          exercises: {
            ...state.exercises,
            items: [...state.exercises.items, exercise]
          }
        })),

        updateExercise: (exerciseId, updates) => set((state) => ({
          exercises: {
            ...state.exercises,
            items: state.exercises.items.map(ex =>
              ex.id === exerciseId ? { ...ex, ...updates } : ex
            )
          }
        })),

        removeExercise: (exerciseId) => set((state) => ({
          exercises: {
            ...state.exercises,
            items: state.exercises.items.filter(ex => ex.id !== exerciseId)
          }
        })),

        setExercisesLoading: (loading) => set((state) => ({
          exercises: { ...state.exercises, loading }
        })),

        setExercisesError: (error) => set((state) => ({
          exercises: { ...state.exercises, error }
        })),

        // Acciones de asignaciones
        setAssignments: (items) => set((state) => ({
          assignments: { ...state.assignments, items }
        })),

        addAssignment: (assignment) => set((state) => ({
          assignments: {
            ...state.assignments,
            items: [...state.assignments.items, assignment]
          }
        })),

        removeAssignment: (assignmentId) => set((state) => ({
          assignments: {
            ...state.assignments,
            items: state.assignments.items.filter(assignment => assignment.id !== assignmentId)
          }
        })),

        setAssignmentsLoading: (loading) => set((state) => ({
          assignments: { ...state.assignments, loading }
        })),

        setAssignmentsError: (error) => set((state) => ({
          assignments: { ...state.assignments, error }
        })),
      }),
      {
        name: 'gymbro-data',
        partialize: (state) => ({
          // Persistir solo los datos, no los estados de carga/error
          exercises: { items: state.exercises.items },
          assignments: { items: state.assignments.items },
        }),
      }
    ),
    {
      name: 'data-store',
    }
  )
);

// Selectores optimizados
export const useExercises = () => useDataStore((state) => state.exercises);
export const useAssignments = () => useDataStore((state) => state.assignments); 