import { NextResponse } from 'next/server';
import { OpenAI } from 'openai'; // Ensure this import is correct

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

