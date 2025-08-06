import { Plus, Save, XCircle } from 'lucide-react';
import React from 'react';

import type { ExerciseFormData } from '../types';

import {
  createExercise,
  updateExercise,
} from '@/api/services';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Input } from '@/components/input';
import { MultiSelect } from '@/components/multi-select';
import { URLPreview } from '@/components/url-preview';
import { EXERCISE_CATEGORIES } from '@/constants';
import { useExerciseForm } from '@/hooks';
import type { Exercise } from '@/interfaces';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';
import { useNotification } from '@/stores/notification';

import { CategoryPercentagesInput } from './category-percentages-input';

interface ExerciseFormProps {
  exercise?: Exercise;
  onCancel?: () => void;
  onPreviewUrl: (url: string) => void;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  exercise,
  onCancel,
  onPreviewUrl,
}) => {
  const isOnline = useOnlineStatus();
  const { showNotification } = useNotification();

  // Usar selectores específicos para acceder al estado correctamente
  const editingExercise = useAdminStore((state) => state.adminPanel.editingExercise);
  const setEditingExercise = useAdminStore((state) => state.setEditingExercise);
  const setTab = useAdminStore((state) => state.setTab);
  const setLoading = useAdminStore((state) => state.setLoading);
  const setError = useAdminStore((state) => state.setError);
  const addExercise = useAdminStore((state) => state.addExercise);
  const updateExerciseInStore = useAdminStore((state) => state.updateExerciseInStore);

  const handleFormSubmit = async (data: ExerciseFormData) => {
    if (!isOnline) {
      showNotification('Sin conexión. No se puede guardar el ejercicio.', 'error');
      return false;
    }

    setLoading('creating', true);
    setError('exercises', null);

    try {
      // Preparar datos para Firebase - convertir campos vacíos a undefined
      const exerciseData = {
        name: data.name,
        categories: data.categories,
        description: data.description?.trim() || undefined,
        url: data.url?.trim() || undefined,
        categoryPercentages: data.categoryPercentages && Object.keys(data.categoryPercentages).length > 0
          ? data.categoryPercentages
          : undefined,
      };

      if (editingExercise) {
        // Actualizar ejercicio existente
        await updateExercise(editingExercise.id, exerciseData);
        updateExerciseInStore(editingExercise.id, exerciseData);
        showNotification(`Ejercicio "${data.name}" actualizado exitosamente`, 'success');
        setEditingExercise(null);
        setTab('exercises'); // Regresar al tab de ejercicios
      } else {
        // Crear nuevo ejercicio
        const exerciseId = await createExercise(exerciseData);
        const newExercise: Exercise = {
          id: exerciseId,
          ...exerciseData,
        };
        addExercise(newExercise);
        showNotification(`Ejercicio "${data.name}" creado exitosamente`, 'success');
        setTab('exercises'); // Regresar al tab de ejercicios
      }
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al guardar el ejercicio';
      setError('exercises', message);
      showNotification(message, 'error');
      return false;
    } finally {
      setLoading('creating', false);
    }
  };

  const {
    register,
    handleSubmit,
    errors,
    watchedUrl,
    watchedCategories,
    watchedPercentages,
    isEditing,
    validateURL,
    setValue,
  } = useExerciseForm({ exercise, onSubmit: handleFormSubmit });

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Nombre del ejercicio"
            disabled={!isOnline}
            {...register('name', {
              required: 'El nombre es requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
            })}
            error={errors.name?.message}
          />
          <div>
            <input
              type="hidden"
              {...register('categories', {
                validate: (value) => {
                  if (!value || value.length === 0) {
                    return 'Selecciona al menos una categoría';
                  }
                  return true;
                },
              })}
              value={JSON.stringify(watchedCategories)}
            />
            <MultiSelect
              label="Categorías"
              disabled={!isOnline}
              options={EXERCISE_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              value={watchedCategories}
              onChange={(values) => setValue('categories', values)}
              error={errors.categories?.message}
              placeholder="Selecciona categorías..."
            />
          </div>
        </div>

        {/* Componente de porcentajes de categorías */}
        <CategoryPercentagesInput
          selectedCategories={watchedCategories}
          percentages={watchedPercentages}
          onPercentagesChange={(percentages) => {
            setValue('categoryPercentages', percentages);
          }}
          disabled={!isOnline}
        />

        {/* Campo oculto para categoryPercentages - solo para validación */}
        <input
          type="hidden"
          {...register('categoryPercentages', {
            validate: (value) => {
              // Solo validar si hay categorías seleccionadas
              if (watchedCategories.length === 0) return true;

              // Si hay categorías, verificar que los porcentajes sumen 100%
              if (value && Object.keys(value).length > 0) {
                const total = Object.values(value).reduce((sum, val) => sum + (val || 0), 0);
                if (Math.abs(total - 100) > 0.1) {
                  return 'Los porcentajes deben sumar exactamente 100%';
                }
              }
              return true;
            },
          })}
          value={JSON.stringify(watchedPercentages)}
        />

        <Input
          label="Descripción (opcional)"
          disabled={!isOnline}
          {...register('description')}
        />

        <Input
          label="URL de referencia (opcional)"
          placeholder="https://youtube.com/watch?v=... o https://ejemplo.com/imagen.jpg"
          disabled={!isOnline}
          {...register('url', {
            validate: (value) => {
              if (!value) return true;
              return validateURL(value) || 'URL no válida';
            },
          })}
          error={errors.url?.message}
        />

        {/* Vista previa de URL */}
        {watchedUrl && validateURL(watchedUrl) && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Vista previa
            </label>
            <URLPreview
              url={watchedUrl}
              onClick={() => onPreviewUrl(watchedUrl)}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button type="submit" loading={false} disabled={!isOnline} leftIcon={isEditing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}>
            {isOnline ? 'Crear Ejercicio' : 'Sin conexión'}
          </Button>
          {isEditing && onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingExercise(null);
                setTab('exercises');
              }}
              size="sm"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};
