import { NextResponse } from 'next/server';
import { OpenAI } from 'openai'; // Ensure this import is correct

import { z } from 'zod';

import { customModel } from '@/lib/ai';
import { AIModel, models } from '@/lib/ai/models';
import {
  codePrompt,
  systemPrompt,
  updateDocumentPrompt,
} from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  getDocumentById,
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
} from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { validStockSearchFilters } from '@/lib/api/stock-filters';
import { createGeminiAdapter, createClaudeAdapter } from '@/lib/ai/adapters';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
interface Task {
  task_name: string;
  class: string;
}

type AllowedTools =
  | 'getCurrentStockPrice'
  | 'getStockPrices'
  | 'getIncomeStatements'
  | 'getBalanceSheets'
  | 'getCashFlowStatements'
  | 'getFinancialMetrics'
  | 'searchStocksByFilters'
  | 'createDocument'
  | 'updateDocument'
  | 'requestSuggestions';

const financialDatasetsTools: AllowedTools[] = [
  'getCurrentStockPrice',
  'getStockPrices',
  'getIncomeStatements',
  'getBalanceSheets',
  'getCashFlowStatements',
  'getFinancialMetrics',
  'searchStocksByFilters'
];

const documentTools: AllowedTools[] = [
  'createDocument',
  'updateDocument',
  'requestSuggestions'
];

const allTools: AllowedTools[] = [...financialDatasetsTools, ...documentTools];
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, modelId } = await request.json();

    // Create a data stream for the response
    const dataStream = new ReadableStream({
      async start(controller) {
        const response = await openai.chat.completions.create({
          model: modelId,
          messages: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: 0.7,
          stream: true,
        });

        for await (const chunk of response) {
          if (chunk) {
            controller.enqueue(JSON.stringify({
              type: 'text',
              content: chunk,
              role: 'assistant'
            }) + '\n');
          }
        }

        controller.close();
      }
    });

    return new Response(dataStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Financial Advisor API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

