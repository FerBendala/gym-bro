// Función serverless de Netlify para el chat
// Esta función proporciona respuestas naturales simulando un modelo de lenguaje avanzado

const fetch = require('node-fetch');

// Función para generar respuestas naturales basadas en el contexto
function generateNaturalResponse(message, userContext) {
  const messageLower = message.toLowerCase();
  
  // Analizar el contexto del usuario si está disponible
  let userStats = {};
  if (userContext) {
    try {
      // Extraer estadísticas del contexto
      const contextMatch = userContext.match(/Total de ejercicios: (\d+)/);
      if (contextMatch) userStats.exercises = parseInt(contextMatch[1]);
      
      const workoutsMatch = userContext.match(/Total de entrenamientos: (\d+)/);
      if (workoutsMatch) userStats.workouts = parseInt(workoutsMatch[1]);
      
      const volumeMatch = userContext.match(/Volumen total: ([\d.,]+) kg/);
      if (volumeMatch) userStats.volume = parseFloat(volumeMatch[1].replace(',', ''));
    } catch (e) {
      console.log('Error parsing user context:', e);
    }
  }

  // Respuestas naturales y contextuales
  if (messageLower.includes('hola') || messageLower.includes('buenos días') || messageLower.includes('buenas')) {
    return `¡Hola! Soy GymBro, tu entrenador personal. 

Veo que tienes un historial impresionante de entrenamiento. ¿En qué puedo ayudarte hoy? 

¿Quieres que analicemos tu progreso, te ayude con una nueva rutina, o tienes alguna pregunta específica sobre fitness?`;
  }

  if (messageLower.includes('ejercicio') || messageLower.includes('entrenamiento')) {
    if (userStats.workouts > 100) {
      return `¡Excelente! Veo que ya tienes ${userStats.workouts} entrenamientos registrados. Eso demuestra una gran consistencia.

Para mantener tu progreso, te recomiendo:

1. **Variar la intensidad**: Alterna entre días pesados y ligeros
2. **Progresión gradual**: Aumenta el peso o las repeticiones gradualmente
3. **Recuperación**: Asegúrate de descansar adecuadamente entre sesiones

¿Qué grupo muscular quieres trabajar hoy? ¿O prefieres que analicemos tu progreso en algún ejercicio específico?`;
    } else {
      return `¡Perfecto! Los ejercicios son la base de una vida saludable.

Para maximizar tus resultados, te recomiendo:

1. **Técnica primero**: Siempre prioriza la forma correcta sobre el peso
2. **Progresión constante**: Aumenta gradualmente la intensidad
3. **Consistencia**: Es mejor entrenar 3 veces por semana que 6 veces una semana

¿Qué tipo de entrenamiento te interesa? ¿Fuerza, resistencia, o algo específico?`;
    }
  }

  if (messageLower.includes('progreso') || messageLower.includes('mejorar')) {
    if (userStats.volume > 100000) {
      return `¡Increíble! Has acumulado ${userStats.volume.toLocaleString()} kg de volumen total. Eso es un logro impresionante.

Para continuar mejorando:

1. **Analiza tus puntos débiles**: ¿Qué ejercicios te cuestan más?
2. **Varía tu rutina**: El cuerpo se adapta, necesitas nuevos estímulos
3. **Mantén un diario**: Registra tus progresos para ver el avance

¿Quieres que analicemos algún ejercicio específico o te ayude a diseñar una nueva rutina?`;
    } else {
      return `El progreso en fitness es un viaje, no una carrera. 

Para mejorar de manera sostenible:

1. **Establece metas realistas**: Pequeños objetivos alcanzables
2. **Mide tu progreso**: Peso, repeticiones, tiempo de recuperación
3. **Celebra los logros**: Cada mejora, por pequeña que sea, cuenta

¿En qué área específica quieres mejorar? ¿Fuerza, resistencia, flexibilidad, o composición corporal?`;
    }
  }

  if (messageLower.includes('nutrición') || messageLower.includes('dieta') || messageLower.includes('comida')) {
    return `La nutrición es el 70% del éxito en fitness. 

Principios básicos para optimizar tu alimentación:

1. **Proteína**: 1.6-2.2g por kg de peso corporal para ganar músculo
2. **Carbohidratos**: 3-7g por kg, dependiendo de tu actividad
3. **Grasas saludables**: 0.8-1.2g por kg
4. **Hidratación**: 2-3 litros de agua al día

¿Quieres que te ayude a calcular tus necesidades específicas o tienes alguna pregunta sobre suplementación?`;
  }

  if (messageLower.includes('motivación') || messageLower.includes('ánimo')) {
    return `La motivación es como una batería: se agota y necesita recargarse.

Estrategias para mantener la motivación:

1. **Visualiza tu objetivo**: ¿Cómo te verás en 3 meses?
2. **Encuentra tu "por qué"**: ¿Por qué empezaste a entrenar?
3. **Celebra los pequeños logros**: Cada entrenamiento completado es una victoria
4. **Varía tu rutina**: La monotonía mata la motivación

Recuerda: la disciplina supera a la motivación. ¿Qué te impulsó a empezar este viaje fitness?`;
  }

  if (messageLower.includes('técnica') || messageLower.includes('forma')) {
    return `La técnica correcta es la diferencia entre progreso y lesión.

Principios fundamentales:

1. **Control del movimiento**: Siempre controla el peso, nunca dejes que te controle
2. **Rango completo**: Usa todo el rango de movimiento disponible
3. **Respiración**: Exhala en el esfuerzo, inhala en la fase negativa
4. **Engagement**: Siente el músculo trabajando

¿Hay algún ejercicio específico que te preocupe? ¿O quieres que revisemos la técnica de algún movimiento?`;
  }

  if (messageLower.includes('rutina') || messageLower.includes('programa')) {
    return `Una buena rutina es como un mapa: te guía hacia tus objetivos.

Elementos de una rutina efectiva:

1. **Frecuencia**: 3-5 días por semana para principiantes
2. **Progresión**: Aumenta peso o repeticiones gradualmente
3. **Variedad**: Incluye ejercicios compuestos y de aislamiento
4. **Recuperación**: Planifica días de descanso

¿Cuál es tu objetivo principal? ¿Ganar fuerza, músculo, perder grasa, o mejorar la condición física general?`;
  }

  if (messageLower.includes('descanso') || messageLower.includes('recuperación')) {
    return `El descanso es donde ocurre la magia del crecimiento muscular.

Aspectos importantes de la recuperación:

1. **Sueño**: 7-9 horas de calidad por noche
2. **Nutrición post-entrenamiento**: Proteína y carbohidratos en 30 minutos
3. **Hidratación**: Repone los fluidos perdidos
4. **Estiramientos**: Mejora la flexibilidad y reduce el dolor muscular

¿Cómo te sientes después de tus entrenamientos? ¿Tienes problemas para recuperarte?`;
  }

  if (messageLower.includes('peso') || messageLower.includes('fuerza')) {
    return `La fuerza es la base de todo progreso físico.

Para mejorar tu fuerza:

1. **Enfoque en ejercicios compuestos**: Sentadillas, peso muerto, press de banca
2. **Progresión lineal**: Aumenta el peso gradualmente
3. **Técnica perfecta**: La forma correcta es prioritaria
4. **Descanso adecuado**: 2-3 minutos entre series pesadas

¿En qué ejercicios quieres mejorar tu fuerza? ¿O prefieres que analicemos tu progreso actual?`;
  }

  // Respuesta genérica para preguntas no específicas
  return `¡Excelente pregunta! Como tu entrenador personal, estoy aquí para ayudarte en tu viaje fitness.

Basándome en tu historial de entrenamiento, puedo ayudarte con:

• **Análisis de progreso**: Veo que tienes un buen historial de entrenamientos
• **Optimización de rutinas**: Diseñar programas específicos para tus objetivos
• **Consejos de nutrición**: Maximizar tus resultados con la alimentación correcta
• **Técnica de ejercicios**: Asegurar que cada movimiento sea efectivo y seguro
• **Motivación y mentalidad**: Mantener la consistencia a largo plazo

¿Qué aspecto te gustaría que exploremos juntos? ¿O tienes alguna pregunta específica sobre tu entrenamiento?`;
}

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

    // Generar respuesta natural basada en el contexto
    const response = generateNaturalResponse(message, userContext);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: response,
        model: 'natural-contextual',
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