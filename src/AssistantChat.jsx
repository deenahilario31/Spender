import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Loader } from 'lucide-react'
import { API_URL } from './config'

export default function AssistantChat({ authenticatedUser, onExpenseAdded }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${authenticatedUser.name}! 👋 I'm your AI expense assistant. I can help you:

• Add expenses (e.g., "Add $40 sushi dinner with Sarah")
• Check balances (e.g., "How much does Sarah owe me?")
• Show recent expenses
• View all balances

What would you like to do?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    
    const userMessage = input.trim()
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    setLoading(true)
    
    try {
      // Send to backend
      const response = await fetch(`${API_URL}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userName: authenticatedUser.name
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }
      
      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        action: data.action,
        result: data.result
      }])
      
      // If expense was added, notify parent to refresh
      if (data.action === 'add_expense' && onExpenseAdded) {
        onExpenseAdded()
      }
    } catch (error) {
      console.error('Assistant error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: error.message.includes('not configured')
          ? `⚠️ AI Assistant is not configured yet. To enable it:\n\n1. Get an OpenAI API key from https://platform.openai.com/api-keys\n2. Add it to your .env file:\n   OPENAI_API_KEY=sk-...\n3. Restart the server\n\nFor now, you can use the regular expense form! 😊`
          : `Sorry, I encountered an error: ${error.message}\n\nPlease try again or use the regular expense form.`
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    "How much does Sarah owe me?",
    "Show recent expenses",
    "Add $20 coffee with Bob",
    "Who owes whom?"
  ]

  return (
    <div className="glass-card rounded-3xl shadow-2xl p-6 border border-white/20 h-full flex flex-col" style={{ minHeight: '700px', maxHeight: '900px' }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          AI Assistant
        </h2>
        <p className="text-sm text-gray-600">Ask about balances & expenses</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border-2 border-gray-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {/* Show action badge if available */}
              {msg.action && (
                <div className="mt-2 inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                  {msg.action === 'add_expense' && '✅ Expense Added'}
                  {msg.action === 'get_balance' && '💰 Balance Checked'}
                  {msg.action === 'list_expenses' && '📋 Expenses Listed'}
                  {msg.action === 'get_all_balances' && '⚖️ All Balances'}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl border-2 border-gray-200">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">💡 Try:</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setInput("Check balance")}
            className="px-2 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs hover:bg-purple-100 transition-all border border-purple-200"
          >
            💰 Balance
          </button>
          <button
            onClick={() => setInput("Recent expenses")}
            className="px-2 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs hover:bg-purple-100 transition-all border border-purple-200"
          >
            📋 Recent
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask me anything..."
          disabled={loading}
          className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
