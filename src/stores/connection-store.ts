import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ConnectionState {
  isOnline: boolean;
}

interface ConnectionActions {
  setOnlineStatus: (isOnline: boolean) => void;
}

type ConnectionStore = ConnectionState & ConnectionActions;

const initialState: ConnectionState = {
  isOnline: navigator.onLine,
};

export const useConnectionStore = create<ConnectionStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setOnlineStatus: (isOnline) => set({ isOnline }),
    }),
    {
      name: 'connection-store',
    }
  )
);

// Selector optimizado
export const useOnlineStatus = () => useConnectionStore((state) => state.isOnline); 