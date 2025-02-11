'use client';

import { startTransition, useMemo, useOptimistic, useState, useEffect } from 'react';
import { saveModelId } from '@/lib/actions/chatActions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { models, AIModel } from '@/lib/ai/models';
import { cn } from '@/lib/utils';
import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { getOpenAIApiKey, getGeminiApiKey, getClaudeApiKey } from '@/lib/db/api-keys';
export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(selectedModelId);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAvailableModels = async () => {
      try {
        setIsLoading(true);
        
        // First try to get environment variables directly
        const response = await fetch('/api/env');
        const envKeys = await response.json();
        
        // Then check local storage keys
        const localKeys = {
          openai: await getOpenAIApiKey(),
          gemini: await getGeminiApiKey(),
          claude: await getClaudeApiKey()
        };

        // Combine environment and local storage keys
        const keys = {
          openai: envKeys.OPENAI_API_KEY || localKeys.openai,
          gemini: envKeys.GOOGLE_API_KEY || localKeys.gemini,
          claude: envKeys.ANTHROPIC_API_KEY || localKeys.claude
        };

        console.log('Available API keys:', {
          openai: !!keys.openai,
          gemini: !!keys.gemini,
          claude: !!keys.claude
        });

        const filtered = models.filter(model => {
          switch (model.provider) {
            case 'openai':
              return !!keys.openai;
            case 'gemini':
              return !!keys.gemini;
            case 'claude':
              return !!keys.claude;
            default:
              return false;
          }
        });

        console.log('Filtered models:', filtered.map(m => m.label));

        if (filtered.length > 0) {
          setAvailableModels(filtered);
          if (!filtered.some(m => m.id === optimisticModelId)) {
            startTransition(() => {
              setOptimisticModelId(filtered[0].id);
              saveModelId(filtered[0].id);
            });
          }
        }
      } catch (error) {
        console.error('Error checking API keys:', error);
        setAvailableModels([models[0]]); // Fallback to first model only
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailableModels();
  }, [optimisticModelId]);

  const selectedModel = useMemo(
    () => availableModels.find((model) => model.id === optimisticModelId) || availableModels[0],
    [optimisticModelId, availableModels],
  );

  if (isLoading) {
    return (
      <Button variant="outline" className="md:px-2 md:h-[34px]" disabled>
        Loading models...
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button variant="outline" className="md:px-2 md:h-[34px]">
          {selectedModel?.label || 'Select Model'}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {availableModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => {
              setOpen(false);
              startTransition(() => {
                setOptimisticModelId(model.id);
                saveModelId(model.id);
              });
            }}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={model.id === optimisticModelId}
          >
            <div className="flex flex-col gap-1 items-start">
              {model.label}
              {model.description && (
                <div className="text-xs text-muted-foreground">
                  {model.description}
                </div>
              )}
            </div>
            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCircleFillIcon />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
