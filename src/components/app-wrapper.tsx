import { useAppInitialization } from '@/hooks/use-app-initialization';
import App from '@/pages/app';

// Componente wrapper para inicializar la app
export const AppWrapper = () => {
  useAppInitialization();
  return <App />;
}; 