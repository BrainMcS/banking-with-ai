'use client';

import type { Attachment, ChatRequestOptions, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, track } from '@/lib/utils';
import { 
  getFinancialDatasetsApiKey, 
  getOpenAIApiKey, 
  getGeminiApiKey, 
  getClaudeApiKey 
} from '@/lib/db/api-keys';
import { AIModel } from '@/lib/ai/models';
import { Block } from './block';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useBlockSelector } from '@/hooks/use-block';
import { ApiKeysModal } from '@/components/api-keys-modal';

const getModelProvider = (modelId: string) => {
  if (modelId.startsWith('openai')) return { id: 'openai', name: 'OpenAI' };
  if (modelId.startsWith('gemini')) return { id: 'gemini', name: 'Google Gemini' };
  if (modelId.startsWith('claude')) return { id: 'claude', name: 'Anthropic Claude' };
  return { id: 'unknown', name: 'Unknown Provider' };
};

interface ChatProps {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  availableModels: Array<AIModel>;  // Add this line
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  availableModels, // Add this to destructuring
  selectedVisibilityType,
  isReadonly,
}: ChatProps) {
  const { mutate } = useSWRConfig();
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const provider = getModelProvider(selectedModelId);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { 
      id, 
      modelId: selectedModelId,
      financialDatasetsApiKey: getFinancialDatasetsApiKey(),
      googleApiKey: getGeminiApiKey(),
      anthropicApiKey: getClaudeApiKey(),
    },
    initialMessages,
    experimental_throttle: 100,
    onFinish: () => {
      mutate('/api/history');
    },
  });

  const handleFormSubmit = async (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    try {
      const provider = getModelProvider(selectedModelId);
      const response = await fetch('/api/messages/count');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      const maxFreeMessageCount = 3;
      let hasValidKey = false;

      switch (provider.id) {
        case 'openai':
          hasValidKey = !!(await getOpenAIApiKey());
          break;
        case 'gemini':
          hasValidKey = !!(await getGeminiApiKey());
          break;
        case 'claude':
          hasValidKey = !!(await getClaudeApiKey());
          break;
      }

      if (data.count >= maxFreeMessageCount && !hasValidKey) {
        setShowApiKeysModal(true);
        return;
      }

      track('chat_message_submit');
      handleSubmit(event, chatRequestOptions);
    } catch (error) {
      console.error('Error checking message count:', error);
    }
  };

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedModelId}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          isLoading={isLoading}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isBlockVisible={isBlockVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleFormSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      <Block
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleFormSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />

      <ApiKeysModal 
        open={showApiKeysModal} 
        onOpenChange={setShowApiKeysModal}
        title={`${provider.name} Message Limit Reached`}
        description={`You have reached your free message limit for ${provider.name} models. Please add your ${provider.name} API key to continue using this model, or switch to another AI provider.`}
      />
    </>
  );
}
