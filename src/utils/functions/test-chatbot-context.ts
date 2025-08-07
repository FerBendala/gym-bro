import { ExportDataContextService } from '@/api/services/export-data-context-service';

/**
 * Test para verificar que el contexto del chatbot funciona correctamente
 */
export const testChatbotContext = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    console.log('🧪 Iniciando test del contexto del chatbot...');

    // Obtener contexto del usuario
    const context = await ExportDataContextService.getUserContext();
    console.log('✅ Contexto obtenido:', context);

    // Generar resumen del contexto
    const summary = ExportDataContextService.generateContextSummary(context);
    console.log('✅ Resumen generado:', summary);

    // Verificar que el contexto tiene la estructura esperada
    const { exportData } = context;

    if (!exportData) {
      return {
        success: false,
        message: 'Error: exportData no está definido'
      };
    }

    // Verificar campos obligatorios
    const requiredFields = ['metadata', 'trainingDays', 'exercisesEvolution', 'muscleGroupAnalysis', 'performanceBalance'];
    const missingFields = requiredFields.filter(field => !exportData[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Error: Faltan campos obligatorios: ${missingFields.join(', ')}`
      };
    }

    // Verificar datos básicos
    const metadata = exportData.metadata;
    console.log('📊 Metadata:', {
      totalExercises: metadata.totalExercises,
      totalWorkouts: metadata.totalWorkouts,
      totalVolume: metadata.totalVolume,
      dateRange: metadata.dateRange
    });

    // Verificar entrenamientos recientes
    const recentWorkouts = exportData.trainingDays.filter((day: any) => day.totalWorkouts > 0);
    console.log('📅 Días con entrenamientos:', recentWorkouts.length);

    // Verificar ejercicios
    const exercises = exportData.exercisesEvolution;
    console.log('🏋️ Ejercicios disponibles:', exercises.length);

    return {
      success: true,
      message: `Contexto cargado correctamente. ${metadata.totalWorkouts} entrenamientos, ${metadata.totalExercises} ejercicios, ${recentWorkouts.length} días con entrenamientos`,
      data: {
        totalWorkouts: metadata.totalWorkouts,
        totalExercises: metadata.totalExercises,
        daysWithWorkouts: recentWorkouts.length,
        summary: summary.substring(0, 500) + '...' // Primeros 500 caracteres
      }
    };

  } catch (error) {
    console.error('❌ Error en test del contexto:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
};

/**
 * Ejecuta el test del contexto del chatbot
 */
export const runChatbotContextTest = async (): Promise<void> => {
  console.log('🚀 Ejecutando test del contexto del chatbot...');

  const result = await testChatbotContext();

  if (result.success) {
    console.log('✅ Test del contexto exitoso:', result.message);
    console.log('📊 Datos del contexto:', result.data);
  } else {
    console.log('❌ Test del contexto falló:', result.message);
  }
}; 