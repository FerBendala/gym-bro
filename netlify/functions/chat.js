// Función serverless de Netlify para el chat
// Esta función actúa como proxy hacia una API externa de chat

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Manejar preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Solo permitir POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

                    // Parsear el body de la request
                const requestBody = JSON.parse(event.body);
                const { message, context: userContext, reasoning_level = 'medium' } = requestBody;

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // URL de la API externa de chat (puedes cambiar esto por tu API)
    const CHAT_API_URL = process.env.CHAT_API_URL || 'https://api.openai.com/v1/chat/completions';

                    // Configuración del prompt con contexto del usuario
                const prompt = userContext 
                  ? `[INST] Eres un experto en fitness y entrenamiento. Responde SOLO EN ESPAÑOL de manera completa y detallada.

CONTEXTO DEL USUARIO:
${userContext}

PREGUNTA: ${message}

IMPORTANTE: Usa el contexto del usuario para dar respuestas personalizadas. Menciona ejercicios específicos que el usuario tiene, sus estadísticas, y adapta tus consejos a su rutina actual. Proporciona una respuesta completa y detallada con explicaciones, consejos prácticos y recomendaciones específicas. Responde únicamente en español y asegúrate de completar todas las ideas. Termina tu respuesta con un punto final. [/INST]`
                  : `[INST] Eres un experto en fitness y entrenamiento. Responde SOLO EN ESPAÑOL de manera completa y detallada.

PREGUNTA: ${message}

Proporciona una respuesta completa y detallada con explicaciones, consejos prácticos y recomendaciones específicas. Responde únicamente en español y asegúrate de completar todas las ideas. Termina tu respuesta con un punto final. [/INST]`;

    // Si tienes una API key de OpenAI, puedes usar esto:
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
                                    {
                          role: 'system',
                          content: userContext 
                            ? `Eres un experto en fitness y entrenamiento. Responde siempre en español de manera completa y detallada. Usa el contexto del usuario para dar respuestas personalizadas: ${userContext}`
                            : 'Eres un experto en fitness y entrenamiento. Responde siempre en español de manera completa y detallada.',
                        },
                        {
                          role: 'user',
                          content: message,
                        },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (data.error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: data.error.message }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: data.choices[0].message.content,
        }),
      };
    }

    // Fallback: Respuesta simulada para desarrollo
    const mockResponses = {
      'hola': '¡Hola! Soy tu asistente de entrenamiento IA. ¿En qué puedo ayudarte hoy?',
      'press de banca': 'Para mejorar tu press de banca, te recomiendo:\n\n1. **Técnica correcta**: Asegúrate de que tu espalda esté bien apoyada en el banco, pies firmes en el suelo, y agarre ligeramente más ancho que los hombros.\n\n2. **Progresión gradual**: Aumenta el peso de forma progresiva, no más del 5-10% por semana.\n\n3. **Ejercicios complementarios**: Incluye press militar, fondos y ejercicios de tríceps.\n\n4. **Descanso adecuado**: Descansa 2-3 minutos entre series para permitir la recuperación muscular.\n\n5. **Frecuencia**: Entrena pecho 2-3 veces por semana con al menos un día de descanso entre sesiones.',
      'sentadillas': 'Para mejorar tus sentadillas:\n\n1. **Posición inicial**: Pies separados al ancho de los hombros, punta de pies ligeramente hacia afuera.\n\n2. **Movimiento**: Baja como si te fueras a sentar, manteniendo el peso en los talones.\n\n3. **Profundidad**: Intenta bajar hasta que tus muslos estén paralelos al suelo.\n\n4. **Respiración**: Inhala al bajar, exhala al subir.\n\n5. **Progresión**: Comienza con sentadillas con peso corporal, luego añade peso gradualmente.',
      'nutrición': 'Para una nutrición óptima en el entrenamiento:\n\n1. **Proteínas**: 1.6-2.2g por kg de peso corporal para ganancia muscular.\n\n2. **Carbohidratos**: 3-7g por kg de peso corporal, más en días de entrenamiento.\n\n3. **Grasas**: 0.8-1.2g por kg de peso corporal.\n\n4. **Hidratación**: 2-3 litros de agua al día, más durante el entrenamiento.\n\n5. **Timing**: Come proteínas y carbohidratos 1-2 horas antes y después del entrenamiento.',
    };

    // Función para generar respuesta basada en el contexto del usuario
    const generateContextualResponse = (message, userContext) => {
      const lowerMessage = message.toLowerCase();
      
      // Preguntas sobre entrenamientos específicos
      if (lowerMessage.includes('ayer') || lowerMessage.includes('hice') || lowerMessage.includes('ejercicios')) {
        if (userContext && userContext.includes('ENTRENAMIENTOS DE HOY') && userContext.includes('No hay entrenamientos registrados hoy')) {
          return 'Según tus datos, no tienes entrenamientos registrados ayer. ¿Te gustaría que te ayude a planificar tu próxima sesión de entrenamiento? Puedo recomendarte ejercicios basados en tu rutina actual.';
        }
        
        if (userContext && userContext.includes('ÚLTIMOS ENTRENAMIENTOS')) {
          const recentWorkoutsMatch = userContext.match(/📈 ÚLTIMOS ENTRENAMIENTOS \(últimos 5\):\n([\s\S]*?)(?=\n  💪|$)/);
          if (recentWorkoutsMatch && recentWorkoutsMatch[1].trim() !== 'No hay entrenamientos recientes') {
            return `Basándome en tu historial reciente:\n\n${recentWorkoutsMatch[1].trim()}\n\n¿Te gustaría que analice tu progreso o te ayude a planificar tu próximo entrenamiento?`;
          }
        }
        
        return 'No tengo información específica sobre tus entrenamientos de ayer. ¿Te gustaría que revise tu historial reciente o te ayude a planificar tu próxima sesión?';
      }
      
      // Preguntas sobre progreso
      if (lowerMessage.includes('progreso') || lowerMessage.includes('mejora') || lowerMessage.includes('evolución')) {
        if (userContext && userContext.includes('Peso promedio')) {
          const avgWeightMatch = userContext.match(/Peso promedio: ([\d.]+) kg/);
          const totalWorkoutsMatch = userContext.match(/Total de entrenamientos: (\d+)/);
          
          if (avgWeightMatch && totalWorkoutsMatch) {
            const avgWeight = avgWeightMatch[1];
            const totalWorkouts = totalWorkoutsMatch[1];
            return `Según tus datos:\n\n• Has completado ${totalWorkouts} entrenamientos\n• Tu peso promedio es ${avgWeight} kg\n• Estás mostrando consistencia en tu entrenamiento\n\n¡Excelente trabajo! ¿Te gustaría que analice áreas específicas de mejora o te ayude a establecer nuevos objetivos?`;
          }
        }
      }
      
      // Preguntas sobre rutina
      if (lowerMessage.includes('rutina') || lowerMessage.includes('programa') || lowerMessage.includes('plan')) {
        if (userContext && userContext.includes('RUTINA SEMANAL')) {
          const routineMatch = userContext.match(/📅 RUTINA SEMANAL \((\d+) días\):\n([\s\S]*?)(?=\n🎯|$)/);
          if (routineMatch && routineMatch[2].trim() !== 'No hay rutina semanal configurada') {
            return `Tu rutina semanal actual:\n\n${routineMatch[2].trim()}\n\n¿Te gustaría que ajuste algún día o añada nuevos ejercicios?`;
          }
        }
      }
      
      // Preguntas sobre ejercicios específicos
      if (userContext && userContext.includes('EJERCICIOS DISPONIBLES')) {
        const exercisesMatch = userContext.match(/🏋️ EJERCICIOS DISPONIBLES \(\d+\):\n([\s\S]*?)(?=\n📅|$)/);
        if (exercisesMatch && exercisesMatch[1].trim() !== 'No hay ejercicios registrados') {
          const exercises = exercisesMatch[1].trim();
          return `Tus ejercicios disponibles:\n\n${exercises}\n\n¿Sobre cuál te gustaría que te dé consejos específicos de técnica o progresión?`;
        }
      }
      
      // Respuesta por defecto con contexto
      return 'Gracias por tu pregunta. Como tu entrenador personal GymBro, puedo ayudarte con:\n\n• Análisis de tu progreso actual\n• Recomendaciones de ejercicios\n• Mejoras en tu técnica\n• Planificación de rutinas\n• Consejos de nutrición y recuperación\n\n¿Hay algún aspecto específico sobre el que te gustaría que profundice?';
    };

    // Buscar respuesta específica o generar respuesta contextual
    let response = generateContextualResponse(message, userContext);

    for (const [key, value] of Object.entries(mockResponses)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        response = value;
        break;
      }
    }

    // Simular delay para que parezca más realista
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: response,
      }),
    };

  } catch (error) {
    console.error('Error en función de chat:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
    };
  }
}; 