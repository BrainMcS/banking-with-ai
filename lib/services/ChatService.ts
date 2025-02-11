import { LanguageModelV1 } from 'ai';
import { AIModel } from '@/lib/ai/models';
import { createGeminiAdapter, createClaudeAdapter } from '@/lib/ai/adapters';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from '@anthropic-ai/sdk';
import { customModel } from '@/lib/ai';  // Add this import

export class ChatService {
  static async initializeAIModel(
    model: AIModel, 
    googleApiKey?: string, 
    anthropicApiKey?: string
  ): Promise<LanguageModelV1> {
    switch (model.provider) {
      case 'gemini':
        const genAI = new GoogleGenerativeAI(googleApiKey!);
        return createGeminiAdapter(genAI.getGenerativeModel({ model: "gemini-pro" })) as unknown as LanguageModelV1;
      
      case 'claude':
        return createClaudeAdapter(new Anthropic({ apiKey: anthropicApiKey! })) as unknown as LanguageModelV1;
      
      case 'openai':
        return customModel(model.apiIdentifier);
      
      default:
        throw new Error('Unsupported model provider');
    }
  }

  static validateApiKeys(model: AIModel, keys: {
    googleApiKey?: string,
    anthropicApiKey?: string
  }): boolean {
    switch (model.provider) {
      case 'gemini':
        return !!(keys.googleApiKey || process.env.GOOGLE_API_KEY);
      case 'claude':
        return !!(keys.anthropicApiKey || process.env.ANTHROPIC_API_KEY);
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      default:
        return false;
    }
  }
}