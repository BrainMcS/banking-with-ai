'use client';

import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import type { Message } from 'ai';
import type { AIModel } from '@/lib/ai/models';

interface ChatContainerProps {
  id: string;
  initialMessages: Message[];
  selectedModelId: string;
  availableModels: AIModel[];
  visibility: 'private' | 'public';
  isReadonly: boolean;
}

export function ChatContainer({
  id,
  initialMessages,
  selectedModelId,
  availableModels,
  visibility,
  isReadonly,
}: ChatContainerProps) {
  return (
    <div className="flex flex-col h-screen">
      <Chat
        id={id}
        initialMessages={initialMessages}
        selectedModelId={selectedModelId}
        availableModels={availableModels}
        selectedVisibilityType={visibility}
        isReadonly={isReadonly}
      />
      <DataStreamHandler id={id} />
    </div>
  );
}