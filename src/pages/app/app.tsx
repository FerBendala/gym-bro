import { AppContent } from './components';
import { useMigration } from './hooks';

export const AppPage = () => {
  useMigration();

  return <AppContent />;
}; 