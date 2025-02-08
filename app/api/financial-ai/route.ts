import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a financial advisor AI assistant. Provide accurate, helpful advice about stocks, market trends, and financial planning. Always include relevant disclaimers when giving financial advice."
        },
        {
          role: "user",
          content: message
        }
      ],
    })

    return NextResponse.json({ response: completion.choices[0].message.content })
  } catch (error) {
    console.error('AI Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}