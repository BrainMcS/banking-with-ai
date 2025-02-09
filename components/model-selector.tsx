'use client';

import { startTransition, useMemo, useOptimistic, useState, useEffect } from 'react';
import { saveModelId } from '@/app/(chat)/actions';
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
        const keys = {
          openai: await getOpenAIApiKey(),
          gemini: await getGeminiApiKey(),
          claude: await getClaudeApiKey()
        };

        // Only fetch from environment if no local keys are available
        if (!Object.values(keys).some(Boolean)) {
          const response = await fetch('/api/env');
          const envKeys = await response.json();
          keys.openai = keys.openai || envKeys.openaiApiKey;
          keys.gemini = keys.gemini || envKeys.googleApiKey;
          keys.claude = keys.claude || envKeys.anthropicApiKey;
        }

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
        setAvailableModels(models); // Fallback to all models
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailableModels();
  }, []); // Remove optimisticModelId dependency

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
