import React from 'react';

interface SettingsHeaderProps {
  title: string;
  description?: string;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  title,
  description = "Personaliza tu experiencia en GymBro"
}) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-gray-400">{description}</p>
  </div>
); 