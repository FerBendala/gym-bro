import { Plus, Save, XCircle } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { EXERCISE_CATEGORIES } from '../../../constants';
import type { Exercise } from '../../../interfaces';
import { validateURL } from '../../../utils/functions/url-validation';
import { Button } from '../../button';
import { Card, CardContent, CardHeader } from '../../card';
import { Input } from '../../input';
import { Select } from '../../select';
import { URLPreview } from '../../url-preview';
import type { ExerciseFormData } from '../types';

interface ExerciseFormProps {
  isOnline: boolean;
  loading: boolean;
  onSubmit: (data: ExerciseFormData) => Promise<boolean>;
  exercise?: Exercise;
  onCancel?: () => void;
  onPreviewUrl: (url: string) => void;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  isOnline,
  loading,
  onSubmit,
  exercise,
  onCancel,
  onPreviewUrl
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ExerciseFormData>({
    mode: 'onChange',
    defaultValues: {
      name: exercise?.name || '',
      category: exercise?.category || EXERCISE_CATEGORIES[0],
      description: exercise?.description || '',
      url: exercise?.url || ''
    }
  });

  const watchedUrl = watch('url');
  const isEditing = !!exercise;

  const handleFormSubmit = async (data: ExerciseFormData) => {
    if (data.url && !validateURL(data.url)) {
      return;
    }

    const success = await onSubmit(data);
    if (success && !isEditing) {
      reset();
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">
          {isEditing ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio'}
        </h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
            <Select
              label="Categoría"
              disabled={!isOnline}
              options={EXERCISE_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              {...register('category', { required: 'La categoría es requerida' })}
              error={errors.category?.message}
            />
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
            <Button type="submit" loading={loading} disabled={!isOnline}>
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