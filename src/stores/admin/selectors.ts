import { useAdminStore } from './store';

// Selectores optimizados
export const useAdminUI = () => useAdminStore((state) => state.adminPanel);
export const useAdminLoading = () => useAdminStore((state) => state.loading);
export const useAdminErrors = () => useAdminStore((state) => state.errors);
export const useAdminFilters = () => useAdminStore((state) => state.filters);
export const useAdminExercises = () => useAdminStore((state) => state.exercises);
export const useAdminAssignments = () => useAdminStore((state) => state.assignments);
