import { Card, CardContent, CardHeader } from '@/components/card';
import { InfoTooltip } from '@/components/tooltip';
import { Activity, Brain, CheckCircle, Info, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { TrendAnalysisChart } from './trend-analysis-chart';


export interface TrendAnalysisSectionProps {
  centralizedMetrics: {
    strengthTrend: number;
    volumeTrend: number;
    monthlyGrowth: number;
    plateauRisk: number;
    confidenceLevel: number;
    trendAnalysis: string;
    nextWeekWeight: number;
  };
  predictionMetrics: {
    dataQuality: {
      validRecords: number;
    };
  };
  analysis: {
    progressPrediction: {
      trendAnalysis: string;
    };
  };
}

export const TrendAnalysisSection: React.FC<TrendAnalysisSectionProps> = ({
  centralizedMetrics,
  predictionMetrics,
  analysis
}) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          Análisis de Tendencia IA
          <InfoTooltip
            content={`Análisis multidimensional basado en ${predictionMetrics.dataQuality.validRecords} registros válidos. El gráfico radar muestra 5 dimensiones clave: tendencias de fuerza y volumen, crecimiento mensual, confianza IA y estabilidad.`}
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header con estado de tendencia */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${analysis.progressPrediction.trendAnalysis === 'mejorando' ? 'from-green-500/80 to-emerald-500/80' :
                analysis.progressPrediction.trendAnalysis === 'estable' ? 'from-blue-500/80 to-cyan-500/80' :
                  analysis.progressPrediction.trendAnalysis === 'empeorando' ? 'from-red-500/80 to-orange-500/80' :
                    'from-gray-500/80 to-gray-600/80'}`}>
                {analysis.progressPrediction.trendAnalysis === 'mejorando' ? (
                  <TrendingUp className="w-5 h-5 text-white" />
                ) : analysis.progressPrediction.trendAnalysis === 'empeorando' ? (
                  <TrendingDown className="w-5 h-5 text-white" />
                ) : (
                  <Activity className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Estado General</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${analysis.progressPrediction.trendAnalysis === 'mejorando' ? 'bg-green-500 text-white' :
                  analysis.progressPrediction.trendAnalysis === 'estable' ? 'bg-blue-500 text-white' :
                    analysis.progressPrediction.trendAnalysis === 'empeorando' ? 'bg-red-500 text-white' :
                      'bg-gray-500 text-white'}`}>
                  {analysis.progressPrediction.trendAnalysis === 'mejorando' ? '📈 MEJORANDO' :
                    analysis.progressPrediction.trendAnalysis === 'estable' ? '➡️ ESTABLE' :
                      analysis.progressPrediction.trendAnalysis === 'empeorando' ? '📉 EMPEORANDO' :
                        '❓ INSUFICIENTE'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-white">
                {centralizedMetrics.nextWeekWeight}kg
              </div>
              <div className="text-xs text-gray-400">próxima semana</div>
            </div>
          </div>

          {/* Gráfico Radar de Tendencia */}
          <div className="relative">
            <TrendAnalysisChart
              strengthTrend={centralizedMetrics.strengthTrend}
              volumeTrend={centralizedMetrics.volumeTrend}
              monthlyGrowthRate={centralizedMetrics.monthlyGrowth}
              plateauRisk={centralizedMetrics.plateauRisk}
              confidenceLevel={centralizedMetrics.confidenceLevel}
              trendAnalysis={centralizedMetrics.trendAnalysis}
            />
          </div>

          {/* 🧠 EXPLICACIÓN DEL ANÁLISIS IA */}
          <div className="p-4 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-semibold text-indigo-200">¿Por qué estos resultados?</h4>
            </div>

            <div className="space-y-3 text-sm text-gray-300">
              {/* Explicación del Estado General */}
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-white">Estado "{centralizedMetrics.trendAnalysis.toUpperCase()}":</span>
                  <span className="ml-1">
                    {centralizedMetrics.trendAnalysis === 'mejorando' ?
                      `Tu tendencia de fuerza (${centralizedMetrics.strengthTrend > 0 ? '+' : ''}${centralizedMetrics.strengthTrend}kg/sem) y volumen (${centralizedMetrics.volumeTrend > 0 ? '+' : ''}${centralizedMetrics.volumeTrend}kg/sem) muestran progreso consistente. La IA detectó patrones de crecimiento sostenible.` :
                      centralizedMetrics.trendAnalysis === 'estable' ?
                        `Tu progreso se mantiene constante. La fuerza (${centralizedMetrics.strengthTrend > 0 ? '+' : ''}${centralizedMetrics.strengthTrend}kg/sem) y volumen muestran estabilidad, lo cual es normal en fases de consolidación o cambios de rutina.` :
                        centralizedMetrics.trendAnalysis === 'empeorando' ?
                          `Se detectaron tendencias negativas en tus métricas. Esto puede deberse a fatiga acumulada, cambios en la rutina, o necesidad de descanso. Considera revisar tu programa.` :
                          'Datos insuficientes para determinar una tendencia clara. Necesitas más entrenamientos consistentes para análisis precisos.'}
                  </span>
                </div>
              </div>

              {/* Explicación de Fuerza */}
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-white">Tendencia de Fuerza ({centralizedMetrics.strengthTrend > 0 ? '+' : ''}{centralizedMetrics.strengthTrend}kg/sem):</span>
                  <span className="ml-1">
                    {centralizedMetrics.strengthTrend > 1.5 ?
                      'Excelente progresión. Tu sistema neuromuscular se adapta eficientemente al estímulo de entrenamiento.' :
                      centralizedMetrics.strengthTrend > 0.5 ?
                        'Progreso sólido y sostenible. Ritmo ideal para ganancias a largo plazo sin sobreentrenamiento.' :
                        centralizedMetrics.strengthTrend > -0.5 ?
                          'Progreso mínimo o estancamiento. Considera variar intensidad, volumen o ejercicios para nuevos estímulos.' :
                          'Declive en fuerza. Puede indicar fatiga, recuperación insuficiente o necesidad de deload/cambio de programa.'
                    }
                  </span>
                </div>
              </div>

              {/* Explicación de Volumen */}
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-white">Tendencia de Volumen ({centralizedMetrics.volumeTrend > 0 ? '+' : ''}{centralizedMetrics.volumeTrend}kg/sem):</span>
                  <span className="ml-1">
                    {centralizedMetrics.volumeTrend > 15 ?
                      'Incremento de volumen muy alto. Asegúrate de que tu recuperación sea adecuada para evitar sobreentrenamiento.' :
                      centralizedMetrics.volumeTrend > 5 ?
                        'Aumento de volumen apropiado. Tu capacidad de trabajo está mejorando gradualmente.' :
                        centralizedMetrics.volumeTrend > -5 ?
                          'Volumen estable. Fase de mantenimiento o consolidación de ganancias previas.' :
                          'Reducción de volumen. Puede ser estratégico (deload) o indicar fatiga/desmotivación.'
                    }
                    <span className="block mt-1 text-xs text-indigo-300">
                      💡 <strong>Normalizado por día:</strong> Esta tendencia compara lunes con lunes, viernes con viernes, etc.
                      Así evitamos confundir días naturalmente bajos (descanso) con días altos (entrenamiento intenso).
                    </span>
                  </span>
                </div>
              </div>

              {/* Explicación de Riesgo de Meseta */}
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-white">Riesgo de Meseta ({centralizedMetrics.plateauRisk}%):</span>
                  <span className="ml-1">
                    {centralizedMetrics.plateauRisk < 30 ?
                      'Bajo riesgo. Tu progreso es variable y adaptativo, señal de buena respuesta al entrenamiento.' :
                      centralizedMetrics.plateauRisk < 60 ?
                        'Riesgo moderado. Algunos patrones repetitivos detectados. Considera variaciones en tu programa.' :
                        'Alto riesgo de estancamiento. La IA detectó patrones muy consistentes que sugieren adaptación completa. Tiempo de cambios significativos.'
                    }
                  </span>
                </div>
              </div>

              {/* Explicación de Confianza */}
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-white">Confianza IA ({centralizedMetrics.confidenceLevel}%):</span>
                  <span className="ml-1">
                    {centralizedMetrics.confidenceLevel >= 80 ?
                      `Muy alta. Con ${predictionMetrics.dataQuality.validRecords} registros válidos y patrones claros, las predicciones son altamente confiables.` :
                      centralizedMetrics.confidenceLevel >= 60 ?
                        `Buena. Suficientes datos para predicciones sólidas, pero más entrenamientos mejorarán la precisión.` :
                        centralizedMetrics.confidenceLevel >= 40 ?
                          `Moderada. Patrones detectados pero datos limitados. Continúa entrenando consistentemente para mejorar precisión.` :
                          `Baja. Datos insuficientes o muy variables. Las predicciones son aproximaciones generales.`
                    }
                  </span>
                </div>
              </div>
              <div>
                <strong className="text-slate-200">📊 Cálculo de Tendencias:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• <strong>Fuerza:</strong> Regresión lineal sobre últimos registros, ponderada por recencia</li>
                  <li>• <strong>Volumen:</strong> ⚡ NORMALIZADO POR DÍA - Compara lunes con lunes, evita sesgo de días altos/bajos</li>
                  <li>• <strong>Crecimiento:</strong> Tendencia semanal × 4.33 (factor mensual promedio)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 💡 RECOMENDACIONES PERSONALIZADAS */}
          <div className="p-4 bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-xl border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-emerald-200">Recomendaciones IA Personalizadas</h4>
            </div>

            <div className="space-y-2 text-sm text-gray-300">
              {/* Recomendaciones basadas en tendencia de fuerza */}
              {centralizedMetrics.strengthTrend > 1.5 && (
                <div className="flex items-start gap-2 p-2 bg-green-900/20 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                  <span><strong className="text-green-200">Mantén el momentum:</strong> Tu progreso en fuerza es excelente. Continúa con tu programa actual y asegúrate de la recuperación adecuada.</span>
                </div>
              )}

              {centralizedMetrics.strengthTrend >= 0.5 && centralizedMetrics.strengthTrend <= 1.5 && (
                <div className="flex items-start gap-2 p-2 bg-blue-900/20 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span><strong className="text-blue-200">Progreso sostenible:</strong> Ritmo ideal. Considera aumentar gradualmente la intensidad o volumen cuando te sientas cómodo.</span>
                </div>
              )}

              {centralizedMetrics.strengthTrend < 0.5 && centralizedMetrics.strengthTrend >= -0.5 && (
                <div className="flex items-start gap-2 p-2 bg-yellow-900/20 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                  <span><strong className="text-yellow-200">Necesitas variación:</strong> Prueba nuevos ejercicios, cambia el rango de repeticiones, o incrementa la frecuencia de entrenamiento.</span>
                </div>
              )}

              {centralizedMetrics.strengthTrend < -0.5 && (
                <div className="flex items-start gap-2 p-2 bg-red-900/20 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                  <span><strong className="text-red-200">Tiempo de descanso:</strong> Considera una semana de deload (50% volumen/intensidad) o evalúa tu recuperación (sueño, nutrición, estrés).</span>
                </div>
              )}

              {/* Recomendaciones basadas en riesgo de meseta */}
              {centralizedMetrics.plateauRisk > 60 && (
                <div className="flex items-start gap-2 p-2 bg-orange-900/20 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0"></div>
                  <span><strong className="text-orange-200">Cambio urgente:</strong> Alto riesgo de meseta. Cambia ejercicios principales, prueba periodización diferente o consulta a un entrenador.</span>
                </div>
              )}

              {/* Recomendaciones basadas en volumen */}
              {centralizedMetrics.volumeTrend > 15 && (
                <div className="flex items-start gap-2 p-2 bg-purple-900/20 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                  <span><strong className="text-purple-200">Monitorea la recuperación:</strong> Incremento de volumen muy alto. Asegúrate de dormir 7-9h, buena nutrición y gestión del estrés.</span>
                </div>
              )}

              {/* Recomendaciones basadas en confianza */}
              {centralizedMetrics.confidenceLevel < 40 && (
                <div className="flex items-start gap-2 p-2 bg-gray-700/30 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <span><strong className="text-gray-200">Más datos necesarios:</strong> Registra entrenamientos más consistentemente para obtener predicciones más precisas de la IA.</span>
                </div>
              )}

              {/* Recomendación general basada en el crecimiento mensual */}
              {centralizedMetrics.monthlyGrowth > 8 && (
                <div className="flex items-start gap-2 p-2 bg-emerald-900/20 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                  <span><strong className="text-emerald-200">¡Excelente!</strong> Tu crecimiento mensual de +{centralizedMetrics.monthlyGrowth}kg es outstanding. Documenta qué estás haciendo bien para mantener este ritmo.</span>
                </div>
              )}
            </div>
          </div>

          {/* Métricas numéricas resumidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-700">
            <div className="text-center p-3 bg-gray-800/30 rounded-lg">
              <div className="text-xs text-gray-400">Fuerza</div>
              <div className={`text-sm font-semibold ${centralizedMetrics.strengthTrend > 0 ? 'text-green-400' :
                centralizedMetrics.strengthTrend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {centralizedMetrics.strengthTrend > 0 ? '+' : ''}{centralizedMetrics.strengthTrend}kg/sem
              </div>
            </div>
            <div className="text-center p-3 bg-gray-800/30 rounded-lg">
              <div className="text-xs text-gray-400">Volumen</div>
              <div className={`text-sm font-semibold ${centralizedMetrics.volumeTrend > 0 ? 'text-blue-400' :
                centralizedMetrics.volumeTrend < 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                {centralizedMetrics.volumeTrend > 0 ? '+' : ''}{centralizedMetrics.volumeTrend}kg/sem
              </div>
            </div>
            <div className="text-center p-3 bg-gray-800/30 rounded-lg">
              <div className="text-xs text-gray-400">Crecimiento</div>
              <div className="text-sm font-semibold text-white">
                +{centralizedMetrics.monthlyGrowth}kg/mes
              </div>
            </div>
            <div className="text-center p-3 bg-gray-800/30 rounded-lg">
              <div className="text-xs text-gray-400">Confianza</div>
              <div className={`text-sm font-semibold ${centralizedMetrics.confidenceLevel >= 70 ? 'text-green-400' :
                centralizedMetrics.confidenceLevel >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {centralizedMetrics.confidenceLevel}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 