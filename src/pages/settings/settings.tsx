import React from 'react';

import { MainSettings, SettingsContent } from './components';
import { useSettingsNavigation } from './hooks';

/**
 * Página de configuración con exportación de datos y configuraciones de volumen
 * Incluye navegación a diferentes secciones de configuración
 */
export const ModernSettings: React.FC = () => {
  const { activeSection, navigateToSection, goBackToMain } = useSettingsNavigation();

  const renderContent = () => {
    if (activeSection === 'main') {
      return <MainSettings onItemClick={navigateToSection} />;
    }

    return <SettingsContent activeSection={activeSection} onBack={goBackToMain} />;
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};
