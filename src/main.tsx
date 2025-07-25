import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useAppInitialization } from './hooks/use-app-initialization';
import './index.css';
import App from './pages/app';

// Componente wrapper para inicializar la app
const AppWrapper = () => {
  useAppInitialization();
  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
