import {
  createExercise,
  updateExercise
} from '@/api/services';
import { EXERCISE_CATEGORIES } from '@/constants';
import { useExerciseForm } from '@/hooks';
import type { Exercise } from '@/interfaces';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';
import { useNotification } from '@/stores/notification';
import { Plus, Save, XCircle } from 'lucide-react';
import React from 'react';
import { Button } from '../../button';
import { Card, CardContent, CardHeader } from '../../card';
import { Input } from '../../input';
import { MultiSelect } from '../../multi-select';
import { URLPreview } from '../../url-preview';
import type { ExerciseFormData } from '../types';

interface ExerciseFormProps {
  exercise?: Exercise;
  onCancel?: () => void;
  onPreviewUrl: (url: string) => void;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  exercise,
  onCancel,
  onPreviewUrl
}) => {
  const isOnline = useOnlineStatus();
  const { showNotification } = useNotification();

  // Usar selectores específicos para acceder al estado correctamente
  const editingExercise = useAdminStore((state) => state.adminPanel.editingExercise);
  const setEditingExercise = useAdminStore((state) => state.setEditingExercise);
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
        url: data.url?.trim() || undefined
      };

      if (editingExercise) {
        // Actualizar ejercicio existente
        await updateExercise(editingExercise.id, exerciseData);
        updateExerciseInStore(editingExercise.id, exerciseData);
        showNotification(`Ejercicio "${data.name}" actualizado exitosamente`, 'success');
        setEditingExercise(null);
      } else {
        // Crear nuevo ejercicio
        const exerciseId = await createExercise(exerciseData);
        const newExercise: Exercise = {
          id: exerciseId,
          ...exerciseData
        };
        addExercise(newExercise);
        showNotification(`Ejercicio "${data.name}" creado exitosamente`, 'success');
      }
      return true;
    } catch (error: any) {
      const message = error.message || 'Error al guardar el ejercicio';
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
    isEditing,
    validateURL,
    setValue
  } = useExerciseForm({ exercise, onSubmit: handleFormSubmit });

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">
          {isEditing ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio'}
        </h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del ejercicio"
              disabled={!isOnline}
              {...register('name', {
                required: 'El nombre es requerido',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
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
                  }
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
              }
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

          <div className="flex space-x-2">
            <Button type="submit" loading={false} disabled={!isOnline}>
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {isOnline ? 'Crear Ejercicio' : 'Sin conexión'}
                </>
              )}
            </Button>
            {isEditing && onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 