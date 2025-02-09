'use client'

import { useState } from 'react';
import { AIModel, models } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

// Change to default export
export default function FinancialAdvisor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(models[0] || null);

  const handleClearConversation = () => {
    setMessages([]);
  };

  const handleRegenerateResponse = async () => {
    if (messages.length < 1) return;
    
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (!lastUserMessage) return;

    // Remove the last assistant message
    setMessages(prev => prev.filter(msg => msg !== prev[prev.length - 1]));
    
    // Regenerate response
    await handleSubmit(lastUserMessage.content);
  };

  if (!selectedModel) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>No AI models available</p>
      </div>
    );
  }

  // Remove authentication checks
  
  const handleSubmit = async (content: string) => {
    if (!content.trim()) return;

    setLoading(true);
    const chatId = generateUUID();
    const newMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, newMessage]);

    try {
      const completeResponse = await getChatCompletion([...messages, newMessage], selectedModel.id);
      setMessages(prev => [...prev, { role: 'assistant', content: completeResponse }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]"> {/* Fixed height */}
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat History</h3>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerateResponse}
            disabled={loading || messages.length === 0}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
            title="Regenerate response"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleClearConversation}
            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            title="Clear conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-center">
            <div className="animate-pulse dark:text-gray-300">Processing...</div>
          </div>
        )}
      </div>
      
      <div className="border-t p-4 bg-white dark:bg-gray-800">
        <div className="flex gap-3 mb-4"> {/* Increased gap */}
          {models.map(model => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedModel.id === model.id 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {model.label}
            </button>
          ))}
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
          handleSubmit(input.value);
          input.value = '';
        }}>
          <div className="flex gap-2">
            <input
              type="text"
              name="message"
              placeholder="Ask about stocks..."
              className="flex-1 px-4 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Define the getChatCompletion function
async function getChatCompletion(messages: any[], modelId: string = 'gpt-4') {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  const response = await fetch(`${baseUrl}/api/financial-advisor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, modelId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'API request failed');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is empty.');
  }

  const decoder = new TextDecoder();
  let partialResponse = "";
  let completeResponse = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const chunk = decoder.decode(value);
    partialResponse += chunk;

    while (true) {
      const newlineIndex = partialResponse.indexOf('\n');
      if (newlineIndex === -1) {
        break;
      }

      const line = partialResponse.substring(0, newlineIndex);
      partialResponse = partialResponse.substring(newlineIndex + 1);

      try {
        const jsonChunk = JSON.parse(line);

        if (jsonChunk.content && jsonChunk.content.choices && jsonChunk.content.choices[0] && jsonChunk.content.choices[0].delta && jsonChunk.content.choices[0].delta.content) {
          completeResponse += jsonChunk.content.choices[0].delta.content;
          console.log("Partial response:", jsonChunk.content.choices[0].delta.content);
        }

        if (jsonChunk.content && jsonChunk.content.choices && jsonChunk.content.choices[0] && jsonChunk.content.choices[0].finish_reason === "stop") {
          console.log("Full response:", completeResponse);
        }

      } catch (error) {
        console.error("Error parsing JSON:", error, line);
      }
    }
  }

  console.log("Final Response:", completeResponse); // Log the complete response
  return completeResponse;
}