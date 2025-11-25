import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processMessage, generateFollowUp } from './assistant.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS to allow requests from Netlify
app.use(cors({
  origin: ['https://spend3r.netlify.app', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// In-memory data store (in production, use a database)
let expenses = [];
let people = [];
let groups = [];
let userProfile = null;
let users = []; // Store user accounts
let nextExpenseId = 1;
let nextPersonId = 1;
let nextGroupId = 1;
let nextUserId = 1;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Spender API is running', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Spender API is healthy' });
});

// Auth endpoints
// Sign up
app.post('/api/auth/signup', (req, res) => {
  const { email, phone, password, name } = req.body;
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  
  // Create new user (in production, hash the password!)
  const newUser = {
    id: nextUserId++,
    email,
    phone,
    password, // WARNING: In production, use bcrypt to hash passwords!
    name,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ user: userWithoutPassword, message: 'Account created successfully' });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  // Check password (in production, use bcrypt.compare!)
  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, message: 'Login successful' });
});

// Forgot password - Generate reset code
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  
  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    // Don't reveal if email exists for security
    return res.json({ message: 'If that email exists, a reset code has been sent.' });
  }
  
  // Generate 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store reset code (in production, use database with expiration)
  user.resetCode = resetCode;
  user.resetCodeExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  
  // In production, send email with reset code
  console.log(`\n📧 PASSWORD RESET EMAIL to ${user.email}:`);
  console.log('═'.repeat(50));
  console.log(`Hi ${user.name},\n`);
  console.log(`Your password reset code is: ${resetCode}\n`);
  console.log(`This code will expire in 15 minutes.\n`);
  console.log(`If you didn't request this, please ignore this email.`);
  console.log('═'.repeat(50));
  console.log('');
  
  res.json({ 
    message: 'If that email exists, a reset code has been sent.',
    // In development, return the code for testing
    resetCode: resetCode,
    note: 'In production, this would be sent via email service (SendGrid, AWS SES, etc.)'
  });
});

// Reset password with code
app.post('/api/auth/reset-password', (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  
  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Invalid reset code' });
  }
  
  // Check if reset code matches and hasn't expired
  if (user.resetCode !== resetCode) {
    return res.status(400).json({ error: 'Invalid reset code' });
  }
  
  if (Date.now() > user.resetCodeExpiry) {
    return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
  }
  
  // Update password (in production, hash it!)
  user.password = newPassword;
  
  // Clear reset code
  delete user.resetCode;
  delete user.resetCodeExpiry;
  
  res.json({ message: 'Password reset successful. You can now login with your new password.' });
});

// Get all people
app.get('/api/people', (req, res) => {
  res.json(people);
});

// Add a person
app.post('/api/people', (req, res) => {
  const { name, phone } = req.body;
  
  // Check if person already exists
  const existingPerson = people.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existingPerson) {
    // Update phone if provided
    if (phone) {
      existingPerson.phone = phone;
    }
    return res.json(existingPerson);
  }
  
  const newPerson = {
    id: nextPersonId++,
    name,
    phone: phone || '',
    createdAt: new Date().toISOString()
  };
  
  people.push(newPerson);
  
  // Find all historical expenses that mention this person
  let historicalExpensesCount = 0;
  expenses.forEach(expense => {
    // Check if this person is mentioned in paidBy or splitWith
    const isPayer = expense.paidBy.toLowerCase() === name.toLowerCase();
    const isInSplit = expense.splitWith.some(person => person.toLowerCase() === name.toLowerCase());
    
    if (isPayer || isInSplit) {
      historicalExpensesCount++;
      
      // Normalize the name in the expense to match the new person's name
      if (isPayer) {
        expense.paidBy = name;
      }
      if (isInSplit) {
        expense.splitWith = expense.splitWith.map(person => 
          person.toLowerCase() === name.toLowerCase() ? name : person
        );
      }
    }
  });
  
  console.log(`✅ Added friend: ${name}`);
  console.log(`📊 Found ${historicalExpensesCount} historical expense(s) for ${name}`);
  
  res.json({
    ...newPerson,
    historicalExpenses: historicalExpensesCount
  });
});

// Get user profile
app.get('/api/profile', (req, res) => {
  res.json(userProfile);
});

// Create/Update user profile
app.post('/api/profile', (req, res) => {
  const { name, phone, avatar, bio } = req.body;
  userProfile = {
    name,
    phone: phone || '',
    avatar: avatar || '',
    bio: bio || '',
    createdAt: userProfile?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  res.json(userProfile);
});

// Get all expenses
app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

// Add an expense
app.post('/api/expenses', (req, res) => {
  const { description, amount, paidBy, splitWith, items, itemizedByPerson } = req.body;
  const newExpense = {
    id: nextExpenseId++,
    description,
    amount: parseFloat(amount),
    paidBy,
    splitWith,
    items: items || [],
    itemizedByPerson: itemizedByPerson || null,
    date: new Date().toISOString()
  };
  expenses.push(newExpense);
  res.json(newExpense);
});

// Delete an expense
app.delete('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  expenses = expenses.filter(expense => expense.id !== id);
  res.json({ success: true });
});

// Calculate balances
app.get('/api/balances', (req, res) => {
  const balances = {};
  
  // Initialize balances for all people
  people.forEach(person => {
    balances[person.id] = {};
    people.forEach(otherPerson => {
      if (person.id !== otherPerson.id) {
        balances[person.id][otherPerson.id] = 0;
      }
    });
  });
  
  // Calculate balances from expenses
  expenses.forEach(expense => {
    const { paidBy, amount, splitWith, itemizedByPerson } = expense;
    
    if (itemizedByPerson) {
      // Handle itemized expenses (from receipt scanning)
      Object.keys(itemizedByPerson).forEach(personIdStr => {
        const personId = parseInt(personIdStr);
        const personTotal = itemizedByPerson[personIdStr];
        
        if (personId !== paidBy && personTotal > 0) {
          balances[personId][paidBy] += personTotal;
        }
      });
    } else {
      // Handle regular split expenses
      const splitCount = splitWith.length;
      const amountPerPerson = amount / splitCount;
      
      splitWith.forEach(personId => {
        if (personId !== paidBy) {
          // This person owes the payer
          balances[personId][paidBy] += amountPerPerson;
        }
      });
    }
  });
  
  res.json(balances);
});

// Settle a debt
app.post('/api/settle', (req, res) => {
  const { from, to, amount } = req.body;
  
  // Create a settlement expense (negative amount to offset)
  const settlement = {
    id: nextExpenseId++,
    description: `Settlement: ${people.find(p => p.id === from)?.name} paid ${people.find(p => p.id === to)?.name}`,
    amount: parseFloat(amount),
    paidBy: from,
    splitWith: [from],
    date: new Date().toISOString(),
    isSettlement: true
  };
  
  // Add offsetting transaction
  const offset = {
    id: nextExpenseId++,
    description: `Settlement received`,
    amount: parseFloat(amount),
    paidBy: to,
    splitWith: [to, from],
    date: new Date().toISOString(),
    isSettlement: true
  };
  
  expenses.push(settlement, offset);
  res.json({ success: true });
});

// Send SMS reminder
app.post('/api/send-reminder', (req, res) => {
  const { fromPersonId, toPersonId, amount } = req.body;
  
  const fromPerson = people.find(p => p.id === fromPersonId);
  const toPerson = people.find(p => p.id === toPersonId);
  
  if (!toPerson || !toPerson.phone) {
    return res.status(400).json({ error: 'Person not found or no phone number' });
  }
  
  // Format the message with payment request
  const message = `💰 PAYMENT REQUEST 💰

Hi ${toPerson.name}!

${fromPerson.name} is requesting payment for shared expenses.

Amount Due: $${amount.toFixed(2)}

Please settle up at your earliest convenience.

Sent via Spender App
Reply PAID when settled`;
  
  // In a real app, you would use Twilio or similar service here
  // For now, we'll simulate sending and return the message that would be sent
  console.log(`\n📱 SMS PAYMENT REQUEST to ${toPerson.phone}:`);
  console.log('─'.repeat(40));
  console.log(message);
  console.log('─'.repeat(40));
  console.log('');
  
  res.json({ 
    success: true, 
    message,
    phone: toPerson.phone,
    note: '✅ In production, this would send via Twilio SMS service. The recipient would receive this text message on their phone.'
  });
});

// Get all groups
app.get('/api/groups', (req, res) => {
  res.json(groups);
});

// Create a group
app.post('/api/groups', (req, res) => {
  const { name, members } = req.body;
  const newGroup = {
    id: nextGroupId++,
    name,
    members,
    createdAt: new Date().toISOString()
  };
  groups.push(newGroup);
  res.json(newGroup);
});

// Add group expense (splits evenly including tax and tip)
app.post('/api/groups/:groupId/expense', (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const { description, subtotal, tax, tip, paidBy } = req.body;
  
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const totalAmount = parseFloat(subtotal) + parseFloat(tax || 0) + parseFloat(tip || 0);
  const amountPerPerson = totalAmount / group.members.length;
  
  // Create expense with even split
  const newExpense = {
    id: nextExpenseId++,
    description: `${description} (${group.name})`,
    amount: totalAmount,
    subtotal: parseFloat(subtotal),
    tax: parseFloat(tax || 0),
    tip: parseFloat(tip || 0),
    paidBy,
    splitWith: group.members,
    groupId: groupId,
    isGroupExpense: true,
    amountPerPerson: amountPerPerson,
    date: new Date().toISOString()
  };
  
  expenses.push(newExpense);
  res.json(newExpense);
});

// Delete a group
app.delete('/api/groups/:id', (req, res) => {
  const id = parseInt(req.params.id);
  groups = groups.filter(group => group.id !== id);
  res.json({ success: true });
});

// Send expense notification SMS
app.post('/api/notify-expense', async (req, res) => {
  const { to, personName, amount, owedTo, expenseName } = req.body;
  
  // Validate phone number format
  if (!to || typeof to !== 'string') {
    console.error('❌ Invalid phone number:', to);
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid phone number format' 
    });
  }
  
  // Check if phone number matches E.164 format (+[country code][number])
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(to)) {
    console.error('❌ Phone number does not match E.164 format:', to);
    return res.status(400).json({ 
      success: false, 
      error: `Phone number must be in E.164 format (e.g., +15551234567). Received: ${to}` 
    });
  }
  
  // Format the SMS message
  const message = `Hi ${personName}! You owe $${amount} to ${owedTo} for "${expenseName}". Track your balance on Spender!`;
  
  console.log(`📱 SMS Notification:`);
  console.log(`   To: ${to}`);
  console.log(`   Message: ${message}`);
  console.log(`   Details: ${personName} owes $${amount} to ${owedTo} for "${expenseName}"`);
  
  // Check if real SMS sending is enabled
  const enableSMS = process.env.ENABLE_SMS === 'true';
  
  if (enableSMS) {
    try {
      // Real SMS with Twilio
      const twilio = await import('twilio');
      const client = twilio.default(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      
      console.log(`✅ Real SMS sent! SID: ${result.sid}`);
      
      res.json({ 
        success: true, 
        message: 'SMS notification sent (real)',
        to: to,
        preview: message,
        format: 'E.164',
        sid: result.sid
      });
    } catch (error) {
      console.error('❌ Twilio error:', error.message);
      res.status(500).json({ 
        success: false, 
        error: `Failed to send SMS: ${error.message}` 
      });
    }
  } else {
    // Simulated SMS (development mode)
    console.log(`ℹ️  SMS simulated (ENABLE_SMS=false)`);
    
    res.json({ 
      success: true, 
      message: 'SMS notification sent (simulated - not real)',
      to: to,
      preview: message,
      format: 'E.164',
      note: 'Set ENABLE_SMS=true in .env to send real SMS'
    });
  }
});

// AI Assistant Chat
app.post('/api/assistant/chat', async (req, res) => {
  const { message, userName } = req.body;
  
  // Check if assistant is enabled
  if (!process.env.OPENAI_API_KEY) {
    return res.status(400).json({ 
      error: 'AI Assistant not configured. Add OPENAI_API_KEY to .env file.' 
    });
  }
  
  try {
    // Build context for AI
    const context = {
      userName: userName || 'User',
      friends: people.map(p => p.name),
      expenses: expenses,
      balances: balances
    };
    
    console.log(`🤖 Assistant request from ${userName}: "${message}"`);
    
    // Process message with AI
    const response = await processMessage(message, context);
    const choice = response.choices[0];
    
    // Check if AI wants to call a function
    if (choice.finish_reason === 'function_call') {
      const functionCall = choice.message.function_call;
      const functionName = functionCall.name;
      const args = JSON.parse(functionCall.arguments);
      
      console.log(`🔧 Function call: ${functionName}`, args);
      
      // Execute the requested function
      let result = {};
      
      switch (functionName) {
        case 'add_expense':
          // Add the expense
          const newExpense = {
            id: nextExpenseId++,
            description: args.description,
            amount: parseFloat(args.amount),
            paidBy: args.paidBy === 'user' ? userName : args.paidBy,
            splitWith: args.splitWith.map(name => name === 'user' ? userName : name),
            date: new Date().toISOString()
          };
          expenses.push(newExpense);
          
          result = {
            success: true,
            expense: newExpense,
            message: `Added $${newExpense.amount} expense "${newExpense.description}"`
          };
          break;
          
        case 'get_balance':
          // Calculate balance between user and specified person
          const personName = args.personName;
          let userOwes = 0;
          let personOwes = 0;
          
          expenses.forEach(expense => {
            const splitAmount = expense.amount / expense.splitWith.length;
            
            if (expense.paidBy === userName && expense.splitWith.includes(personName)) {
              personOwes += splitAmount;
            } else if (expense.paidBy === personName && expense.splitWith.includes(userName)) {
              userOwes += splitAmount;
            }
          });
          
          const netBalance = personOwes - userOwes;
          
          result = {
            personName: personName,
            youOwe: userOwes,
            theyOwe: personOwes,
            netBalance: netBalance,
            message: netBalance > 0 
              ? `${personName} owes you $${netBalance.toFixed(2)}`
              : netBalance < 0
              ? `You owe ${personName} $${Math.abs(netBalance).toFixed(2)}`
              : `You're all settled up with ${personName}!`
          };
          break;
          
        case 'list_expenses':
          const limit = args.limit || 5;
          const recentExpenses = expenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
          
          result = {
            expenses: recentExpenses,
            count: recentExpenses.length,
            total: expenses.length
          };
          break;
          
        case 'get_all_balances':
          // Calculate all balances
          const balanceMap = {};
          
          expenses.forEach(expense => {
            const splitAmount = expense.amount / expense.splitWith.length;
            expense.splitWith.forEach(person => {
              if (person !== expense.paidBy) {
                const key = `${person}->${expense.paidBy}`;
                balanceMap[key] = (balanceMap[key] || 0) + splitAmount;
              }
            });
          });
          
          result = {
            balances: balanceMap,
            summary: Object.entries(balanceMap).map(([key, amount]) => {
              const [from, to] = key.split('->');
              return `${from} owes ${to} $${amount.toFixed(2)}`;
            })
          };
          break;
          
        default:
          result = { error: 'Unknown function' };
      }
      
      console.log(`✅ Function result:`, result);
      
      // Generate natural language response
      const followUpMessage = await generateFollowUp(functionName, result, message);
      
      res.json({
        message: followUpMessage,
        action: functionName,
        result: result
      });
    } else {
      // Just a text response, no function call
      res.json({
        message: choice.message.content
      });
    }
  } catch (error) {
    console.error('❌ Assistant error:', error);
    res.status(500).json({ 
      error: error.message,
      hint: error.message.includes('API key') 
        ? 'Add your OpenAI API key to the .env file as OPENAI_API_KEY=sk-...'
        : 'Check server logs for details'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`🤖 AI Assistant: ${process.env.OPENAI_API_KEY ? '✅ Enabled' : '❌ Disabled (add OPENAI_API_KEY to .env)'}`);
});
