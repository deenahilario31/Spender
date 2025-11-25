# 🚀 Spender Deployment Guide

## Overview

Spender is a full-stack application with:
- **Frontend:** React + Vite
- **Backend:** Express.js API server
- **Features:** SMS notifications (Twilio), AI Assistant (OpenAI)

## 🎯 Recommended Deployment Options

### Option 1: Render.com (Recommended - Free Tier Available)

**Best for:** Full-stack apps with backend

#### Steps:

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy Backend on Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name:** spender-api
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `node server/index.js`
     - **Add Environment Variables:**
       - `TWILIO_ACCOUNT_SID`
       - `TWILIO_AUTH_TOKEN`
       - `TWILIO_PHONE_NUMBER`
       - `ENABLE_SMS=true`
       - `OPENAI_API_KEY` (optional)

3. **Deploy Frontend on Render:**
   - Click "New +" → "Static Site"
   - Connect same GitHub repo
   - Configure:
     - **Name:** spender-app
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** `dist`
     - **Add Environment Variable:**
       - `VITE_API_URL=<your-backend-url>`

4. **Update Frontend API Calls:**
   - Replace `/api/` with your backend URL
   - Or use a proxy configuration

---

### Option 2: Vercel (Frontend) + Railway (Backend)

**Best for:** Separate frontend/backend deployment

#### Frontend (Vercel):

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configure:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### Backend (Railway):

1. **Go to:** https://railway.app
2. **New Project** → Deploy from GitHub
3. **Add Environment Variables**
4. **Deploy**

---

### Option 3: Netlify (Static) + Separate Backend

**Note:** Netlify is primarily for static sites. Backend needs separate hosting.

#### Steps:

1. **Build Frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **Deploy Backend Separately:**
   - Use Render, Railway, or Heroku
   - Update API URLs in frontend

---

## 📋 Pre-Deployment Checklist

### ✅ Required Files (Already Created):
- [x] `.gitignore` - Protects secrets
- [x] `netlify.toml` - Netlify configuration
- [x] `.env.example` - Environment template

### ✅ Environment Variables to Set:

**Backend:**
```env
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_PHONE_NUMBER=<your-number>
ENABLE_SMS=true
OPENAI_API_KEY=<your-key> (optional)
```

**Frontend:**
```env
VITE_API_URL=<your-backend-url>
```

### ✅ Code Updates Needed:

1. **Update API URLs:**
   - Replace hardcoded `/api/` with environment variable
   - Use `import.meta.env.VITE_API_URL` in React

2. **CORS Configuration:**
   - Update `server/index.js` to allow your frontend domain

3. **Database (Optional):**
   - Current: In-memory storage (resets on restart)
   - Recommended: Add MongoDB, PostgreSQL, or Firebase

---

## 🔧 Quick Deploy with Render (Easiest)

### Step-by-Step:

1. **Create GitHub Repository:**
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   gh repo create spender-app --public --source=. --remote=origin --push
   ```

2. **Go to Render.com:**
   - Sign up with GitHub
   - Click "New +" → "Web Service"
   - Select your repo

3. **Configure Service:**
   ```
   Name: spender
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: node server/index.js
   ```

4. **Add Environment Variables:**
   - Click "Environment"
   - Add all your .env variables

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Get your URL: `https://spender.onrender.com`

---

## 🌐 Update Frontend for Production

Create `src/config.js`:

```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

Update all fetch calls:

```javascript
// Before:
fetch('/api/expenses', ...)

// After:
import { API_URL } from './config';
fetch(`${API_URL}/api/expenses`, ...)
```

---

## 🔒 Security Checklist

- [x] `.env` in `.gitignore`
- [x] No secrets in code
- [x] Environment variables on host
- [ ] CORS configured for production domain
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Rate limiting (optional)

---

## 📊 Post-Deployment

### Test Your Deployment:

1. **Frontend:**
   - Visit your deployed URL
   - Test login/signup
   - Add expenses
   - Check if data persists

2. **Backend:**
   - Test API endpoints
   - Check SMS notifications
   - Verify AI Assistant

3. **Environment Variables:**
   - Confirm Twilio works
   - Confirm OpenAI works (if configured)

### Monitor:

- Check logs on your hosting platform
- Monitor API usage
- Track errors

---

## 💾 Database Recommendation

**Current:** In-memory (data lost on restart)

**Upgrade to:**

1. **MongoDB Atlas (Free Tier):**
   - 512MB storage
   - Perfect for this app
   - Easy integration

2. **PostgreSQL (Render/Railway):**
   - Relational database
   - Free tier available
   - Good for structured data

3. **Firebase (Google):**
   - Real-time database
   - Free tier generous
   - Easy authentication

---

## 🎯 Recommended: Render.com Full-Stack

**Why Render:**
- ✅ Free tier available
- ✅ Supports Node.js backend
- ✅ Auto-deploys from GitHub
- ✅ Environment variables
- ✅ HTTPS automatic
- ✅ Easy to use

**Deploy Now:**
1. Push to GitHub
2. Connect to Render
3. Add environment variables
4. Deploy!

---

## 📞 Need Help?

**Common Issues:**

1. **API not connecting:**
   - Check CORS settings
   - Verify API URL
   - Check environment variables

2. **SMS not working:**
   - Verify Twilio credentials
   - Check phone number format
   - Ensure ENABLE_SMS=true

3. **Build fails:**
   - Check Node version (18+)
   - Verify all dependencies installed
   - Check build logs

---

## 🚀 Ready to Deploy?

Choose your platform and follow the steps above!

**Recommended for beginners:** Render.com (full-stack in one place)

**Need help?** Check the platform's documentation or reach out!
