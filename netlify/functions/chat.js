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

      // Fallback: Respuesta simple cuando el modelo no está disponible
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: 'Lo siento, el modelo de IA no está disponible en este momento. Por favor, intenta de nuevo más tarde.',
        }),
      };

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