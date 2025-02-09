import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { messages, modelId } = await request.json();

    // For now, let's create a simple response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const responses = [
          "I'm your AI Financial Advisor. ",
          "I can help you with market analysis, ",
          "investment strategies, ",
          "and financial planning."
        ];

        // Send each part of the response with a small delay
        for (const part of responses) {
          const message = {
            type: 'text-delta',
            content: part
          };
          controller.enqueue(encoder.encode(JSON.stringify(message) + '\n'));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        controller.close();
      }
    });

    return new Response(stream, {
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