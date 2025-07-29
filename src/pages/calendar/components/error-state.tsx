import { Card, CardContent } from '@/components/card';
import { Page } from '@/components/layout';

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <Page
      title="Calendario"
      subtitle="Vista mensual de entrenamientos"
    >
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">Error al cargar datos</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
};
