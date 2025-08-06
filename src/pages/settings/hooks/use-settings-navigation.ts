import { useState } from 'react';

import { SettingsSection } from '../types';

export const useSettingsNavigation = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');

  const navigateToSection = (section: SettingsSection) => {
    setActiveSection(section);
  };

  const goBackToMain = () => {
    setActiveSection('main');
  };

  return {
    activeSection,
    navigateToSection,
    goBackToMain,
  };
};
