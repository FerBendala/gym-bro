import { ExportDataContextService } from '@/api/services/export-data-context-service';
import type { WorkoutRecord } from '@/interfaces';
import { analyzeMuscleBalance, calculateBalanceScore, calculateCategoryAnalysis } from '@/utils/functions';

/**
 * Función de prueba para verificar que el chatbot usa el sistema unificado del dashboard
 * @param records - Registros de entrenamiento para probar
 * @returns Resultado de la verificación
 */
export const testChatbotUnifiedSystem = async (records: WorkoutRecord[]) => {
  console.log('🧪 Iniciando prueba del sistema unificado del chatbot...');

  try {
    // 1. Obtener datos del chatbot (que ahora usa el sistema del dashboard)
    console.log('📊 Obteniendo datos del chatbot (sistema unificado)...');
    const chatbotContext = await ExportDataContextService.getUserContext();
    const chatbotData = chatbotContext.exportData;

    // 2. Calcular datos del dashboard directamente
    console.log('📈 Calculando datos del dashboard...');
    const muscleBalance = analyzeMuscleBalance(records);
    const balanceScore = calculateBalanceScore(muscleBalance);
    const categoryAnalysis = calculateCategoryAnalysis(records);

    // 3. Verificar que los datos sean idénticos (sistema unificado)
    console.log('🔍 Verificando sistema unificado...');

    const results = {
      balanceScore: {
        chatbot: chatbotData.performanceBalance.balanceScore.score,
        dashboard: balanceScore,
        match: chatbotData.performanceBalance.balanceScore.score === balanceScore,
      },
      muscleGroups: {
        chatbot: chatbotData.muscleGroupAnalysis.actualPercentages.map((p: any) => ({
          group: p.group,
          percentage: p.actualPercentage,
        })),
        dashboard: muscleBalance.map(b => ({
          group: b.category,
          percentage: b.percentage,
        })),
        match: true, // Se verificará en el loop
      },
      recommendations: {
        chatbot: chatbotData.muscleGroupAnalysis.recommendations.length,
        dashboard: categoryAnalysis.muscleBalance?.length || 0,
        match: chatbotData.muscleGroupAnalysis.recommendations.length === (categoryAnalysis.muscleBalance?.length || 0),
      },
    };

    // Verificar coincidencia perfecta de grupos musculares (sistema unificado)
    const chatbotGroups = new Map(results.muscleGroups.chatbot.map((g: any) => [g.group, g.percentage]));
    const dashboardGroups = new Map(results.muscleGroups.dashboard.map(g => [g.group, g.percentage]));

    let muscleGroupsMatch = true;
    const differences: Array<{ group: string; chatbot: number; dashboard: number; diff: number }> = [];

    for (const [group, dashboardPercentage] of dashboardGroups) {
      const chatbotPercentage = chatbotGroups.get(group) || 0;
      const diff = Math.abs(chatbotPercentage - dashboardPercentage);

      if (diff > 0.01) { // Tolerancia muy baja para sistema unificado
        muscleGroupsMatch = false;
        differences.push({
          group,
          chatbot: chatbotPercentage,
          dashboard: dashboardPercentage,
          diff,
        });
      }
    }

    results.muscleGroups.match = muscleGroupsMatch;

    // 4. Generar reporte del sistema unificado
    const report = {
      success: results.balanceScore.match && results.muscleGroups.match && results.recommendations.match,
      results,
      differences,
      summary: {
        totalTests: 3,
        passedTests: [
          results.balanceScore.match ? 'Balance Score' : null,
          results.muscleGroups.match ? 'Muscle Groups' : null,
          results.recommendations.match ? 'Recommendations' : null,
        ].filter(Boolean).length as number,
        failedTests: [
          !results.balanceScore.match ? 'Balance Score' : null,
          !results.muscleGroups.match ? 'Muscle Groups' : null,
          !results.recommendations.match ? 'Recommendations' : null,
        ].filter(Boolean) as string[],
      },
      systemStatus: 'unified',
    };

    // 5. Logging detallado del sistema unificado
    console.log('📋 Reporte del Sistema Unificado:');
    console.log('✅ Balance Score:', results.balanceScore.match ? 'SISTEMA UNIFICADO' : 'ERROR - NO UNIFICADO');
    console.log('   - Chatbot:', results.balanceScore.chatbot);
    console.log('   - Dashboard:', results.balanceScore.dashboard);

    console.log('✅ Muscle Groups:', results.muscleGroups.match ? 'SISTEMA UNIFICADO' : 'ERROR - NO UNIFICADO');
    if (differences.length > 0) {
      console.log('   - Diferencias encontradas (no deberían existir en sistema unificado):');
      differences.forEach(diff => {
        console.log(`     ${diff.group}: Chatbot ${diff.chatbot.toFixed(1)}% vs Dashboard ${diff.dashboard.toFixed(1)}% (diff: ${diff.diff.toFixed(1)}%)`);
      });
    } else {
      console.log('   - ✅ Todos los grupos musculares coinciden perfectamente');
    }

    console.log('✅ Recommendations:', results.recommendations.match ? 'SISTEMA UNIFICADO' : 'ERROR - NO UNIFICADO');
    console.log('   - Chatbot:', results.recommendations.chatbot);
    console.log('   - Dashboard:', results.recommendations.dashboard);

    console.log(`\n🎯 Resumen del Sistema Unificado: ${report.summary.passedTests}/${report.summary.totalTests} pruebas pasadas`);

    if (report.summary.failedTests.length > 0) {
      console.log('❌ ERROR: Sistema no está completamente unificado:', report.summary.failedTests.join(', '));
    } else {
      console.log('🎉 ¡Sistema completamente unificado! Chatbot y dashboard usan los mismos cálculos.');
    }

    return report;

  } catch (error) {
    console.error('❌ Error en prueba del sistema unificado:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      systemStatus: 'error',
    };
  }
};

/**
 * Función para ejecutar la prueba del sistema unificado
 * @param records - Registros de entrenamiento
 */
export const runChatbotUnifiedTest = async (records: WorkoutRecord[]) => {
  console.log('🚀 Ejecutando prueba del sistema unificado del chatbot...');
  console.log(`📊 Registros a probar: ${records.length}`);

  const result = await testChatbotUnifiedSystem(records);

  if (result.success) {
    console.log('✅ Sistema unificado verificado correctamente');
    console.log('🎯 El chatbot y dashboard usan exactamente los mismos cálculos');
  } else {
    console.log('❌ Se encontraron discrepancias - el sistema no está completamente unificado');
  }

  return result;
}; 