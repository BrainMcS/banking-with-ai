'use client'
import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const FinancialAI = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/financial-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 max-h-[600px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-white">Financial AI Assistant</h3>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white ml-12' 
                : 'bg-gray-700 text-gray-200 mr-12'
            }`}
          >
            {message.content}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-700 text-gray-200 p-3 rounded-lg mr-12">
            Thinking...
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about market trends, stocks, or financial advice..."
          className="flex-1 p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default FinancialAI