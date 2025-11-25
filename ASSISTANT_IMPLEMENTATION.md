# Virtual Assistant Implementation Guide

## 🎯 Overview

Add an AI-powered virtual assistant to Spender that understands natural language commands for managing expenses.

## 📦 Required Packages

```bash
npm install openai
# OR for Google Gemini:
npm install @google/generative-ai
# OR for open source:
npm install langchain ollama
```

## 🔑 Setup

### Option 1: OpenAI (Recommended)

1. **Get API Key:**
   - Go to https://platform.openai.com/api-keys
   - Create new API key
   - Copy the key

2. **Add to .env:**
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   ENABLE_ASSISTANT=true
   ```

3. **Cost:** ~$0.002 per conversation (very cheap)

### Option 2: Google Gemini (Free)

1. **Get API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Create API key

2. **Add to .env:**
   ```bash
   GOOGLE_AI_API_KEY=xxxxxxxxxxxxx
   ENABLE_ASSISTANT=true
   ```

3. **Cost:** Free tier (60 requests/min)

## 🏗️ Backend Structure

### 1. Create Assistant Service (`server/assistant.js`)

```javascript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Define available functions
const functions = [
  {
    name: "add_expense",
    description: "Add a new expense to track",
    parameters: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "What the expense was for (e.g., 'sushi dinner')"
        },
        amount: {
          type: "number",
          description: "The total amount in dollars"
        },
        paidBy: {
          type: "string",
          description: "Who paid for the expense"
        },
        splitWith: {
          type: "array",
          items: { type: "string" },
          description: "Names of people to split with (including payer)"
        }
      },
      required: ["description", "amount", "paidBy", "splitWith"]
    }
  },
  {
    name: "get_balance",
    description: "Get the balance between two people",
    parameters: {
      type: "object",
      properties: {
        person1: {
          type: "string",
          description: "First person's name"
        },
        person2: {
          type: "string",
          description: "Second person's name"
        }
      },
      required: ["person1", "person2"]
    }
  },
  {
    name: "list_expenses",
    description: "List recent expenses",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of expenses to show (default 5)"
        }
      }
    }
  },
  {
    name: "suggest_settlement",
    description: "Suggest how to settle debts",
    parameters: {
      type: "object",
      properties: {
        person: {
          type: "string",
          description: "Person to settle with"
        }
      }
    }
  }
]

export async function processMessage(message, context) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant for Spender, an expense tracking app.
                  Help users add expenses, check balances, and manage their finances.
                  Current user: ${context.userName}
                  Available friends: ${context.friends.join(', ')}
                  Be friendly, concise, and helpful.`
      },
      {
        role: "user",
        content: message
      }
    ],
    functions: functions,
    function_call: "auto"
  })

  return response
}
```

### 2. Add API Endpoint (`server/index.js`)

```javascript
import { processMessage } from './assistant.js'

// Chat with assistant
app.post('/api/assistant/chat', async (req, res) => {
  const { message, userId } = req.body
  
  if (!process.env.ENABLE_ASSISTANT === 'true') {
    return res.status(400).json({ 
      error: 'Assistant not enabled' 
    })
  }
  
  try {
    // Get user context
    const context = {
      userName: authenticatedUser.name,
      friends: people.map(p => p.name),
      expenses: expenses,
      balances: balances
    }
    
    // Process message with AI
    const response = await processMessage(message, context)
    
    // Check if AI wants to call a function
    if (response.choices[0].finish_reason === 'function_call') {
      const functionCall = response.choices[0].message.function_call
      const functionName = functionCall.name
      const args = JSON.parse(functionCall.arguments)
      
      // Execute the function
      let result
      switch (functionName) {
        case 'add_expense':
          result = await addExpense(args)
          break
        case 'get_balance':
          result = getBalance(args.person1, args.person2)
          break
        case 'list_expenses':
          result = listExpenses(args.limit || 5)
          break
        case 'suggest_settlement':
          result = suggestSettlement(args.person)
          break
      }
      
      // Send result back to AI for natural response
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          ...response.choices[0].message,
          {
            role: "function",
            name: functionName,
            content: JSON.stringify(result)
          }
        ]
      })
      
      res.json({
        message: finalResponse.choices[0].message.content,
        action: functionName,
        result: result
      })
    } else {
      // Just a text response
      res.json({
        message: response.choices[0].message.content
      })
    }
  } catch (error) {
    console.error('Assistant error:', error)
    res.status(500).json({ error: error.message })
  }
})
```

## 🎨 Frontend Component

### Create `src/AssistantChat.jsx`

```javascript
import { useState } from 'react'
import { MessageSquare, Send, Sparkles } from 'lucide-react'

export default function AssistantChat({ authenticatedUser, onAction }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${authenticatedUser.name}! I can help you:
• Add expenses
• Check balances
• Suggest settlements
• Show recent activity

Try: "Add $40 sushi dinner with Sarah"`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    
    // Add user message
    const userMessage = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)
    
    try {
      // Send to backend
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userId: authenticatedUser.id
        })
      })
      
      const data = await response.json()
      
      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        action: data.action,
        result: data.result
      }])
      
      // Trigger action if needed
      if (data.action && onAction) {
        onAction(data.action, data.result)
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-3xl shadow-2xl p-8 border border-white/20 h-[600px] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-600" />
          AI Assistant
        </h2>
        <p className="text-gray-600">Ask me anything about your expenses</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
              
              {/* Show action result if available */}
              {msg.result && (
                <div className="mt-2 p-2 bg-white/20 rounded-lg text-sm">
                  {JSON.stringify(msg.result, null, 2)}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-4 rounded-2xl">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything..."
          className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setInput("How much does Sarah owe me?")}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200"
        >
          Check balance
        </button>
        <button
          onClick={() => setInput("Show recent expenses")}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200"
        >
          Recent expenses
        </button>
        <button
          onClick={() => setInput("Suggest settlement")}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200"
        >
          Settle up
        </button>
      </div>
    </div>
  )
}
```

## 🎯 Example Conversations

### Add Expense:
```
User: "Add $40 sushi dinner, I paid for both"
AI: "I've added a $40 expense for 'Sushi dinner'. 
     Who should split this with you?"
User: "Sarah"
AI: "✅ Done! Added $40 'Sushi dinner'
     Paid by: You
     Split with: You, Sarah
     Sarah now owes you $20"
```

### Check Balance:
```
User: "How much does Sarah owe me?"
AI: "Sarah owes you $45.50 in total:
     • Sushi dinner: $20.00
     • Coffee: $15.50
     • Groceries: $10.00"
```

### Settlement:
```
User: "How should Sarah pay me back?"
AI: "Sarah should send you $45.50
     Would you like me to send a payment request?"
User: "Yes"
AI: "✅ Payment request sent to Sarah via SMS!"
```

## 💰 Cost Estimate

### OpenAI GPT-4:
- **Per request:** ~$0.002
- **100 requests:** $0.20
- **1000 requests:** $2.00

Very affordable for personal use!

### Google Gemini:
- **Free tier:** 60 requests/minute
- **Cost:** $0 for most users

## 🚀 Next Steps

1. Choose AI provider (OpenAI recommended)
2. Get API key
3. Install packages
4. Add backend code
5. Create frontend component
6. Test with sample commands
7. Deploy!

## 🔒 Security

- Store API keys in `.env`
- Never commit API keys
- Rate limit requests
- Validate user input
- Sanitize AI responses

## 📚 Resources

- **OpenAI Docs:** https://platform.openai.com/docs
- **Gemini Docs:** https://ai.google.dev/docs
- **LangChain:** https://js.langchain.com/docs

---

Ready to implement? Let me know which AI provider you'd like to use!
