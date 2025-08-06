// Función serverless de Netlify para health check

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
    // Solo permitir GET requests
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

                    // Verificar si tenemos las variables de entorno necesarias
                const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
                const hasChatAPI = !!process.env.CHAT_API_URL;

                // En producción, siempre consideramos que el modelo está cargado
                // ya que tenemos respuestas de fallback
                const modelLoaded = true;

                return {
                  statusCode: 200,
                  headers,
                  body: JSON.stringify({
                    status: 'healthy',
                    model_loaded: modelLoaded,
                    mode: hasOpenAIKey ? 'openai' : hasChatAPI ? 'external' : 'mock',
                    model: hasOpenAIKey ? 'gpt-3.5-turbo' : hasChatAPI ? 'external' : 'mock',
                    timestamp: new Date().toISOString(),
                    environment: process.env.NODE_ENV || 'development',
                  }),
                };

  } catch (error) {
    console.error('Error en health check:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'unhealthy',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString(),
      }),
    };
  }
}; 