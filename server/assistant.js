import OpenAI from 'openai';

let openai = null;

// Initialize OpenAI only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Define available functions the AI can call
const functions = [
  {
    name: "add_expense",
    description: "Add a new expense to track. Use this when user wants to add, create, or log an expense.",
    parameters: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "What the expense was for (e.g., 'sushi dinner', 'coffee', 'groceries')"
        },
        amount: {
          type: "number",
          description: "The total amount in dollars"
        },
        paidBy: {
          type: "string",
          description: "Who paid for the expense (use their name or 'user' for the current user)"
        },
        splitWith: {
          type: "array",
          items: { type: "string" },
          description: "Names of people to split with (must include the payer)"
        }
      },
      required: ["description", "amount", "paidBy", "splitWith"]
    }
  },
  {
    name: "get_balance",
    description: "Get the balance between the current user and another person. Shows who owes whom.",
    parameters: {
      type: "object",
      properties: {
        personName: {
          type: "string",
          description: "The name of the person to check balance with"
        }
      },
      required: ["personName"]
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
    name: "get_all_balances",
    description: "Get all outstanding balances showing who owes whom",
    parameters: {
      type: "object",
      properties: {}
    }
  }
];

export async function processMessage(message, context) {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Add OPENAI_API_KEY to your .env file.');
  }

  const systemPrompt = `You are a helpful AI assistant for Spender, an expense tracking app.

Current user: ${context.userName}
Available friends: ${context.friends.join(', ') || 'None yet'}

Help users:
- Add expenses (e.g., "Add $40 sushi dinner with Sarah")
- Check balances (e.g., "How much does Sarah owe me?")
- List expenses (e.g., "Show recent expenses")
- View all balances (e.g., "Who owes whom?")

When adding expenses:
- If user says "I paid" or "I paid for both", use "${context.userName}" as paidBy
- Always include the payer in splitWith array
- Parse amounts from natural language (e.g., "$40" or "forty dollars")

Be friendly, concise, and helpful. Use emojis occasionally. Format numbers as currency.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: message
      }
    ],
    functions: functions,
    function_call: "auto",
    temperature: 0.7
  });

  return response;
}

export async function generateFollowUp(functionName, functionResult, originalMessage) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant. Generate a friendly response based on the function result. Be concise and use emojis."
      },
      {
        role: "user",
        content: originalMessage
      },
      {
        role: "function",
        name: functionName,
        content: JSON.stringify(functionResult)
      }
    ],
    temperature: 0.7
  });

  return response.choices[0].message.content;
}
