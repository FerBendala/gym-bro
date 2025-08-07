// Función serverless de Netlify para el chat
// Esta función actúa como proxy hacia la función Python con gpt-oss-20b

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

    // En Netlify Functions, no podemos hacer llamadas HTTP internas entre funciones
    // Por ahora, devolvemos una respuesta de fallback mientras configuramos el modelo Python
    console.log('🤖 Función de chat activada');
    console.log('📝 Mensaje recibido:', message.substring(0, 100) + '...');
    console.log('📊 Contexto recibido (longitud):', userContext ? userContext.length : 0);

    // Respuesta de fallback mientras configuramos el modelo Python
    const fallbackResponse = `¡Hola! Soy GymBro, tu entrenador personal. 

Veo que me has preguntado: "${message}"

Actualmente estoy en modo de configuración mientras se carga mi modelo de IA avanzado. Por favor, intenta de nuevo en unos minutos cuando el sistema esté completamente operativo.

Mientras tanto, puedo ayudarte con algunas preguntas básicas sobre fitness y entrenamiento. ¿En qué puedo asistirte?`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: fallbackResponse,
        model: 'fallback',
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