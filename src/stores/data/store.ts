import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createAssignmentActions, createExerciseActions } from './actions';
import type { DataStore } from './types';
import { getInitialState, persistenceConfig } from './utils';

// Crear el store de datos
export const useDataStore = create<DataStore>()(
  devtools(
    persist(
      (set) => ({
        ...getInitialState(),

        // Combinar todas las acciones
        ...createExerciseActions(set),
        ...createAssignmentActions(set),
      }),
      persistenceConfig,
    ),
    {
      name: 'data-store',
    },
  ),
);
