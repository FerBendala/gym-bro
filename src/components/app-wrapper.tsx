import { useAppInitialization } from '@/hooks/use-app-initialization';
import { VolumeConfigProvider } from '@/hooks/use-volume-provider.tsx';
import App from '@/pages/app';

// Componente wrapper para inicializar la app
export const AppWrapper = () => {
  useAppInitialization();
  return (
    <VolumeConfigProvider>
      <App />
    </VolumeConfigProvider>
  );
};
