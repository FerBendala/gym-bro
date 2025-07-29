import React from 'react';

import { LoadingSpinner } from '@/components/loading-spinner';

export const DashboardLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-400 text-sm">Cargando dashboard...</p>
    </div>
  );
};
