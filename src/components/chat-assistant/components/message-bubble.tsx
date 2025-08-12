import React from 'react';

export interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  const isUser = role === 'user';
  return (
    <div className={isUser ? 'text-right' : 'text-left'}>
      <div className={
        isUser
          ? 'inline-block bg-blue-600 text-white px-3 py-2 rounded-2xl'
          : 'inline-block bg-gray-800 text-gray-100 px-3 py-2 rounded-2xl'
      }>
        {content}
      </div>
    </div>
  );
};


