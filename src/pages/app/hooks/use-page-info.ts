import { PAGE_SUBTITLES, PAGE_TITLES } from '../constants';
import type { PageInfo } from '../types';

import type { DayOfWeek } from '@/interfaces';

export const usePageInfo = (activeTab: string, activeDay: DayOfWeek): PageInfo => {
  const getPageInfo = (): PageInfo => {
    switch (activeTab) {
      case 'home':
        return {
          title: PAGE_TITLES.home,
          subtitle: `${activeDay.charAt(0).toUpperCase() + activeDay.slice(1)} • ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`,
        };
      case 'progress':
        return {
          title: PAGE_TITLES.progress,
          subtitle: PAGE_SUBTITLES.progress,
        };
      case 'calendar':
        return {
          title: PAGE_TITLES.calendar,
          subtitle: PAGE_SUBTITLES.calendar,
        };
      case 'chat':
        return {
          title: PAGE_TITLES.chat,
          subtitle: PAGE_SUBTITLES.chat,
        };
      case 'settings':
        return {
          title: PAGE_TITLES.settings,
          subtitle: PAGE_SUBTITLES.settings,
        };
      case 'history':
        return {
          title: PAGE_TITLES.history,
          subtitle: PAGE_SUBTITLES.history,
        };
      default:
        return { title: PAGE_TITLES.default };
    }
  };

  return getPageInfo();
};
