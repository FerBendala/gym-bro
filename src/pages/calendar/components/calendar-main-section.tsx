import { Card, CardContent, CardHeader } from '@/components/card';
import { Section } from '@/components/layout';
import { InfoTooltip } from '@/components/tooltip';
import { WorkoutCalendar } from '@/components/workout-calendar';
import type { WorkoutRecord } from '@/interfaces';
import { Calendar } from 'lucide-react';

interface CalendarMainSectionProps {
  records: WorkoutRecord[];
}

export const CalendarMainSection: React.FC<CalendarMainSectionProps> = ({
  records
}) => {
  return (
    <Section>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Calendario de Entrenamientos
            <InfoTooltip
              content="Vista mensual que muestra los días en los que has entrenado. Los puntos indican la intensidad del entrenamiento basada en el volumen total levantado."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <WorkoutCalendar records={records} />
        </CardContent>
      </Card>
    </Section>
  );
}; 