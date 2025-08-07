import { ExportDataContextService } from '@/api/services/export-data-context-service';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ChatAssistantProps {
  className?: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  className = '',
}) => {
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'assistant', content: string }>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userContext, setUserContext] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const fullResponseRef = useRef<string>('');
  const currentIndexRef = useRef<number>(0);

  const checkConnection = useCallback(async () => {
    try {
      console.log('🔍 Verificando conexión...');

      // Determinar la URL del health check según el entorno
      const isDevelopment = import.meta.env.DEV;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const healthUrl = (isDevelopment && isLocalhost)
        ? 'http://localhost:8004/health'
        : '/api/health';

      console.log('🌐 URL de health check:', healthUrl);
      const response = await fetch(healthUrl);
      const data = await response.json();
      console.log('✅ Conexión:', data);
      setIsConnected(data.status === 'healthy' && data.model_loaded);
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setIsConnected(false);
    }
  }, []);

  // Cargar contexto del usuario al iniciar
  const loadUserContext = useCallback(async () => {
    try {
      const context = await ExportDataContextService.getUserContext();
      console.log('🔍 Contexto obtenido:', context);

      const contextSummary = ExportDataContextService.generateContextSummary(context);
      console.log('📋 Resumen del contexto generado:', contextSummary.substring(0, 500) + '...');

      // Crear un contexto más amplio para un entrenador personal
      const trainerContext = `Eres un entrenador personal experto y motivador. Tu nombre es "GymBro" y puedes responder a cualquier pregunta relacionada con fitness, nutrición, motivación, técnica de ejercicios, rutinas de entrenamiento, consejos de salud, y cualquier tema relacionado con el bienestar físico y mental.

Contexto del usuario: ${contextSummary}

Instrucciones importantes:
- Responde de forma amigable y motivadora
- Puedes responder a cualquier pregunta, no solo sobre entrenamientos
- Si te preguntan tu nombre, di que eres "GymBro"
- Si te preguntan sobre entrenamientos específicos, usa el contexto del usuario
- Si no hay datos de entrenamientos (totalWorkouts = 0), di amablemente que no hay registros de entrenamientos aún y ofrece ayuda para empezar
- Si hay datos de entrenamientos, proporciona información específica sobre fechas, ejercicios, pesos, etc.
- Para preguntas sobre "ayer", busca en la sección "ENTRENAMIENTOS DE AYER" del contexto
- Para preguntas sobre entrenamientos recientes, usa la sección "ÚLTIMOS ENTRENAMIENTOS"
- Para preguntas sobre rutina semanal, usa la sección "RUTINA SEMANAL"
- Siempre proporciona información específica cuando esté disponible en el contexto
- Sé positivo y alentador en tus respuestas
- Puedes dar consejos sobre nutrición, descanso, motivación, etc.
- Mantén un tono profesional pero cercano
- Cuando analices el progreso del usuario, usa los datos sincronizados con el dashboard
- Si hay discrepancias entre datos, prioriza la información más reciente
- Proporciona recomendaciones específicas basadas en el balance score y análisis de grupos musculares`;

      setUserContext(trainerContext);
      console.log('✅ Contexto del entrenador personal cargado');
      console.log('📊 Contexto final (primeros 500 chars):', trainerContext.substring(0, 500) + '...');

      return trainerContext;
    } catch (error) {
      console.error('❌ Error cargando contexto del usuario:', error);
      const fallbackContext = 'Eres un entrenador personal experto llamado "GymBro". Puedes responder a cualquier pregunta sobre fitness, nutrición, motivación y bienestar. Mantén un tono amigable y motivador.';
      setUserContext(fallbackContext);
      return fallbackContext;
    }
  }, []);

  // Verificar conexión al cargar y cada 30 segundos
  useEffect(() => {
    checkConnection();
    loadUserContext();

    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, [checkConnection, loadUserContext]);

  // Efecto de escritura
  useEffect(() => {
    if (isTyping && fullResponseRef.current) {
      const interval = setInterval(() => {
        if (currentIndexRef.current < fullResponseRef.current.length) {
          currentIndexRef.current += 1;

          // Actualizar el último mensaje del asistente
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0 && newMessages[newMessages.length - 1].type === 'assistant') {
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: fullResponseRef.current.substring(0, currentIndexRef.current)
              };
            }
            return newMessages;
          });
        } else {
          // Terminó de escribir
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 30); // Velocidad de escritura

      return () => clearInterval(interval);
    }
  }, [isTyping]);

  const sendMessage = async (message: string) => {
    setLoading(true);
    setError('');

    // Agregar mensaje del usuario inmediatamente
    setMessages(prev => [
      ...prev,
      { type: 'user', content: message }
    ]);

    try {
      console.log('💬 Enviando mensaje:', message);

      // Si el contexto está vacío, recargarlo
      let contextToUse = userContext;
      if (!userContext || userContext.length === 0) {
        console.log('⚠️ Contexto vacío, recargando...');
        contextToUse = await loadUserContext();
      }

      console.log('📊 Contexto del usuario (longitud):', contextToUse.length);
      console.log('📊 Contexto del usuario (primeros 500 chars):', contextToUse.substring(0, 500) + '...');

      // Determinar la URL del API según el entorno
      const isDevelopment = import.meta.env.DEV;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = (isDevelopment && isLocalhost)
        ? 'http://localhost:8004/chat'
        : '/api/chat';

      console.log('🌐 URL de API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          reasoning_level: 'high',
          context: contextToUse
        }),
      });

      console.log('📥 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('📋 Datos recibidos:', data);

      if (data.error) {
        setError(data.error);
        // Agregar mensaje de error como respuesta del asistente
        setMessages(prev => [
          ...prev,
          { type: 'assistant', content: `Error: ${data.error}` }
        ]);
      } else {
        // Iniciar efecto de escritura
        fullResponseRef.current = data.response;
        currentIndexRef.current = 0;
        setIsTyping(true);

        // Agregar mensaje vacío del asistente que se irá llenando
        setMessages(prev => [
          ...prev,
          { type: 'assistant', content: '' }
        ]);
      }
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      // Agregar mensaje de error como respuesta del asistente
      setMessages(prev => [
        ...prev,
        { type: 'assistant', content: `Error: ${errorMessage}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError('');
    setIsTyping(false);
    fullResponseRef.current = '';
    currentIndexRef.current = 0;
  };

  const handleReconnect = () => {
    checkConnection();
  };

  // Conectar con el estado global del chat
  useEffect(() => {
    // Exponer la función sendMessage globalmente para que la navegación pueda usarla
    (window as any).sendChatMessage = sendMessage;
    (window as any).chatLoading = loading;
    (window as any).chatConnected = isConnected;
    (window as any).handleChatClear = handleClear;
    (window as any).handleChatReconnect = handleReconnect;
  }, [loading, isConnected]);

  return (
    <div className={`chat-assistant h-full flex flex-col ${className}`}>
      {/* Messages - área de scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg font-medium mb-2">¡Hola! Soy GymBro, tu entrenador personal.</p>
            <p className="text-sm">Pregúntame sobre fitness, nutrición, motivación, técnica de ejercicios, rutinas de entrenamiento, consejos de salud o cualquier tema relacionado con tu bienestar físico y mental.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'slideInFromBottom 0.3s ease-out forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-white'
                }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {/* Indicador de "pensando" con 3 puntos que saltan */}
        {loading && (
          <div
            className="flex justify-start"
            style={{
              animation: 'slideInFromBottom 0.3s ease-out forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}
          >
            <div className="bg-gray-700 text-white px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className="flex justify-start"
            style={{
              animation: 'slideInFromBottom 0.3s ease-out forwards',
              opacity: 0,
              transform: 'translateY(20px)'
            }}
          >
            <div className="bg-red-600 text-white px-4 py-3 rounded-lg">
              <p className="text-sm">Error: {error}</p>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideInFromBottom {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}; 