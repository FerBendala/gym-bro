import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ModernApp from './pages/modern-app';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ModernApp />
  </StrictMode>
);
