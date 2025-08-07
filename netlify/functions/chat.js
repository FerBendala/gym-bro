// Función serverless de Netlify para el chat
// Esta función usa Phi-3 con Hugging Face Inference API

const fetch = require('node-fetch');

// Función para llamar a Phi-3 usando Hugging Face Inference API
async function callPhi3(message, userContext) {
  const HF_API_KEY = process.env.HF_API_KEY;
  
  if (!HF_API_KEY) {
    console.log('⚠️ Hugging Face API key no configurada, usando fallback');
    return null;
  }

  try {
    console.log('🤖 Llamando a Phi-3...');
    
    const systemPrompt = `Eres un entrenador personal experto y motivador llamado "GymBro". 
    Responde siempre en español de manera completa y detallada.
    Usa el contexto del usuario para dar respuestas personalizadas.
    
    Contexto del usuario:
    ${userContext || 'No hay contexto específico disponible.'}
    
    Instrucciones:
    - Responde de manera amigable y motivadora
    - Proporciona consejos prácticos y específicos
    - Usa el contexto del usuario cuando sea relevante
    - Mantén un tono profesional pero cercano
    - Sé conversacional y natural`;

    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `<|system|>
${systemPrompt}
<|user|>
${message}
<|assistant|>`,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta de Phi-3 recibida');
    
    return data[0].generated_text;
  } catch (error) {
    console.error('❌ Error llamando a Phi-3:', error);
    return null;
  }
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

    // Intentar usar Phi-3 primero
    let response = await callPhi3(message, userContext);
    let model = 'phi-3-mini-4k-instruct';

    // Si Phi-3 falla, usar fallback inteligente
    if (!response) {
      console.log('🔄 Usando fallback inteligente');
      response = generateFallbackResponse(message, userContext);
      model = 'fallback-intelligent';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: response,
        model: model,
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