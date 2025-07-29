import type { AdminState } from './types';

import type { DayOfWeek } from '@/interfaces';

// Función para obtener el día actual
export const getCurrentDay = (): DayOfWeek => {
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
  const dayMap: Record<string, DayOfWeek> = {
    'lunes': 'lunes',
    'martes': 'martes',
    'miércoles': 'miércoles',
    'jueves': 'jueves',
    'viernes': 'viernes',
    'sábado': 'sábado',
    'domingo': 'domingo',
  };
  return dayMap[today] || 'lunes';
};

// Estado inicial
export const getInitialState = (): AdminState => {
  const currentDay = getCurrentDay();
  const validDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const safeCurrentDay = validDays.includes(currentDay) ? currentDay : 'lunes';

  return {
    adminPanel: {
      isOpen: false,
      activeTab: 'exercises',
      selectedDay: safeCurrentDay,
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
};
