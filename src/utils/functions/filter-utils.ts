import { ALL_MUSCLE_GROUPS } from '../../constants';
import type { Exercise } from '../../interfaces';
import type { SelectGroup, SelectOption } from '../../interfaces/ui';
import { groupExercisesByCategory } from './select-utils';

/**
 * Generar opciones de filtro para el dashboard
 */

/**
 * Crear opciones de filtro por grupos musculares
 */
export const createMuscleGroupFilterOptions = (): SelectGroup[] => {
  const muscleGroupOptions: SelectOption[] = ALL_MUSCLE_GROUPS.map(group => ({
    value: group.id,
    label: `${group.icon} ${group.name}`
  }));

  return [
    {
      label: 'Filtros generales',
      options: [{ value: 'all', label: 'Todos los grupos' }]
    },
    {
      label: 'Grupos principales',
      options: [
        { value: 'tren-superior', label: '💪 Tren Superior' },
        { value: 'tren-inferior', label: '🦵 Tren Inferior' },
        { value: 'core', label: '🎯 Core' },
        { value: 'cardio', label: '❤️ Cardio' },
        { value: 'funcional', label: '⚡ Funcional' }
      ]
    },
    {
      label: 'Grupos específicos',
      options: [
        { value: 'pecho', label: '🏋️ Pecho' },
        { value: 'espalda', label: '🔙 Espalda' },
        { value: 'piernas', label: '🦵 Piernas' },
        { value: 'hombros', label: '🤸 Hombros' },
        { value: 'brazos', label: '💪 Brazos' }
      ]
    }
  ];
};

/**
 * Crear opciones de filtro por ejercicios individuales
 */
export const createExerciseFilterOptions = (exercises: Exercise[]): SelectGroup[] => {
  return [
    {
      label: 'Filtros generales',
      options: [{ value: 'all', label: 'Todos los ejercicios' }]
    },
    ...groupExercisesByCategory(exercises)
  ];
};

/**
 * Obtener etiqueta descriptiva del filtro activo
 */
export const getActiveFilterLabel = (
  filterType: 'all' | 'exercise' | 'muscle-group',
  selectedExercise: string,
  selectedMuscleGroup: string,
  exercises: Exercise[]
): string => {
  if (filterType === 'all') {
    return 'Todos los datos';
  }

  if (filterType === 'exercise' && selectedExercise !== 'all') {
    const exercise = exercises.find(ex => ex.id === selectedExercise);
    return exercise ? `Ejercicio: ${exercise.name}` : 'Ejercicio seleccionado';
  }

  if (filterType === 'muscle-group' && selectedMuscleGroup !== 'all') {
    const muscleGroup = ALL_MUSCLE_GROUPS.find(group => group.id === selectedMuscleGroup);
    return muscleGroup ? `Grupo: ${muscleGroup.name}` : 'Grupo seleccionado';
  }

  return 'Sin filtro específico';
}; 