import {
    type LanguageModelV1,
    type LanguageModelV1StreamPart,
    type LanguageModelV1CallOptions,
  } from 'ai';
  import { GenerativeModel } from "@google/generative-ai";
  import Anthropic from '@anthropic-ai/sdk';
  
  interface ModelAdapter extends Omit<LanguageModelV1, 'doStream' | 'doGenerate'> {
    provider: string;
    generateContent: (params: any) => Promise<any>;
    specificationVersion: "v1";
    modelId: string;
    defaultObjectGenerationMode: "json";
    doGenerate: (settings: {
      prompt: string;
      system?: string;
      template?: string;
      context?: Record<string, unknown>;
      raw?: boolean;
    }) => Promise<{
      content: string;
      rawResponse: unknown;
    }>;
    doStream: (settings: {
      prompt: string;
      system?: string;
      template?: string;
      context?: Record<string, unknown>;
      raw?: boolean;
    }) => Promise<{
      stream: ReadableStream<LanguageModelV1StreamPart>;
      rawCall: {
        rawPrompt: unknown;
        rawSettings: Record<string, unknown>;
      };
      rawResponse?: unknown;
      request?: unknown;
      warnings?: LanguageModelV1CallOptions[];
    }>;
    callAPI: (settings: any) => Promise<any>;
    validateSettings: (settings: any) => void;
    prepareRequest: (settings: any) => Promise<any>;
    handleResponse: (response: any) => Promise<any>;
  }
  
  export function createGeminiAdapter(model: GenerativeModel): ModelAdapter {
    async function prepareRequest(settings: any) {
      const prompt = settings.prompt || 
                    (settings.messages && settings.messages[settings.messages.length - 1]?.content) || 
                    '';
      return { text: prompt };
    }
  
    async function extractText(result: any): Promise<string> {
      return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
  
    return {
      provider: 'gemini',
      modelId: 'gemini-pro',
      specificationVersion: "v1",
      defaultObjectGenerationMode: "json",
  
      generateContent: async (params: any) => {
        const prepared = await prepareRequest(params);
        const result = await model.generateContent(prepared.text);
        const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return { response: result, text: () => text, content: text };
      },
  
      doGenerate: async (settings: any) => {
        const prepared = await prepareRequest(settings);
        const result = await model.generateContent(prepared.text);
        const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return { content: text, rawResponse: result };
      },
  
      doStream: async (settings: any) => {
        const prepared = await prepareRequest(settings);
        const result = await model.generateContent(prepared.text);
        const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        return {
          stream: new ReadableStream<LanguageModelV1StreamPart>({
            start(controller) {
              controller.enqueue({ type: 'text-delta', textDelta: text });
              controller.close();
            }
          }),
          rawCall: { rawPrompt: settings, rawSettings: prepared },
          rawResponse: result
        };
      },
  
      callAPI: async (settings: any) => model.generateContent(settings),
      validateSettings: () => {},
      prepareRequest,
      handleResponse: async (response: any) => response
    };
  }
  
  export function createClaudeAdapter(client: Anthropic): ModelAdapter {
    async function prepareRequest(settings: any) {
      return {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: settings.prompt
        }],
        ...(settings.system && {
          system: settings.system
        })
      };
    }
  
    return {
      provider: 'claude',
      generateContent: async (messages: any) => {
        const response = await client.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2048,
          messages: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        });
        return response;
      },
      specificationVersion: "v1",
      modelId: 'claude-3-sonnet-20240229',
      defaultObjectGenerationMode: "json",
      callAPI: async (settings: any) => {
        return client.messages.create(settings);
      },
      validateSettings: (settings: any) => {
        // Add validation if needed
      },
      prepareRequest,
      handleResponse: async (response: any) => {
        return response;
      },
      doGenerate: async (settings: any) => {
        const prepared = await prepareRequest(settings);
        const response = await client.messages.create(prepared);
        const content = response.content[0].type === 'text' 
          ? response.content[0].text 
          : '';
        return {
          content,
          rawResponse: response
        };
      },
      doStream: async (settings: any) => {
        const prepared = await prepareRequest(settings);
        const response = await client.messages.create(prepared);
        const content = response.content[0].type === 'text' 
          ? response.content[0].text 
          : '';
        
        return {
          stream: new ReadableStream<LanguageModelV1StreamPart>({
            start(controller) {
              controller.enqueue({
                type: 'text-delta',
                textDelta: content
              });
              controller.close();
            }
          }),
          rawCall: {
            rawPrompt: settings,
            rawSettings: settings
          },
          rawResponse: response
        };
      }
    };
  }
