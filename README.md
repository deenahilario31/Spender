# Spender - Shared Expense Tracker

A modern web app to track shared expenses between friends. Perfect for splitting dinner bills and keeping track of who owes whom.

## Features

- 💰 Track expenses and who paid
- 👥 Manage balances between friends
- 📊 See who owes money at a glance
- 🔄 Request and settle payments
- 📱 SMS reminders - Send text messages to friends about what they owe
- 📞 Store phone numbers for easy contact
- 📸 **Receipt Scanner** - Take a photo of receipts to automatically extract items and prices
- 🍽️ **Item Assignment** - Assign specific dishes/drinks to individual people
- 🎨 Clean, modern UI with OCR technology

## How to Use

1. **Add Friends**: Start by adding the names of friends you share expenses with
   - Optionally include their phone number for SMS reminders

2. **Record Expenses** - Two ways:
   
   **Option A: Manual Entry**
   - Description (e.g., "Dinner at Italian restaurant")
   - Amount paid
   - Who paid
   - Who to split the bill between
   
   **Option B: Scan Receipt** 📸
   - Click "Scan Receipt" button
   - Take a photo or upload an image of your receipt
   - The app will automatically extract items and prices using OCR
   - Assign each dish/drink to the person who ordered it
   - Specify who paid the bill
   - The app calculates exactly what each person owes!

3. **View Balances**: Switch to the "Balances" tab to see:
   - Summary of each person's net balance
   - Detailed breakdown of who owes whom
   - Itemized expenses show which items were assigned to each person

4. **Send Reminders**: Click "Remind" to send an SMS reminder to a friend about what they owe

5. **Settle Up**: Click "Settle Up" to mark a debt as paid

## SMS Feature

The app includes SMS reminder functionality. Currently, it simulates sending messages (you'll see them in the server console). To enable real SMS:

1. Sign up for a service like [Twilio](https://www.twilio.com/)
2. Get your API credentials
3. Update the `/api/send-reminder` endpoint in `server/index.js` to use the Twilio SDK
4. Add your credentials to environment variables (never commit them to git!)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

This will start both the backend (port 3001) and frontend (port 5173).

3. Open your browser to `http://localhost:5173`

## Receipt Scanner Feature

The receipt scanner uses **Tesseract.js** for OCR (Optical Character Recognition):

- **How it works**: Upload a photo of your receipt, and the app extracts item names and prices
- **Assign items**: Each item can be assigned to a specific person
- **Accurate splitting**: Instead of splitting evenly, each person pays only for what they ordered
- **Tips for best results**:
  - Take clear, well-lit photos
  - Ensure the receipt is flat and in focus
  - Works best with printed receipts (not handwritten)

## Tech Stack

- **Frontend**: React, TailwindCSS, Lucide Icons
- **Backend**: Express.js
- **OCR**: Tesseract.js for receipt scanning
- **Build Tool**: Vite
