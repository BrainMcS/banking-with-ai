// Define your models here.
export type AIModel = {
  id: string;
  label: string;
  provider: 'openai' | 'gemini' | 'claude';
  apiIdentifier: string;
  description: string;
}

export const models: Array<AIModel> = [
  {
    id: 'gpt-4o-mini',
    label: 'GPT 4o mini',
    provider: 'openai',
    apiIdentifier: 'gpt-4o-mini',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'gpt-4o',
    label: 'GPT 4o',
    provider: 'openai',
    apiIdentifier: 'gpt-4o',
    description: 'Great for most questions',
  },
  {
    id: 'gemini-1.5-pro',
    label: 'Gemini 1.5 Pro',
    provider: 'gemini',
    apiIdentifier: 'gemini-pro', // Updated to match Google's model identifier
    description: 'Great for most robust answers',
  },
  {
    id: 'claude-3-opus-20240229',
    label: 'Claude 3 Opus',
    provider: 'claude',
    apiIdentifier: 'claude-3-opus', // Updated to match Anthropic's model identifier
    description: 'Better and detailed complex answers',
  },
];

// Change the default model to be determined dynamically
export const getDefaultModel = () => {
  return models.find(model => model.provider === 'openai')?.id || models[0].id;
};

export const DEFAULT_MODEL_NAME = getDefaultModel();
