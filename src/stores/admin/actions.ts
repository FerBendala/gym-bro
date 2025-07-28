import type { Exercise, ExerciseAssignment } from '@/interfaces';
import type { AdminStore } from './types';
import { getInitialState } from './utils';

// Acciones de UI
export const createUIActions = (set: (fn: (state: AdminStore) => Partial<AdminStore>) => void) => ({
  openPanel: () => set((state: AdminStore) => ({
    adminPanel: { ...state.adminPanel, isOpen: true }
  })),

  closePanel: () => set((state: AdminStore) => ({
    adminPanel: { ...state.adminPanel, isOpen: false }
  })),

  setTab: (activeTab: 'exercises' | 'assignments') => set((state: AdminStore) => ({
    adminPanel: { ...state.adminPanel, activeTab }
  })),

  setSelectedDay: (selectedDay: string) => set((state: AdminStore) => ({
    adminPanel: { ...state.adminPanel, selectedDay }
  })),

  setEditingExercise: (editingExercise: Exercise | null) => set((state: AdminStore) => ({
    adminPanel: { ...state.adminPanel, editingExercise }
  })),

  setPreviewUrl: (previewUrl: string | null) => set((state: AdminStore) => ({
    adminPanel: { ...state.adminPanel, previewUrl }
  })),
});

// Acciones de carga
export const createLoadingActions = (set: (fn: (state: AdminStore) => Partial<AdminStore>) => void) => ({
  setLoading: (key: keyof AdminStore['loading'], value: boolean) => set((state: AdminStore) => ({
    loading: { ...state.loading, [key]: value }
  })),

  setError: (key: keyof AdminStore['errors'], error: string | null) => set((state: AdminStore) => ({
    errors: { ...state.errors, [key]: error }
  })),
});

// Acciones de datos
export const createDataActions = (set: (fn: (state: AdminStore) => Partial<AdminStore>) => void) => ({
  setExercises: (exercises: Exercise[]) => {
    set((state: AdminStore) => {
      const newState = { ...state, exercises };
      return newState;
    });
  },

  setAssignments: (assignments: ExerciseAssignment[]) => set({ assignments }),
});

// Acciones auxiliares para CRUD
export const createCRUDActions = (set: (fn: (state: AdminStore) => Partial<AdminStore>) => void) => ({
  addExercise: (exercise: Exercise) => set((state: AdminStore) => ({
    exercises: [...state.exercises, exercise]
  })),

  updateExerciseInStore: (exerciseId: string, updates: Partial<Exercise>) => set((state: AdminStore) => ({
    exercises: state.exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, ...updates } : ex
    )
  })),

  removeExerciseFromStore: (exerciseId: string) => set((state: AdminStore) => ({
    exercises: state.exercises.filter(ex => ex.id !== exerciseId)
  })),

  addAssignment: (assignment: ExerciseAssignment) => set((state: AdminStore) => ({
    assignments: [...state.assignments, assignment]
  })),

  removeAssignmentFromStore: (assignmentId: string) => set((state: AdminStore) => ({
    assignments: state.assignments.filter(assignment => assignment.id !== assignmentId)
  })),
});

// Acciones de filtros
export const createFilterActions = (set: (fn: (state: AdminStore) => Partial<AdminStore>) => void) => ({
  setExerciseCategory: (exerciseCategory: string) => set((state: AdminStore) => ({
    filters: { ...state.filters, exerciseCategory }
  })),

  setSearchTerm: (searchTerm: string) => set((state: AdminStore) => ({
    filters: { ...state.filters, searchTerm }
  })),
});

// Utilidades
export const createUtilityActions = (set: (fn: (state: AdminStore) => Partial<AdminStore>) => void, get: () => AdminStore) => ({
  getFilteredExercises: () => {
    const { exercises, filters } = get();
    let filtered = exercises;

    // Filtrar por categoría
    if (filters.exerciseCategory !== 'all') {
      filtered = filtered.filter(ex =>
        ex.categories?.includes(filters.exerciseCategory)
      );
    }

    // Filtrar por búsqueda
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(term) ||
        ex.description?.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  },

  getAssignmentsByDay: (day: string) => {
    const { assignments } = get();
    return assignments.filter(assignment => assignment.dayOfWeek === day);
  },

  resetState: () => set(getInitialState()),
}); 