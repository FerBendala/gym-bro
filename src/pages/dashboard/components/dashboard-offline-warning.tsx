import { OfflineWarning } from '@/components/offline-warning';
import React from 'react';

export const DashboardOfflineWarning: React.FC = () => {
  return (
    <OfflineWarning message="Sin conexión. Los datos mostrados pueden estar desactualizados." />
  );
}; 