// Netlify serverless function wrapper for Express app
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data storage (for demo - use a database in production)
let people = [];
let expenses = [];
let groups = [];
let balances = {};
let users = [];
let userProfile = null;

let nextPersonId = 1;
let nextExpenseId = 1;
let nextGroupId = 1;
let nextUserId = 1;

// Import the server routes
// Note: This is a simplified version for serverless deployment
// You'll need to adapt your server/index.js routes here

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Spender API is running' });
});

// Add all your API routes here from server/index.js
// For now, this is a placeholder

module.exports.handler = serverless(app);
