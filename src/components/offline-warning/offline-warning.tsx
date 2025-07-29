import React from 'react';

import { WarningContent } from './components';
import { useOfflineWarning } from './hooks';
import type { OfflineWarningProps } from './types';

/**
 * Componente genérico para mostrar advertencias y alertas de estado
 * Reutilizable en Dashboard, AdminPanel, ExerciseCard y otros componentes
 */
export const OfflineWarning: React.FC<OfflineWarningProps> = (props) => {
  const { message, icon, alertStyles, finalIconClassName } = useOfflineWarning(props);

  return (
    <div className={alertStyles}>
      <WarningContent
        icon={icon}
        className={finalIconClassName}
        message={message}
      />
    </div>
  );
};
