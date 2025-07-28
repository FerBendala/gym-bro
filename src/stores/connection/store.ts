import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createConnectionActions } from './actions';
import type { ConnectionStore } from './types';
import { getInitialState } from './utils';

// Crear el store de conexión
export const useConnectionStore = create<ConnectionStore>()(
  devtools(
    (set, get) => ({
      ...getInitialState(),

      // Combinar todas las acciones
      ...createConnectionActions(set, get),
    }),
    {
      name: 'connection-store',
    }
  )
); 