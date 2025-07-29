import {
  CalendarMainSection,
  EmptyState,
  ErrorState,
  LoadingState,
  MonthStatsSection,
} from './components';
import { useCalendarData } from './hooks';
import { getCurrentMonthStats } from './utils';

import { Page } from '@/components/layout';

/**
 * Página de calendario moderna con datos reales
 */
export const ModernCalendar: React.FC = () => {
  const { records, loading, error } = useCalendarData();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const monthStats = getCurrentMonthStats(records);

  return (
    <Page
      title="Calendario"
      subtitle="Vista mensual de entrenamientos"
    >
      <MonthStatsSection monthStats={monthStats} />
      <CalendarMainSection records={records} />
      {records.length === 0 && <EmptyState />}
    </Page>
  );
};
