import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ModernApp from './pages';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ModernApp />
  </StrictMode>
);
