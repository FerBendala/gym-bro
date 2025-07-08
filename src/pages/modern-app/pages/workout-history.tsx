import { BarChart3, Calendar, Dumbbell, Edit, Filter, Search, Target, Trash2, TrendingUp } from 'lucide-react';
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
        <div className="flex items-center justify-center py-20">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20">
            <LoadingSpinner size="lg" className="mb-6" />
            <p className="text-gray-300 text-lg font-medium">Cargando historial...</p>
          </div>
        </div>
      </ModernPage>
    );
  }

  return (
    <ModernPage
      title="Historial de Entrenamientos"
      subtitle="Gestiona y revisa tus entrenamientos realizados"
    >
      {/* Estadísticas generales con gradientes */}
      <ModernSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl p-6 border border-blue-500/30 backdrop-blur-sm hover:from-blue-500/30 hover:to-blue-600/40 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform">
              {stats.total}
            </p>
            <p className="text-sm text-blue-200">Entrenamientos registrados</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/30 rounded-2xl p-6 border border-green-500/30 backdrop-blur-sm hover:from-green-500/30 hover:to-emerald-600/40 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs font-medium text-green-300 bg-green-500/20 px-2 py-1 rounded-full">
                Volumen
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform">
              {formatNumber(stats.totalVolume)}
            </p>
            <p className="text-sm text-green-200">Kilogramos levantados</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/30 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm hover:from-purple-500/30 hover:to-violet-600/40 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                <Dumbbell className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs font-medium text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
                Promedio
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform">
              {formatNumber(stats.avgWeight)}
            </p>
            <p className="text-sm text-purple-200">Peso promedio (kg)</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/30 rounded-2xl p-6 border border-yellow-500/30 backdrop-blur-sm hover:from-yellow-500/30 hover:to-orange-600/40 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
                <BarChart3 className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-xs font-medium text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded-full">
                Únicos
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform">
              {stats.exercises}
            </p>
            <p className="text-sm text-yellow-200">Ejercicios diferentes</p>
          </div>
        </div>
      </ModernSection>

      {/* Filtros con diseño mejorado */}
      <ModernSection title="Filtros y Búsqueda">
        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Búsqueda por nombre con icono mejorado */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar ejercicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-gray-800/50 border-gray-600/50 focus:border-blue-500/50 focus:bg-gray-800/80 transition-all duration-200"
                />
              </div>

              {/* Selectores con estilos mejorados */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-blue-400" />
                  Ejercicio
                </label>
                <Select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos los ejercicios' },
                    ...exercises.map(ex => ({ value: ex.id, label: ex.name }))
                  ]}
                  className="bg-gray-800/50 border-gray-600/50 focus:border-blue-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  Categoría
                </label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todas las categorías' },
                    ...EXERCISE_CATEGORIES.map(cat => ({ value: cat, label: cat }))
                  ]}
                  className="bg-gray-800/50 border-gray-600/50 focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  Desde
                </label>
                <DatePicker
                  value={dateFrom}
                  onChange={setDateFrom}
                  className="bg-gray-800/50 border-gray-600/50 focus:border-green-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  Hasta
                </label>
                <DatePicker
                  value={dateTo}
                  onChange={setDateTo}
                  className="bg-gray-800/50 border-gray-600/50 focus:border-green-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-yellow-400" />
                  Ordenar por
                </label>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  options={[
                    { value: 'date', label: 'Fecha' },
                    { value: 'exercise', label: 'Ejercicio' },
                    { value: 'weight', label: 'Peso' },
                    { value: 'volume', label: 'Volumen' }
                  ]}
                  className="bg-gray-800/50 border-gray-600/50 focus:border-yellow-500/50"
                />
              </div>
            </div>

            {/* Información de filtros y controles */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-8 pt-6 border-t border-gray-700/50 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Filter className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">
                    Mostrando {filteredAndSortedRecords.length} de {records.length} entrenamientos
                  </p>
                  <p className="text-xs text-gray-500">
                    Volumen filtrado: {formatNumber(stats.totalVolume)} kg
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/50 hover:to-gray-700/50 border-gray-600/50 transition-all duration-200"
              >
                {sortOrder === 'asc' ? '↑ Ascendente' : '↓ Descendente'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </ModernSection>

      {/* Lista de entrenamientos con diseño mejorado */}
      <ModernSection title="Entrenamientos">
        <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/60 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            {filteredAndSortedRecords.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/50 rounded-3xl p-12 max-w-md mx-auto border border-gray-600/30">
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 mb-6 inline-block">
                    <Calendar className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-3">
                    No se encontraron entrenamientos
                  </h3>
                  <p className="text-gray-500 text-lg">
                    Ajusta los filtros o registra nuevos entrenamientos
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedRecords.map((record, index) => (
                  <div
                    key={record.id}
                    className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'fadeInUp 0.5s ease-out forwards'
                    }}
                  >
                    {editingRecord?.id === record.id ? (
                      // Modo edición con diseño mejorado
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/20 rounded-xl">
                              <Edit className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-white">
                                Editando entrenamiento
                              </h4>
                              <p className="text-blue-300 text-sm font-medium">
                                {record.exercise?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={saveEdit}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25"
                            >
                              Guardar
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={cancelEdit}
                              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                              <Dumbbell className="w-4 h-4 text-blue-400" />
                              Peso (kg)
                            </label>
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              value={editWeight}
                              onChange={(e) => setEditWeight(Number(e.target.value))}
                              className="bg-gray-800/50 border-gray-600/50 focus:border-blue-500/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                              <Target className="w-4 h-4 text-green-400" />
                              Repeticiones
                            </label>
                            <Input
                              type="number"
                              min="1"
                              value={editReps}
                              onChange={(e) => setEditReps(Number(e.target.value))}
                              className="bg-gray-800/50 border-gray-600/50 focus:border-green-500/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-purple-400" />
                              Series
                            </label>
                            <Input
                              type="number"
                              min="1"
                              value={editSets}
                              onChange={(e) => setEditSets(Number(e.target.value))}
                              className="bg-gray-800/50 border-gray-600/50 focus:border-purple-500/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-yellow-400" />
                              Fecha
                            </label>
                            <DatePicker
                              value={editDate}
                              onChange={(date) => setEditDate(date || new Date())}
                              className="bg-gray-800/50 border-gray-600/50 focus:border-yellow-500/50"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Modo visualización con diseño mejorado
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                                <Dumbbell className="w-6 h-6 text-blue-400" />
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-white mb-2">
                                  {record.exercise?.name || 'Ejercicio desconocido'}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {record.exercise?.categories?.map((category) => (
                                    <span
                                      key={category}
                                      className="text-xs font-medium text-blue-200 bg-gradient-to-r from-blue-500/20 to-blue-600/30 px-3 py-1 rounded-full border border-blue-500/30"
                                    >
                                      {category}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(record)}
                              className="p-3 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all duration-200 group/btn"
                              title="Editar entrenamiento"
                            >
                              <Edit className="w-4 h-4 text-gray-400 group-hover/btn:text-blue-400 transition-colors" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                              className="p-3 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-200 group/btn"
                              title="Eliminar entrenamiento"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-400 transition-colors" />
                            </Button>
                          </div>
                        </div>

                        {/* Métricas del entrenamiento con iconos */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/50 rounded-xl p-4 border border-gray-600/30">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Fecha</span>
                            </div>
                            <p className="text-white font-bold text-lg">
                              {record.date.toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-xl p-4 border border-blue-500/20">
                            <div className="flex items-center space-x-2 mb-2">
                              <Dumbbell className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-medium text-blue-300 uppercase tracking-wide">Peso</span>
                            </div>
                            <p className="text-white font-bold text-lg">
                              {formatNumber(record.weight)} kg
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-xl p-4 border border-green-500/20">
                            <div className="flex items-center space-x-2 mb-2">
                              <Target className="w-4 h-4 text-green-400" />
                              <span className="text-xs font-medium text-green-300 uppercase tracking-wide">Reps</span>
                            </div>
                            <p className="text-white font-bold text-lg">{record.reps}</p>
                          </div>

                          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-xl p-4 border border-purple-500/20">
                            <div className="flex items-center space-x-2 mb-2">
                              <BarChart3 className="w-4 h-4 text-purple-400" />
                              <span className="text-xs font-medium text-purple-300 uppercase tracking-wide">Series</span>
                            </div>
                            <p className="text-white font-bold text-lg">{record.sets}</p>
                          </div>

                          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-600/20 rounded-xl p-4 border border-yellow-500/20">
                            <div className="flex items-center space-x-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-yellow-400" />
                              <span className="text-xs font-medium text-yellow-300 uppercase tracking-wide">Volumen</span>
                            </div>
                            <p className="text-white font-bold text-lg">
                              {formatNumber(record.weight * record.reps * record.sets)} kg
                            </p>
                          </div>
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

      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ModernPage>
  );
}; 