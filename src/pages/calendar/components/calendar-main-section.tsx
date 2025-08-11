import { Calendar } from 'lucide-react';

import { Section } from '@/components/layout';
import { InfoTooltip } from '@/components/tooltip';
import { WorkoutCalendar } from '@/components/workout-calendar';
import type { WorkoutRecord } from '@/interfaces';

interface CalendarMainSectionProps {
  records: WorkoutRecord[];
}

export const CalendarMainSection: React.FC<CalendarMainSectionProps> = ({
  records,
}) => {
  return (
    <Section>
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Calendario de Entrenamientos
            <InfoTooltip
              content="Vista mensual que muestra los días en los que has entrenado. Los puntos indican la intensidad del entrenamiento basada en el volumen total levantado."
              position="top"
              className="ml-2"
            />
          </h3>
        </div>

        <div className="bg-gray-900/30 border border-gray-800/60 rounded-2xl p-3 sm:p-4 md:p-6">
          <WorkoutCalendar records={records} />
        </div>
      </div>
    </Section>
  );
};
