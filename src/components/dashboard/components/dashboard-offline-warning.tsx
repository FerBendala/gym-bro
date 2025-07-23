import React from 'react';
import { OfflineWarning } from '../../offline-warning';

export const DashboardOfflineWarning: React.FC = () => {
  return (
    <OfflineWarning message="Sin conexión. Los datos mostrados pueden estar desactualizados." />
  );
}; 