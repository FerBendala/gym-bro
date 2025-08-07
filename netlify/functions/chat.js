// Función serverless de Netlify para el chat
// Esta función proporciona respuestas inteligentes basadas en palabras clave

const fetch = require('node-fetch');

// Función de fallback inteligente basada en palabras clave
function generateFallbackResponse(message, userContext) {
  const messageLower = message.toLowerCase();
  
  // Respuestas predefinidas basadas en palabras clave
  const responses = {
    'hola': '¡Hola! Soy GymBro, tu entrenador personal. ¿En qué puedo ayudarte hoy?',
    'ejercicio': 'Los ejercicios son fundamentales para tu salud. ¿Qué tipo de entrenamiento te interesa?',
    'peso': 'El control del peso es importante. ¿Te refieres a peso corporal o peso en ejercicios?',
    'nutrición': 'La nutrición es clave para tus resultados. ¿Qué aspecto específico te interesa?',
    'motivación': 'La motivación es esencial. Recuerda que cada entrenamiento te acerca a tus metas.',
    'técnica': 'La técnica correcta es crucial para evitar lesiones y maximizar resultados.',
    'rutina': 'Una buena rutina es la base del progreso. ¿Qué objetivos tienes?',
    'salud': 'Tu salud es lo más importante. ¿Hay algo específico que te preocupe?',
    'bienestar': 'El bienestar integral incluye ejercicio, nutrición y descanso.',
    'entrenamiento': 'El entrenamiento consistente es la clave del éxito. ¿Qué te gustaría mejorar?',
    'fuerza': 'La fuerza es fundamental. ¿Quieres mejorar tu fuerza general o específica?',
    'resistencia': 'La resistencia cardiovascular es clave. ¿Te interesa cardio o resistencia muscular?',
    'flexibilidad': 'La flexibilidad mejora el rendimiento y previene lesiones. ¿Quieres estiramientos específicos?',
    'descanso': 'El descanso es tan importante como el entrenamiento. ¿Necesitas consejos sobre recuperación?',
    'progreso': 'El progreso requiere consistencia y paciencia. ¿Quieres evaluar tu progreso actual?'
  };
  
  // Buscar palabras clave en el mensaje
  for (const [keyword, response] of Object.entries(responses)) {
    if (messageLower.includes(keyword)) {
      return response;
    }
  }
  
  // Respuesta genérica si no se encuentra ninguna palabra clave
  return `¡Hola! Soy GymBro, tu entrenador personal.

Veo que me has preguntado: "${message}"

Actualmente estoy en modo de configuración mientras se carga mi modelo de IA avanzado. Por favor, intenta de nuevo en unos minutos cuando el sistema esté completamente operativo.

Mientras tanto, puedo ayudarte con preguntas básicas sobre:
- Ejercicios y técnicas
- Nutrición y alimentación
- Motivación y mentalidad
- Rutinas de entrenamiento
- Salud y bienestar
- Fuerza y resistencia
- Flexibilidad y descanso

¿En qué puedo asistirte?`;
}

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

    console.log('🤖 Función de chat activada');
    console.log('📝 Mensaje recibido:', message.substring(0, 100) + '...');
    console.log('📊 Contexto recibido (longitud):', userContext ? userContext.length : 0);

    // Generar respuesta inteligente basada en palabras clave
    const response = generateFallbackResponse(message, userContext);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: response,
        model: 'fallback-intelligent',
        reasoning_level: reasoning_level
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