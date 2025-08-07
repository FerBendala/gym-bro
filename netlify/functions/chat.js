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

    // URL de la API externa de chat (configurada para gpt-oss-20b en Hugging Face)
    const CHAT_API_URL = process.env.CHAT_API_URL || 'https://api-inference.huggingface.co/models/openai/gpt-oss-20b';

    // Configuración para el modelo de chat
    const CHAT_CONFIG = {
      model: 'gpt-4o-mini', // Modelo más avanzado disponible en OpenAI API
      max_tokens: 1000,
      temperature: 0.7
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

    // Usar gpt-oss-20b a través de Hugging Face API
    try {
      console.log('🤖 Usando gpt-oss-20b con configuración:', GPT_OSS_CONFIG);

      // Formatear el prompt para gpt-oss-20b con formato Harmony
      const systemPrompt = userContext 
        ? `Eres un experto en fitness y entrenamiento llamado "GymBro". Responde siempre en español de manera completa y detallada. Usa el contexto del usuario para dar respuestas personalizadas. Reasoning: ${GPT_OSS_CONFIG.reasoning_level}. Contexto: ${userContext}`
        : `Eres un experto en fitness y entrenamiento llamado "GymBro". Responde siempre en español de manera completa y detallada. Reasoning: ${GPT_OSS_CONFIG.reasoning_level}.`;

      const harmonyPrompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${message}<|im_end|>\n<|im_start|>assistant\n`;

      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HF_API_KEY || ''}`,
        },
        body: JSON.stringify({
          inputs: harmonyPrompt,
          parameters: {
            max_new_tokens: GPT_OSS_CONFIG.max_tokens,
            temperature: GPT_OSS_CONFIG.temperature,
            do_sample: true,
            return_full_text: false
          }
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

      // Extraer la respuesta del formato de Hugging Face
      let responseText = '';
      if (Array.isArray(data) && data.length > 0) {
        responseText = data[0].generated_text || '';
        // Remover el prompt original y extraer solo la respuesta del asistente
        if (responseText.includes('<|im_start|>assistant\n')) {
          responseText = responseText.split('<|im_start|>assistant\n')[1] || '';
        }
        // Remover cualquier token de fin
        responseText = responseText.replace('<|im_end|>', '').trim();
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: responseText || 'No se pudo generar una respuesta',
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