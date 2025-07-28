import React from 'react';
import type { AdminPanelTab } from '../types';

interface AdminTabsProps {
  activeTab: AdminPanelTab;
  onTabChange: (tab: AdminPanelTab) => void;
  isModal?: boolean;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  activeTab,
  onTabChange,
  isModal = false
}) => {
  const tabs: { id: AdminPanelTab; label: string; }[] = [
    { id: 'exercises', label: 'Ejercicios' },
    { id: 'assignments', label: 'Asignaciones' }
  ];

  if (isModal) {
    return (
      <div className="border-b border-gray-700/50 bg-gray-800/30">
        <div className="flex space-x-1 px-6 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-1">
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === tab.id
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}; 