import React from 'react';
import { ChatAssistant } from '../../components/chat-assistant';

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Chat IA de Entrenamiento
          </h1>
          <p className="text-gray-300">
            Pregunta lo que quieras sobre fitness, ejercicios, nutrición y más
          </p>
        </div>

        {/* Chat */}
        <div className="h-[600px]">
          <ChatAssistant />
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 