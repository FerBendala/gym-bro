import { Calendar, Edit, Filter, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { deleteWorkoutRecord, getExercises, getWorkoutRecords, updateWorkoutRecord } from '../../../api/database';
import { Button } from '../../../components/button';
import { Card, CardContent } from '../../../components/card';
import { DatePicker } from '../../../components/date-picker';
import { Input } from '../../../components/input';
import { LoadingSpinner } from '../../../components/loading-spinner';
import { ModernPage, ModernSection } from '../../../components/modern-ui';
import { Select } from '../../../components/select';
import { EXERCISE_CATEGORIES } from '../../../constants/exercise-categories';
import { useNotification } from '../../../context/notification-context';
import type { Exercise, WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';

/**
 * Página del historial de entrenamientos con filtros avanzados y edición
 */
export const WorkoutHistory: React.FC = () => {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<WorkoutRecord | null>(null);
  const { showNotification } = useNotification();

  // Estados de filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'date' | 'exercise' | 'weight' | 'volume'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Estados de edición
  const [editWeight, setEditWeight] = useState(0);
  const [editReps, setEditReps] = useState(0);
  const [editSets, setEditSets] = useState(0);
  const [editDate, setEditDate] = useState<Date>(new Date());

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [workoutRecords, exerciseList] = await Promise.all([
          getWorkoutRecords(),
          getExercises()
        ]);

        // Enriquecer registros con información de ejercicios
        const enrichedRecords = workoutRecords.map(record => ({
          ...record,
          exercise: exerciseList.find(ex => ex.id === record.exerciseId)
        }));

        setRecords(enrichedRecords);
        setExercises(exerciseList);
      } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error al cargar los datos', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showNotification]);

  // Filtrar y ordenar records
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records.filter(record => {
      // Filtro por término de búsqueda
      if (searchTerm && !record.exercise?.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por ejercicio específico
      if (selectedExercise !== 'all' && record.exerciseId !== selectedExercise) {
        return false;
      }

      // Filtro por categoría
      if (selectedCategory !== 'all' && !record.exercise?.categories?.includes(selectedCategory)) {
        return false;
      }

      // Filtro por fecha desde
      if (dateFrom && record.date < dateFrom) {
        return false;
      }

      // Filtro por fecha hasta
      if (dateTo && record.date > dateTo) {
        return false;
      }

      return true;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'exercise':
          comparison = (a.exercise?.name || '').localeCompare(b.exercise?.name || '');
          break;
        case 'weight':
          comparison = a.weight - b.weight;
          break;
        case 'volume':
          comparison = (a.weight * a.reps * a.sets) - (b.weight * b.reps * b.sets);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [records, searchTerm, selectedExercise, selectedCategory, dateFrom, dateTo, sortBy, sortOrder]);

  // Estadísticas del historial filtrado
  const stats = useMemo(() => {
    if (filteredAndSortedRecords.length === 0) {
      return { total: 0, totalVolume: 0, avgWeight: 0, exercises: 0 };
    }

    const totalVolume = filteredAndSortedRecords.reduce((sum, record) =>
      sum + (record.weight * record.reps * record.sets), 0
    );

    const avgWeight = filteredAndSortedRecords.reduce((sum, record) =>
      sum + record.weight, 0
    ) / filteredAndSortedRecords.length;

    const uniqueExercises = new Set(filteredAndSortedRecords.map(r => r.exerciseId)).size;

    return {
      total: filteredAndSortedRecords.length,
      totalVolume,
      avgWeight,
      exercises: uniqueExercises
    };
  }, [filteredAndSortedRecords]);

  // Iniciar edición
  const startEditing = (record: WorkoutRecord) => {
    setEditingRecord(record);
    setEditWeight(record.weight);
    setEditReps(record.reps);
    setEditSets(record.sets);
    setEditDate(record.date);
  };

  // Guardar edición
  const saveEdit = async () => {
    if (!editingRecord) return;

    try {
      const updatedRecord = {
        ...editingRecord,
        weight: editWeight,
        reps: editReps,
        sets: editSets,
        date: editDate
      };

      await updateWorkoutRecord(editingRecord.id, updatedRecord);

      // Actualizar en el estado local
      setRecords(prev => prev.map(r =>
        r.id === editingRecord.id ? updatedRecord : r
      ));

      setEditingRecord(null);
      showNotification('Entrenamiento actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error updating record:', error);
      showNotification('Error al actualizar el entrenamiento', 'error');
    }
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingRecord(null);
  };

  // Eliminar entrenamiento
  const handleDelete = async (recordId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este entrenamiento?')) {
      return;
    }

    try {
      await deleteWorkoutRecord(recordId);
      setRecords(prev => prev.filter(r => r.id !== recordId));
      showNotification('Entrenamiento eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error deleting record:', error);
      showNotification('Error al eliminar el entrenamiento', 'error');
    }
  };

  if (loading) {
    return (
      <ModernPage
        title="Historial de Entrenamientos"
        subtitle="Gestiona y revisa tus entrenamientos realizados"
      >
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-400 text-sm ml-4">Cargando historial...</p>
        </div>
      </ModernPage>
    );
  }

  return (
    <ModernPage
      title="Historial de Entrenamientos"
      subtitle="Gestiona y revisa tus entrenamientos realizados"
    >
      {/* Estadísticas generales */}
      <ModernSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">
                {stats.total}
              </p>
              <p className="text-sm text-gray-400">Entrenamientos</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {formatNumber(stats.totalVolume)} kg
              </p>
              <p className="text-sm text-gray-400">Volumen total</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">
                {formatNumber(stats.avgWeight)} kg
              </p>
              <p className="text-sm text-gray-400">Peso promedio</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {stats.exercises}
              </p>
              <p className="text-sm text-gray-400">Ejercicios únicos</p>
            </CardContent>
          </Card>
        </div>
      </ModernSection>

      {/* Filtros */}
      <ModernSection title="Filtros">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Búsqueda por nombre */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar ejercicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por ejercicio */}
              <Select
                label="Ejercicio"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos los ejercicios' },
                  ...exercises.map(ex => ({ value: ex.id, label: ex.name }))
                ]}
              />

              {/* Filtro por categoría */}
              <Select
                label="Categoría"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: 'all', label: 'Todas las categorías' },
                  ...EXERCISE_CATEGORIES.map(cat => ({ value: cat, label: cat }))
                ]}
              />

              {/* Fecha desde */}
              <DatePicker
                label="Desde"
                value={dateFrom}
                onChange={setDateFrom}
              />

              {/* Fecha hasta */}
              <DatePicker
                label="Hasta"
                value={dateTo}
                onChange={setDateTo}
              />

              {/* Ordenar por */}
              <Select
                label="Ordenar por"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { value: 'date', label: 'Fecha' },
                  { value: 'exercise', label: 'Ejercicio' },
                  { value: 'weight', label: 'Peso' },
                  { value: 'volume', label: 'Volumen' }
                ]}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">
                  Mostrando {filteredAndSortedRecords.length} de {records.length} entrenamientos
                </span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑ Ascendente' : '↓ Descendente'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </ModernSection>

      {/* Lista de entrenamientos */}
      <ModernSection title="Entrenamientos">
        <Card>
          <CardContent>
            {filteredAndSortedRecords.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No se encontraron entrenamientos
                </h3>
                <p className="text-gray-500">
                  Ajusta los filtros o registra nuevos entrenamientos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAndSortedRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    {editingRecord?.id === record.id ? (
                      // Modo edición
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-white">
                            Editando: {record.exercise?.name}
                          </h4>
                          <div className="flex space-x-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={saveEdit}
                            >
                              Guardar
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={cancelEdit}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Input
                            label="Peso (kg)"
                            type="number"
                            step="0.5"
                            min="0"
                            value={editWeight}
                            onChange={(e) => setEditWeight(Number(e.target.value))}
                          />
                          <Input
                            label="Repeticiones"
                            type="number"
                            min="1"
                            value={editReps}
                            onChange={(e) => setEditReps(Number(e.target.value))}
                          />
                          <Input
                            label="Series"
                            type="number"
                            min="1"
                            value={editSets}
                            onChange={(e) => setEditSets(Number(e.target.value))}
                          />
                          <DatePicker
                            label="Fecha"
                            value={editDate}
                            onChange={(date) => setEditDate(date || new Date())}
                          />
                        </div>
                      </div>
                    ) : (
                      // Modo visualización
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="text-lg font-semibold text-white">
                                {record.exercise?.name || 'Ejercicio desconocido'}
                              </h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {record.exercise?.categories?.map((category) => (
                                  <span
                                    key={category}
                                    className="text-xs text-blue-300 bg-blue-500/15 px-2 py-1 rounded-full"
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Fecha:</span>
                              <p className="text-white font-medium">
                                {record.date.toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">Peso:</span>
                              <p className="text-white font-medium">
                                {formatNumber(record.weight)} kg
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">Reps:</span>
                              <p className="text-white font-medium">{record.reps}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Series:</span>
                              <p className="text-white font-medium">{record.sets}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Volumen:</span>
                              <p className="text-green-400 font-medium">
                                {formatNumber(record.weight * record.reps * record.sets)} kg
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(record)}
                            className="p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            className="p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </ModernSection>
    </ModernPage>
  );
}; 