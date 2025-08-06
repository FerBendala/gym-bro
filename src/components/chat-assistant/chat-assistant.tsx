import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../button';
import { Card } from '../card';
import { Input } from '../input';
import { LoadingSpinner } from '../loading-spinner';
import { UserContextService } from '@/api/services/user-context-service';

interface ChatAssistantProps {
  className?: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'assistant', content: string }>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userContext, setUserContext] = useState<string>('');

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
      const context = await UserContextService.getUserContext();
      const contextSummary = UserContextService.generateContextSummary(context);
      setUserContext(contextSummary);
      console.log('✅ Contexto del usuario cargado');
    } catch (error) {
      console.error('❌ Error cargando contexto del usuario:', error);
      setUserContext('No se pudo cargar el contexto del usuario.');
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

  const sendMessage = async (message: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('💬 Enviando mensaje:', message);

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
          context: userContext
        }),
      });

      console.log('📥 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('📋 Datos recibidos:', data);

      if (data.error) {
        setError(data.error);
      } else {
        // Agregar mensaje del usuario y respuesta del asistente
        setMessages(prev => [
          ...prev,
          { type: 'user', content: message },
          { type: 'assistant', content: data.response }
        ]);
      }
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleClear = () => {
    setMessages([]);
    setError('');
  };

  return (
    <div className={`chat-assistant ${className}`}>
      <Card className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h3 className="text-lg font-semibold text-white">Asistente IA de Entrenamiento</h3>
          </div>
          <div className="flex items-center space-x-2">
            {!isConnected && (
              <Button
                variant="secondary"
                onClick={checkConnection}
                className="flex-shrink-0"
              >
                Reconectar
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleClear}
              className="text-gray-400 hover:text-white"
            >
              Limpiar
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p>¡Hola! Soy tu asistente de entrenamiento IA.</p>
              <p className="mt-2">Pregúntame sobre ejercicios, nutrición, técnica o cualquier tema de fitness.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white'
                  }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Pensando...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg">
                <p>Error: {error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700/50">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={loading || !isConnected}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || !isConnected || !inputValue.trim()}
              className="flex-shrink-0"
            >
              Enviar
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}; 