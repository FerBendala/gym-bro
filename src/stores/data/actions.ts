import type { Exercise, ExerciseAssignment } from '@/interfaces';

// Acciones de ejercicios
export const createExerciseActions = (set: any) => ({
  setExercises: (exercises: Exercise[]) => set((state: any) => ({
    exercises: { ...state.exercises, items: exercises }
  })),

  addExercise: (exercise: Exercise) => set((state: any) => ({
    exercises: {
      ...state.exercises,
      items: [...state.exercises.items, exercise]
    }
  })),

  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => set((state: any) => ({
    exercises: {
      ...state.exercises,
      items: state.exercises.items.map((ex: Exercise) =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      )
    }
  })),

  removeExercise: (exerciseId: string) => set((state: any) => ({
    exercises: {
      ...state.exercises,
      items: state.exercises.items.filter((ex: Exercise) => ex.id !== exerciseId)
    }
  })),

  setExercisesLoading: (loading: boolean) => set((state: any) => ({
    exercises: { ...state.exercises, loading }
  })),

  setExercisesError: (error: string | null) => set((state: any) => ({
    exercises: { ...state.exercises, error }
  })),
});

// Acciones de asignaciones
export const createAssignmentActions = (set: any) => ({
  setAssignments: (assignments: ExerciseAssignment[]) => set((state: any) => ({
    assignments: { ...state.assignments, items: assignments }
  })),

  addAssignment: (assignment: ExerciseAssignment) => set((state: any) => ({
    assignments: {
      ...state.assignments,
      items: [...state.assignments.items, assignment]
    }
  })),

  removeAssignment: (assignmentId: string) => set((state: any) => ({
    assignments: {
      ...state.assignments,
      items: state.assignments.items.filter((assignment: ExerciseAssignment) => assignment.id !== assignmentId)
    }
  })),

  setAssignmentsLoading: (loading: boolean) => set((state: any) => ({
    assignments: { ...state.assignments, loading }
  })),

  setAssignmentsError: (error: string | null) => set((state: any) => ({
    assignments: { ...state.assignments, error }
  })),
}); 