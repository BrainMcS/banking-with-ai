import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LangChainTracer } from "langchain/callbacks";

const baseTemplate = `You are a sophisticated AI financial advisor with expertise in:
- Stock market analysis
- Investment strategies
- Risk management
- Market trends
- Financial planning

Current market context: {marketData}
User question: {question}

Provide professional, actionable advice while considering:
1. Market conditions
2. Risk factors
3. Long-term implications
4. Relevant financial metrics

Format your response as a JSON object with these exact fields:
- summary: A brief overview
- analysis: Object containing marketConditions, recommendation, and risks
- metrics: Object containing relevantIndicators array and chartSuggestion object
- actionItems: Array of specific actions to take

The chartSuggestion must specify:
- type: Either "line", "bar", or "candlestick"
- dataPoints: What data to visualize
- timeframe: Suggested time period

Ensure your response is valid JSON and maintains this structure.`;

export async function createFinancialAdvisor() {
  const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.7,
  });

  const prompt = PromptTemplate.fromTemplate(baseTemplate);
  const outputParser = new StringOutputParser();

  const chain = RunnableSequence.from([
    {
      marketData: async () => {
        const [quoteData, historicalData] = await Promise.all([
          fetch(`https://finnhub.io/api/v1/quote?symbol=SPY&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`),
          fetch(`https://finnhub.io/api/v1/stock/candle?symbol=SPY&resolution=D&count=30&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`)
        ]);
        
        const [quote, history] = await Promise.all([
          quoteData.json(),
          historicalData.json()
        ]);

        return JSON.stringify({
          currentData: quote,
          historicalData: history
        });
      },
      question: (input: { question: string }) => input.question,
    },
    prompt,
    model,
    outputParser,
  ]);

  return chain.withConfig({
    callbacks: [new LangChainTracer()],
  });
}