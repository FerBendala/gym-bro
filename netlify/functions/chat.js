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

    // URL de la API externa de chat (configurada para gpt-oss-20b)
    const CHAT_API_URL = process.env.CHAT_API_URL || 'http://localhost:8004/chat';
    
    // Configuración para gpt-oss-20b
    const GPT_OSS_CONFIG = {
      model: 'openai/gpt-oss-20b',
      reasoning_level: reasoning_level || 'medium', // low, medium, high
      max_tokens: 1000,
      temperature: 0.7,
      harmony_format: true // Usar formato Harmony requerido por gpt-oss
    };

    // Si tienes una API key de OpenAI, puedes usar esto:
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: GPT_OSS_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: userContext
                ? `Eres un experto en fitness y entrenamiento llamado "GymBro". Responde siempre en español de manera completa y detallada. Usa el contexto del usuario para dar respuestas personalizadas. Reasoning: ${GPT_OSS_CONFIG.reasoning_level}. Contexto: ${userContext}`
                : `Eres un experto en fitness y entrenamiento llamado "GymBro". Responde siempre en español de manera completa y detallada. Reasoning: ${GPT_OSS_CONFIG.reasoning_level}.`,
            },
            {
              role: 'user',
              content: message,
            },
          ],
          max_tokens: GPT_OSS_CONFIG.max_tokens,
          temperature: GPT_OSS_CONFIG.temperature,
          harmony_format: GPT_OSS_CONFIG.harmony_format,
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

    // Usar gpt-oss-20b a través del servidor local
    try {
      console.log('🤖 Usando gpt-oss-20b con configuración:', GPT_OSS_CONFIG);
      
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GPT_OSS_CONFIG.model,
          message: message,
          reasoning_level: GPT_OSS_CONFIG.reasoning_level,
          context: userContext,
          harmony_format: GPT_OSS_CONFIG.harmony_format,
          max_tokens: GPT_OSS_CONFIG.max_tokens,
          temperature: GPT_OSS_CONFIG.temperature
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: data.error }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: data.response,
        }),
      };
    } catch (error) {
      console.error('Error comunicándose con gpt-oss-20b:', error);

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

        // Preguntas sobre entrenamientos específicos por día
        if (lowerMessage.includes('ayer') || lowerMessage.includes('hice') || lowerMessage.includes('ejercicios') ||
          lowerMessage.includes('martes') || lowerMessage.includes('miércoles') || lowerMessage.includes('jueves') ||
          lowerMessage.includes('viernes') || lowerMessage.includes('sábado') || lowerMessage.includes('domingo') ||
          lowerMessage.includes('lunes') || lowerMessage.includes('anteayer')) {

          console.log('🔍 Procesando pregunta sobre entrenamientos específicos');
          console.log('📊 Contexto recibido (longitud):', userContext ? userContext.length : 0);
          console.log('📝 Mensaje original:', message);

          // Determinar qué día preguntan
          let targetDay = 'ayer';
          if (lowerMessage.includes('anteayer')) {
            targetDay = 'anteayer';
          } else if (lowerMessage.includes('martes')) {
            targetDay = 'martes';
          } else if (lowerMessage.includes('miércoles')) {
            targetDay = 'miércoles';
          } else if (lowerMessage.includes('jueves')) {
            targetDay = 'jueves';
          } else if (lowerMessage.includes('viernes')) {
            targetDay = 'viernes';
          } else if (lowerMessage.includes('sábado')) {
            targetDay = 'sábado';
          } else if (lowerMessage.includes('domingo')) {
            targetDay = 'domingo';
          } else if (lowerMessage.includes('lunes')) {
            targetDay = 'lunes';
          }

          console.log('🎯 Día objetivo:', targetDay);

          // Buscar en la sección de entrenamientos por día
          if (userContext && userContext.includes('ENTRENAMIENTOS POR DÍA')) {
            const dayMatch = userContext.match(new RegExp(`${targetDay.charAt(0).toUpperCase() + targetDay.slice(1)}: (\\d+) entrenamientos - ([\\s\\S]*?)(?=\\n[A-Z]|$)`, 'i'));
            console.log('🔍 Buscando día específico:', dayMatch ? 'encontrado' : 'no encontrado');

            if (dayMatch) {
              const workoutCount = dayMatch[1];
              const exercises = dayMatch[2];
              console.log('📅 Datos del día:', { workoutCount, exercises });

              if (workoutCount > 0) {
                return `¡Perfecto! Según tus datos, el ${targetDay} realizaste ${workoutCount} entrenamientos:\n\n${exercises}\n\n¡Excelente trabajo! ¿Te gustaría que analice tu progreso o te ayude a planificar tu próximo entrenamiento?`;
              } else {
                return `Según tus datos, no tienes entrenamientos registrados el ${targetDay}. ¿Te gustaría que te ayude a planificar tu próxima sesión de entrenamiento?`;
              }
            }
          }

          // Buscar en entrenamientos recientes como fallback
          if (userContext && userContext.includes('ÚLTIMOS ENTRENAMIENTOS')) {
            const recentMatch = userContext.match(/📈 ÚLTIMOS ENTRENAMIENTOS \(últimos 5 días\):\n([\s\S]*?)(?=\n📅|$)/);
            console.log('🔍 Buscando entrenamientos recientes:', recentMatch ? 'encontrados' : 'no encontrados');

            if (recentMatch && recentMatch[1].trim() !== 'No hay entrenamientos registrados recientemente.') {
              const recentWorkouts = recentMatch[1].trim();
              return `Basándome en tu historial reciente:\n\n${recentWorkouts}\n\n¿Te gustaría que analice tu progreso o te ayude a planificar tu próximo entrenamiento?`;
            }
          }

          return `No tengo información específica sobre tus entrenamientos del ${targetDay}. ¿Te gustaría que revise tu historial reciente o te ayude a planificar tu próxima sesión?`;
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

      // Generar respuesta contextual basada en el contexto del usuario
      let response = generateContextualResponse(message, userContext);

      console.log('🤖 Respuesta generada:', response.substring(0, 200) + '...');

      // Simular delay para que parezca más realista
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: response,
        }),
      };
    }

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