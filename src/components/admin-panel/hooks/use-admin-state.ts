import { useState } from 'react';

import type { AdminPanelTab } from '../types';

import type { DayOfWeek, Exercise } from '@/interfaces';

/**
 * Hook para manejar el estado del panel de administraci n
 * @returns Un objeto con el estado del panel de administraci n
 */
export const useAdminState = () => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lunes');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminPanelTab>('exercises');

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setActiveTab('exercises');
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
  };

  const handlePreviewUrl = (url: string) => {
    setPreviewUrl(url);
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
  };

  return {
    selectedDay,
    setSelectedDay,
    editingExercise,
    previewUrl,
    activeTab,
    setActiveTab,
    handleEditExercise,
    handleCancelEdit,
    handlePreviewUrl,
    handleClosePreview,
  };
};
