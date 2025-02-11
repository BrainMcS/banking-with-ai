"use client";

import { useState } from 'react';
import { useChat } from 'ai/react';
import { ChatService } from '@/lib/services/ChatService';
import { AIModel } from '@/lib/ai/models';

interface ChatContainerProps {
  modelId: string;
  financialDatasetsApiKey: string;
  googleApiKey?: string;
  anthropicApiKey?: string;
  initialMessages?: any[];
  id: string;
}

export function ChatContainer({
  modelId,
  financialDatasetsApiKey,
  googleApiKey,
  anthropicApiKey,
  initialMessages = [],
  id
}: ChatContainerProps) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/market',
    body: {
      id,
      modelId,
      financialDatasetsApiKey,
      googleApiKey,
      anthropicApiKey,
    },
    initialMessages
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`p-4 rounded ${
            message.role === 'assistant' ? 'bg-gray-100' : ''
          }`}>
            <div className="font-bold">{message.role}</div>
            <div>{message.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about any stock..."
            className="flex-1 p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}