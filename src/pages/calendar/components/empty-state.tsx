import { Calendar } from 'lucide-react';

import { Card, CardContent } from '@/components/card';
import { Section } from '@/components/layout';

export const EmptyState: React.FC = () => {
  return (
    <Section>
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No hay entrenamientos registrados
            </h3>
            <p className="text-gray-500">
              Comienza a registrar tus entrenamientos para ver tu progreso en el calendario
            </p>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
};
