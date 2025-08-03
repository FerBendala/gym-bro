import { useEffect, useState } from 'react';

import { auth } from '@/api/firebase';
import { logger } from '@/utils';
import type { User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setState({
          user,
          loading: false,
          error: null,
        });
        logger.info('Estado de autenticación actualizado:', user ? 'Usuario autenticado' : 'Usuario no autenticado');
      },
      (error) => {
        setState({
          user: null,
          loading: false,
          error: error.message,
        });
        logger.error('Error en autenticación:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const getUserId = (): string => {
    if (state.user?.uid) {
      return state.user.uid;
    }
    // Fallback para desarrollo o cuando no hay usuario autenticado
    return 'default-user';
  };

  return {
    ...state,
    getUserId,
  };
}; 