import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ModernApp from './pages';
import { AppProvider } from './providers/app-provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <ModernApp />
    </AppProvider>
  </StrictMode>
);
