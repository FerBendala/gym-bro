import { Calendar, Clock, Dumbbell, Edit, Filter, Search, Target, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { deleteWorkoutRecord, getExercises, getWorkoutRecords, updateWorkoutRecord } from '../../../api/database';
import { Button } from '../../../components/button';
import { Card, CardContent } from '../../../components/card';
import { DatePicker } from '../../../components/date-picker';
import { Input } from '../../../components/input';
import { LoadingSpinner } from '../../../components/loading-spinner';
import { ModernPage, ModernSection } from '../../../components/modern-ui';
import { Select } from '../../../components/select';
import { EXERCISE_CATEGORIES, getCategoryColor, getCategoryIcon } from '../../../constants/exercise-categories';
import { useNotification } from '../../../context/notification-context';
import type { Exercise, WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';

/**
 * Página del historial de entrenamientos con filtros avanzados y edición
 * Adaptada con el diseño visual del balance muscular de referencia
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
  const [editIndividualSets, setEditIndividualSets] = useState<{ weight: number; reps: number }[]>([]);
  const [editMode, setEditMode] = useState<'simple' | 'advanced'>('simple');

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

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' ||
      selectedExercise !== 'all' ||
      selectedCategory !== 'all' ||
      dateFrom !== undefined ||
      dateTo !== undefined;
  }, [searchTerm, selectedExercise, selectedCategory, dateFrom, dateTo]);

  // Records para mostrar (con límite condicional)
  const displayRecords = useMemo(() => {
    if (hasActiveFilters) {
      // Si hay filtros, mostrar todos los resultados
      return filteredAndSortedRecords;
    } else {
      // Si no hay filtros, limitar a 20
      return filteredAndSortedRecords.slice(0, 20);
    }
  }, [filteredAndSortedRecords, hasActiveFilters]);

  // Estadísticas del historial filtrado
  const stats = useMemo(() => {
    if (displayRecords.length === 0) {
      return { total: 0, totalVolume: 0, avgWeight: 0, exercises: 0 };
    }

    const totalVolume = displayRecords.reduce((sum, record) =>
      sum + (record.weight * record.reps * record.sets), 0
    );

    const avgWeight = displayRecords.reduce((sum, record) =>
      sum + record.weight, 0
    ) / displayRecords.length;

    const uniqueExercises = new Set(displayRecords.map(r => r.exerciseId)).size;

    return {
      total: displayRecords.length,
      totalVolume,
      avgWeight,
      exercises: uniqueExercises
    };
  }, [displayRecords]);

  // Iniciar edición
  const startEditing = (record: WorkoutRecord) => {
    setEditingRecord(record);
    setEditWeight(record.weight);
    setEditReps(record.reps);
    setEditSets(record.sets);
    setEditDate(record.date);

    // Detectar si tiene series individuales
    const hasIndividualSets = record.individualSets && record.individualSets.length > 0;

    if (hasIndividualSets) {
      setEditMode('advanced');
      setEditIndividualSets(record.individualSets!.map(set => ({
        weight: set.weight,
        reps: set.reps
      })));
    } else {
      setEditMode('simple');
      setEditIndividualSets([]);
    }
  };

  // Guardar edición
  const saveEdit = async () => {
    if (!editingRecord) return;

    try {
      let updatedRecord;

      if (editMode === 'advanced' && editIndividualSets.length > 0) {
        // Modo avanzado: calcular datos agregados desde las series individuales
        const totalSets = editIndividualSets.length;
        const totalReps = editIndividualSets.reduce((sum, set) => sum + set.reps, 0);
        const avgReps = Math.round(totalReps / totalSets);
        const avgWeight = editIndividualSets.reduce((sum, set) => sum + set.weight, 0) / totalSets;

        updatedRecord = {
          ...editingRecord,
          weight: avgWeight,
          reps: avgReps,
          sets: totalSets,
          date: editDate,
          individualSets: editIndividualSets
        };
      } else {
        // Modo simple: usar datos agregados
        updatedRecord = {
          ...editingRecord,
          weight: editWeight,
          reps: editReps,
          sets: editSets,
          date: editDate
        };
        // Omitir individualSets completamente en lugar de undefined para Firebase
        delete updatedRecord.individualSets;
      }

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
    setEditIndividualSets([]);
    setEditMode('simple');
  };

  // Cambiar modo de edición
  const handleModeChange = (mode: 'simple' | 'advanced') => {
    setEditMode(mode);

    if (mode === 'advanced' && editIndividualSets.length === 0) {
      // Si cambia a modo avanzado y no tiene series, crear series basadas en los datos simples
      const series = [];
      for (let i = 0; i < editSets; i++) {
        series.push({ weight: editWeight, reps: editReps });
      }
      setEditIndividualSets(series);
    } else if (mode === 'simple' && editIndividualSets.length > 0) {
      // Si cambia a modo simple, calcular promedios de las series individuales
      const totalSets = editIndividualSets.length;
      const totalReps = editIndividualSets.reduce((sum, set) => sum + set.reps, 0);
      const avgReps = Math.round(totalReps / totalSets);
      const avgWeight = editIndividualSets.reduce((sum, set) => sum + set.weight, 0) / totalSets;

      setEditWeight(avgWeight);
      setEditReps(avgReps);
      setEditSets(totalSets);
    }
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
      {/* Filtros mejorados con diseño visual */}
      <ModernSection>
        {/* Resumen de filtros activos */}
        {hasActiveFilters && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Filter className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-300">Filtros activos</h3>
                  <p className="text-xs text-blue-400">
                    Mostrando {displayRecords.length} de {records.length} entrenamientos
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedExercise('all');
                  setSelectedCategory('all');
                  setDateFrom(undefined);
                  setDateTo(undefined);
                }}
                variant="secondary"
                size="sm"
                className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpiar todos
              </Button>
            </div>
          </div>
        )}

        {/* Cards de filtros organizados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Card de Búsqueda y Selección */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/30 hover:border-gray-600/50 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Search className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Buscar y Filtrar</h3>
              </div>

              <div className="space-y-4">
                {/* Búsqueda */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Buscar por nombre de ejercicio
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej: press banca, sentadillas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-gray-600/50 focus:border-blue-500 focus:bg-gray-700"
                  />
                </div>

                {/* Ejercicio específico */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Ejercicio específico
                  </label>
                  <Select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    options={[
                      { value: 'all', label: 'Todos los ejercicios' },
                      ...exercises.map(ex => ({ value: ex.id, label: ex.name }))
                    ]}
                    className="border-gray-600/50 focus:border-purple-500"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Categoría muscular
                  </label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    options={[
                      { value: 'all', label: 'Todas las categorías' },
                      ...EXERCISE_CATEGORIES.map(cat => ({
                        value: cat,
                        label: cat
                      }))
                    ]}
                    className="border-gray-600/50 focus:border-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Fechas y Ordenamiento */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/30 hover:border-gray-600/50 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-600/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Fechas y Ordenamiento</h3>
              </div>

              <div className="space-y-4">
                {/* Rango de fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Desde
                    </label>
                    <DatePicker
                      value={dateFrom}
                      onChange={setDateFrom}
                      className="border-gray-600/50 focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Hasta
                    </label>
                    <DatePicker
                      value={dateTo}
                      onChange={setDateTo}
                      className="border-gray-600/50 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Ordenamiento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Ordenar por
                    </label>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      options={[
                        { value: 'date', label: '📅 Fecha' },
                        { value: 'exercise', label: '🏋️ Ejercicio' },
                        { value: 'weight', label: '⚖️ Peso' },
                        { value: 'volume', label: '📊 Volumen' }
                      ]}
                      className="border-gray-600/50 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center">
                      {sortOrder === 'desc' ? <TrendingDown className="w-4 h-4 mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                      Orden
                    </label>
                    <Select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      options={[
                        { value: 'desc', label: '⬇️ Descendente' },
                        { value: 'asc', label: '⬆️ Ascendente' }
                      ]}
                      className="border-gray-600/50 focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Accesos rápidos de fechas */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Filtros rápidos
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const today = new Date();
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        setDateFrom(weekAgo);
                        setDateTo(today);
                      }}
                      className="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg text-xs hover:bg-blue-600/30 transition-colors border border-blue-500/30"
                    >
                      📅 Última semana
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        setDateFrom(monthAgo);
                        setDateTo(today);
                      }}
                      className="px-3 py-2 bg-green-600/20 text-green-300 rounded-lg text-xs hover:bg-green-600/30 transition-colors border border-green-500/30"
                    >
                      📆 Último mes
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ModernSection>

      {/* Lista de entrenamientos con diseño del balance muscular */}
      <ModernSection>
        <Card>
          <CardContent>
            {displayRecords.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  {hasActiveFilters ? 'No se encontraron entrenamientos' : 'No hay entrenamientos registrados'}
                </h3>
                <p className="text-gray-500">
                  {hasActiveFilters ? 'Ajusta los filtros para ver más resultados' : 'Comienza a registrar entrenamientos para ver tu historial'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayRecords.map((record) => {
                  const primaryCategory = record.exercise?.categories?.[0] || 'Pecho';
                  const Icon = getCategoryIcon(primaryCategory);
                  const colorGradient = getCategoryColor(primaryCategory);
                  const volume = record.weight * record.reps * record.sets;

                  if (editingRecord?.id === record.id) {
                    // Modo edición
                    return (
                      <div
                        key={record.id}
                        className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-blue-500/30 shadow-lg"
                      >
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Edit className="w-5 h-5 mr-2" />
                          Editando: {record.exercise?.name}
                        </h4>

                        {/* Selector de modo */}
                        <div className="mb-4">
                          <label className="text-sm text-gray-400 mb-2 block">Modo de edición</label>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleModeChange('simple')}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${editMode === 'simple'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                              Simple
                            </button>
                            <button
                              onClick={() => handleModeChange('advanced')}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${editMode === 'advanced'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                              Series individuales
                            </button>
                          </div>
                        </div>

                        {editMode === 'simple' ? (
                          /* Modo simple */
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <label className="text-sm text-gray-400">Peso (kg)</label>
                              <Input
                                type="number"
                                value={editWeight}
                                onChange={(e) => setEditWeight(Number(e.target.value))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-400">Repeticiones</label>
                              <Input
                                type="number"
                                value={editReps}
                                onChange={(e) => setEditReps(Number(e.target.value))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-400">Series</label>
                              <Input
                                type="number"
                                value={editSets}
                                onChange={(e) => setEditSets(Number(e.target.value))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-400">Fecha</label>
                              <Input
                                type="date"
                                value={editDate.toISOString().split('T')[0]}
                                onChange={(e) => setEditDate(new Date(e.target.value))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        ) : (
                          /* Modo avanzado - Series individuales */
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm text-gray-400">Series individuales</label>
                              <button
                                onClick={() => setEditIndividualSets([...editIndividualSets, { weight: 0, reps: 0 }])}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                              >
                                + Añadir serie
                              </button>
                            </div>

                            <div className="space-y-2 mb-4">
                              {editIndividualSets.map((set, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2 p-3 rounded-lg">
                                  <div>
                                    <label className="text-xs text-gray-400">Peso (kg)</label>
                                    <Input
                                      type="number"
                                      value={set.weight}
                                      onChange={(e) => {
                                        const newSets = [...editIndividualSets];
                                        newSets[index].weight = Number(e.target.value);
                                        setEditIndividualSets(newSets);
                                      }}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-400">Repeticiones</label>
                                    <Input
                                      type="number"
                                      value={set.reps}
                                      onChange={(e) => {
                                        const newSets = [...editIndividualSets];
                                        newSets[index].reps = Number(e.target.value);
                                        setEditIndividualSets(newSets);
                                      }}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <button
                                      onClick={() => setEditIndividualSets(editIndividualSets.filter((_, i) => i !== index))}
                                      className="w-full px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4 mx-auto" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm text-gray-400">Fecha</label>
                                <Input
                                  type="date"
                                  value={editDate.toISOString().split('T')[0]}
                                  onChange={(e) => setEditDate(new Date(e.target.value))}
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>Series: {editIndividualSets.length}</span>
                                <span>Reps totales: {editIndividualSets.reduce((sum, set) => sum + set.reps, 0)}</span>
                                <span>Volumen: {formatNumber(editIndividualSets.reduce((sum, set) => sum + (set.weight * set.reps), 0))} kg</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end space-x-2">
                          <Button onClick={cancelEdit} variant="secondary" size="sm">
                            Cancelar
                          </Button>
                          <Button onClick={saveEdit} variant="primary" size="sm">
                            Guardar
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  // Detectar si tiene series individuales
                  const hasIndividualSets = record.individualSets && record.individualSets.length > 0;

                  // Calcular estadísticas reales basadas en series individuales o datos agregados
                  const actualStats = hasIndividualSets ? {
                    totalSets: record.individualSets!.length,
                    totalReps: record.individualSets!.reduce((sum, set) => sum + set.reps, 0),
                    totalVolume: record.individualSets!.reduce((sum, set) => sum + (set.weight * set.reps), 0),
                    avgWeight: record.individualSets!.reduce((sum, set) => sum + set.weight, 0) / record.individualSets!.length,
                    maxWeight: Math.max(...record.individualSets!.map(set => set.weight)),
                    minWeight: Math.min(...record.individualSets!.map(set => set.weight))
                  } : {
                    totalSets: record.sets,
                    totalReps: record.reps * record.sets,
                    totalVolume: volume,
                    avgWeight: record.weight,
                    maxWeight: record.weight,
                    minWeight: record.weight
                  };

                  // Modo visualización normal con diseño del balance muscular
                  return (
                    <div
                      key={record.id}
                      className={`relative p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 hover:shadow-xl`}
                    >
                      {/* Indicador visual de categoría */}
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorGradient}`} />

                      {/* Header con icono y información del ejercicio */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorGradient} shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-white truncate mb-1">
                              {record.exercise?.name || 'Ejercicio desconocido'}
                            </h4>

                            {/* Categorías con diseño mejorado */}
                            {record.exercise?.categories && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {record.exercise.categories.map((category) => {
                                  const CategoryIcon = getCategoryIcon(category);
                                  const categoryGradient = getCategoryColor(category);

                                  return (
                                    <span
                                      key={category}
                                      className={`inline-flex items-center space-x-1 text-xs text-white bg-gradient-to-r ${categoryGradient} px-2 py-1 rounded-full font-medium shadow-sm border border-white/20`}
                                    >
                                      <CategoryIcon className="w-3 h-3" />
                                      <span>{category}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{record.date.toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => startEditing(record)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                            title="Editar entrenamiento"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                            title="Eliminar entrenamiento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Métricas principales */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-white">
                            {hasIndividualSets ?
                              `${formatNumber(actualStats.minWeight)}-${formatNumber(actualStats.maxWeight)}` :
                              formatNumber(actualStats.avgWeight)
                            } kg
                          </p>
                          <p className="text-xs text-gray-400">
                            {hasIndividualSets ? 'Peso (min-max)' : 'Peso'}
                          </p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-white">
                            {actualStats.totalReps}
                          </p>
                          <p className="text-xs text-gray-400">Reps totales</p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-white">
                            {actualStats.totalSets}
                          </p>
                          <p className="text-xs text-gray-400">Series</p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-green-400">
                            {formatNumber(actualStats.totalVolume)} kg
                          </p>
                          <p className="text-xs text-gray-400">Volumen</p>
                        </div>
                      </div>

                      {/* Series individuales detalladas */}
                      {hasIndividualSets && (
                        <div className="mb-4">
                          <div className="flex items-center mb-3">
                            <Clock className="w-4 h-4 text-blue-400 mr-2" />
                            <h5 className="text-sm font-medium text-blue-300">Series realizadas</h5>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {record.individualSets!.map((set, index) => (
                              <div
                                key={index}
                                className="rounded-lg p-3 border border-gray-600/30"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-400">Serie {index + 1}</span>
                                  <span className="text-xs text-gray-400">
                                    {formatNumber(set.weight * set.reps)} kg
                                  </span>
                                </div>
                                <div className="text-sm text-white font-medium">
                                  {formatNumber(set.weight)} kg × {set.reps} reps
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Indicador de cantidad limitada */}
            {!hasActiveFilters && filteredAndSortedRecords.length > 20 && (
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg text-center">
                <p className="text-sm text-blue-300">
                  Mostrando los 20 entrenamientos más recientes de {filteredAndSortedRecords.length} totales.
                  Usa los filtros para buscar entrenamientos específicos.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </ModernSection>
    </ModernPage>
  );
}; 