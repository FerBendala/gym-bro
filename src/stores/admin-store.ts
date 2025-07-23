import type { DayOfWeek, Exercise, ExerciseAssignment } from '@/interfaces';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AdminPanelState } from './types';

// Tipos para el estado del admin
interface AdminState {
  // Estado de la UI
  adminPanel: AdminPanelState;

  // Estado de carga
  loading: {
    exercises: boolean;
    assignments: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };

  // Errores
  errors: {
    exercises: string | null;
    assignments: string | null;
  };

  // Datos
  exercises: Exercise[];
  assignments: ExerciseAssignment[];

  // Filtros y búsqueda
  filters: {
    exerciseCategory: string;
    searchTerm: string;
  };
}

// Acciones del admin
interface AdminActions {
  // Acciones de UI
  openPanel: () => void;
  closePanel: () => void;
  setTab: (tab: 'exercises' | 'assignments') => void;
  setSelectedDay: (day: DayOfWeek) => void;
  setEditingExercise: (exercise: Exercise | null) => void;
  setPreviewUrl: (url: string | null) => void;

  // Acciones de carga
  setLoading: (key: keyof AdminState['loading'], value: boolean) => void;
  setError: (key: keyof AdminState['errors'], error: string | null) => void;

  // Acciones de datos
  setExercises: (exercises: Exercise[]) => void;
  setAssignments: (assignments: ExerciseAssignment[]) => void;

  // Acciones auxiliares para CRUD
  addExercise: (exercise: Exercise) => void;
  updateExerciseInStore: (exerciseId: string, updates: Partial<Exercise>) => void;
  removeExerciseFromStore: (exerciseId: string) => void;
  addAssignment: (assignment: ExerciseAssignment) => void;
  removeAssignmentFromStore: (assignmentId: string) => void;

  // Acciones de filtros
  setExerciseCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;

  // Utilidades
  getFilteredExercises: () => Exercise[];
  getAssignmentsByDay: (day: DayOfWeek) => ExerciseAssignment[];
  resetState: () => void;
}

// Store completo
type AdminStore = AdminState & AdminActions;

// Estado inicial
const initialState: AdminState = {
  adminPanel: {
    isOpen: false,
    activeTab: 'exercises',
    selectedDay: 'lunes',
    editingExercise: null,
    previewUrl: null,
  },

  loading: {
    exercises: false,
    assignments: false,
    creating: false,
    updating: false,
    deleting: false,
  },

  errors: {
    exercises: null,
    assignments: null,
  },

  exercises: [],
  assignments: [],

  filters: {
    exerciseCategory: 'all',
    searchTerm: '',
  },
};

// Crear el store del admin
export const useAdminStore = create<AdminStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Acciones de UI
        openPanel: () => set((state) => ({
          adminPanel: { ...state.adminPanel, isOpen: true }
        })),

        closePanel: () => set((state) => ({
          adminPanel: { ...state.adminPanel, isOpen: false }
        })),

        setTab: (activeTab) => set((state) => ({
          adminPanel: { ...state.adminPanel, activeTab }
        })),

        setSelectedDay: (selectedDay) => set((state) => ({
          adminPanel: { ...state.adminPanel, selectedDay }
        })),

        setEditingExercise: (editingExercise) => set((state) => ({
          adminPanel: { ...state.adminPanel, editingExercise }
        })),

        setPreviewUrl: (previewUrl) => set((state) => ({
          adminPanel: { ...state.adminPanel, previewUrl }
        })),

        // Acciones de carga
        setLoading: (key, value) => set((state) => ({
          loading: { ...state.loading, [key]: value }
        })),

        setError: (key, error) => set((state) => ({
          errors: { ...state.errors, [key]: error }
        })),

        // Acciones de datos
        setExercises: (exercises) => set({ exercises }),

        setAssignments: (assignments) => set({ assignments }),

        // Acciones auxiliares para CRUD
        addExercise: (exercise: Exercise) => set((state) => ({
          exercises: [...state.exercises, exercise]
        })),

        updateExerciseInStore: (exerciseId: string, updates: Partial<Exercise>) => set((state) => ({
          exercises: state.exercises.map(ex =>
            ex.id === exerciseId ? { ...ex, ...updates } : ex
          )
        })),

        removeExerciseFromStore: (exerciseId: string) => set((state) => ({
          exercises: state.exercises.filter(ex => ex.id !== exerciseId)
        })),

        addAssignment: (assignment: ExerciseAssignment) => set((state) => ({
          assignments: [...state.assignments, assignment]
        })),

        removeAssignmentFromStore: (assignmentId: string) => set((state) => ({
          assignments: state.assignments.filter(assignment => assignment.id !== assignmentId)
        })),

        // Acciones de filtros
        setExerciseCategory: (exerciseCategory) => set((state) => ({
          filters: { ...state.filters, exerciseCategory }
        })),

        setSearchTerm: (searchTerm) => set((state) => ({
          filters: { ...state.filters, searchTerm }
        })),

        // Utilidades
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

        getAssignmentsByDay: (day) => {
          const { assignments } = get();
          return assignments.filter(assignment => assignment.dayOfWeek === day);
        },

        resetState: () => set(initialState),
      }),
      {
        name: 'follow-gym-admin',
        partialize: (state) => ({
          // Persistir solo los datos que no cambian frecuentemente
          exercises: state.exercises,
          assignments: state.assignments,
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'admin-store',
    }
  )
);

// Selectores optimizados
export const useAdminUI = () => useAdminStore((state) => state.adminPanel);
export const useAdminLoading = () => useAdminStore((state) => state.loading);
export const useAdminErrors = () => useAdminStore((state) => state.errors);
export const useAdminFilters = () => useAdminStore((state) => state.filters);
export const useAdminExercises = () => useAdminStore((state) => state.exercises);
export const useAdminAssignments = () => useAdminStore((state) => state.assignments); 