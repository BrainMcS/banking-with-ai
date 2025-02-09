'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { 
  getOpenAIApiKey, 
  setOpenAIApiKey, 
  getFinancialDatasetsApiKey, 
  setFinancialDatasetsApiKey,
  getGeminiApiKey, 
  setGeminiApiKey, 
  getClaudeApiKey, 
  setClaudeApiKey 
} from '@/lib/db/api-keys';
import { validateOpenAIKey, validateGeminiKey, validateClaudeKey } from '@/lib/utils/api-key-validation';

interface ApiKeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function ApiKeysModal({ 
  open, 
  onOpenChange, 
  title = "Configure API keys",
  description 
}: ApiKeysModalProps) {
  const [openAIKey, setOpenAIKey] = useState('');
  const [financialKey, setFinancialKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');

  
  useEffect(() => {
    const loadApiKeys = async () => {
      const [openAI, financial, gemini, claude] = await Promise.all([
        getOpenAIApiKey(),
        getFinancialDatasetsApiKey(),
        getGeminiApiKey(),
        getClaudeApiKey()
      ]);

      setOpenAIKey(openAI || '');
      setFinancialKey(financial || '');
      setGeminiKey(gemini || '');
      setClaudeKey(claude || '');
    };

    loadApiKeys();
  }, []);

  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showFinancialKey, setShowFinancialKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [openAIError, setOpenAIError] = useState<string>('');
  const [geminiError, setGeminiError] = useState<string>('');
  const [claudeError, setClaudeError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setOpenAIError('');
      setGeminiError('');
      setClaudeError('');

      if (openAIKey) {
        const { isValid, error } = await validateOpenAIKey(openAIKey);
        if (!isValid) {
          setOpenAIError(error ?? 'Invalid OpenAI API key');
          return;
        }
      }

      if (geminiKey) {
        const { isValid, error } = await validateGeminiKey(geminiKey);
        if (!isValid) {
          setGeminiError(error ?? 'Invalid Gemini API key');
          return;
        }
      }

      if (claudeKey) {
        const { isValid, error } = await validateClaudeKey(claudeKey);
        if (!isValid) {
          setClaudeError(error ?? 'Invalid Claude API key');
          return;
        }
      }

      await Promise.all([
        setOpenAIApiKey(openAIKey),
        setGeminiApiKey(geminiKey),
        setClaudeApiKey(claudeKey),
        setFinancialDatasetsApiKey(financialKey)
      ]);

      onOpenChange(false);
    } catch (error) {
      setOpenAIError('An unexpected error occurred. Please try again.');
      console.error('Error saving API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="openai-key" className="text-sm font-medium">
              OpenAI API Key
            </label>
            <div className="relative">
              <Input
                id="openai-key"
                type={showOpenAIKey ? "text" : "password"}
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showOpenAIKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {openAIError && (
              <p className="text-sm text-red-500 mt-1">
                {openAIError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://platform.openai.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="financial-key" className="text-sm font-medium">
              Financial Datasets API Key
            </label>
            <div className="relative">
              <Input
                id="financial-key"
                type={showFinancialKey ? "text" : "password"}
                value={financialKey}
                onChange={(e) => setFinancialKey(e.target.value)}
                placeholder="Enter your Financial Datasets API key"
              />
              <button
                type="button"
                onClick={() => setShowFinancialKey(!showFinancialKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showFinancialKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://financialdatasets.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                financialdatasets.ai
              </a>
            </p>
          </div>
          {/* Add Gemini API Key section */}
          <div className="space-y-2">
            <label htmlFor="gemini-key" className="text-sm font-medium">
              Google Gemini API Key
            </label>
            <div className="relative">
              <Input
                id="gemini-key"
                type={showGeminiKey ? "text" : "password"}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://makersuite.google.com/app/apikey"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Add Claude API Key section */}
          <div className="space-y-2">
            <label htmlFor="claude-key" className="text-sm font-medium">
              Anthropic Claude API Key
            </label>
            <div className="relative">
              <Input
                id="claude-key"
                type={showClaudeKey ? "text" : "password"}
                value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)}
                placeholder="Enter your Claude API key"
              />
              <button
                type="button"
                onClick={() => setShowClaudeKey(!showClaudeKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showClaudeKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://console.anthropic.com/account/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Anthropic Console
              </a>
            </p>
          </div>

          {/* Financial Datasets section remains the same */}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}