import { Page } from '@/components/layout';
import { LoadingSpinner } from '@/components/loading-spinner';

export const LoadingState: React.FC = () => {
  return (
    <Page
      title="Calendario"
      subtitle="Vista mensual de entrenamientos"
    >
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    </Page>
  );
}; 