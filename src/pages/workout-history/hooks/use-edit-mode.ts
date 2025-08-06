import { useState } from 'react';

import type { EditMode, WorkoutRecordWithExercise } from '../types';

export const useEditMode = () => {
  const [editingRecord, setEditingRecord] = useState<WorkoutRecordWithExercise | null>(null);
  const [editMode, setEditMode] = useState<EditMode>({
    mode: 'simple',
    weight: 0,
    reps: 0,
    sets: 0,
    date: new Date(),
    individualSets: [],
  });

  const startEditing = (record: WorkoutRecordWithExercise) => {
    setEditingRecord(record);

    // Detectar si tiene series individuales
    const hasIndividualSets = record.individualSets && record.individualSets.length > 0;

    if (hasIndividualSets) {
      setEditMode({
        mode: 'advanced',
        weight: record.weight,
        reps: record.reps,
        sets: record.sets,
        date: record.date,
        individualSets: record.individualSets!.map(set => ({
          weight: set.weight,
          reps: set.reps,
        })),
      });
    } else {
      setEditMode({
        mode: 'simple',
        weight: record.weight,
        reps: record.reps,
        sets: record.sets,
        date: record.date,
        individualSets: [],
      });
    }
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    setEditMode({
      mode: 'simple',
      weight: 0,
      reps: 0,
      sets: 0,
      date: new Date(),
      individualSets: [],
    });
  };

  const changeMode = (mode: 'simple' | 'advanced') => {
    setEditMode(prev => {
      if (mode === 'advanced' && prev.individualSets.length === 0) {
        // Si cambia a modo avanzado y no tiene series, crear series basadas en los datos simples
        const series = [];
        for (let i = 0; i < prev.sets; i++) {
          series.push({ weight: prev.weight, reps: prev.reps });
        }
        return { ...prev, mode, individualSets: series };
      } else if (mode === 'simple' && prev.individualSets.length > 0) {
        // Si cambia a modo simple, calcular promedios de las series individuales
        const totalSets = prev.individualSets.length;
        const totalReps = prev.individualSets.reduce((sum, set) => sum + set.reps, 0);
        const avgReps = Math.round(totalReps / totalSets);
        const avgWeight = prev.individualSets.reduce((sum, set) => sum + set.weight, 0) / totalSets;

        return {
          ...prev,
          mode,
          weight: avgWeight,
          reps: avgReps,
          sets: totalSets,
        };
      }
      return { ...prev, mode };
    });
  };

  const updateEditField = <K extends keyof EditMode>(key: K, value: EditMode[K]) => {
    setEditMode(prev => ({ ...prev, [key]: value }));
  };

  const addIndividualSet = () => {
    setEditMode(prev => ({
      ...prev,
      individualSets: [...prev.individualSets, { weight: 0, reps: 0 }],
    }));
  };

  const removeIndividualSet = (index: number) => {
    setEditMode(prev => ({
      ...prev,
      individualSets: prev.individualSets.filter((_, i) => i !== index),
    }));
  };

  const updateIndividualSet = (index: number, field: 'weight' | 'reps', value: number) => {
    setEditMode(prev => ({
      ...prev,
      individualSets: prev.individualSets.map((set, i) =>
        i === index ? { ...set, [field]: value } : set,
      ),
    }));
  };

  return {
    editingRecord,
    editMode,
    startEditing,
    cancelEdit,
    changeMode,
    updateEditField,
    addIndividualSet,
    removeIndividualSet,
    updateIndividualSet,
  };
};
