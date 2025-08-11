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
        <div className="bg-gray-900/30 border border-gray-800/60 rounded-2xl p-3 sm:p-4 md:p-6">
          <WorkoutCalendar records={records} />
        </div>
      </div>
    </Section>
  );
};
