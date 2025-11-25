# SMS Setup Guide for Spender

## 🔔 Current Status: SMS Simulation Mode

Your app is currently in **development mode** - SMS notifications are **simulated** (logged to console) but **not actually sent** to phones.

### What You See:
```
✅ "Expense added! SMS sent to: John"
✅ Console logs show SMS details
❌ No actual text message delivered
```

## 📱 To Send Real SMS Messages

Follow these steps to enable real SMS delivery:

### Step 1: Sign Up for Twilio

1. Go to https://www.twilio.com/try-twilio
2. Create a free account
3. Verify your phone number
4. Get a free trial phone number

### Step 2: Get Your Credentials

From your Twilio Console Dashboard:
- **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Auth Token**: `your_auth_token_here`
- **Phone Number**: `+1234567890` (your Twilio number)

### Step 3: Install Dependencies

```bash
cd /Users/deenahilario/Desktop/Spender
npm install twilio dotenv
```

### Step 4: Create .env File

Create a file named `.env` in the project root:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Enable real SMS sending
ENABLE_SMS=true
```

**⚠️ IMPORTANT:** Add `.env` to your `.gitignore` to keep credentials secret!

### Step 5: Restart Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 6: Test It!

1. Create an expense
2. Split with a friend who has a phone number
3. Check console for: `✅ Real SMS sent! SID: SMxxxx`
4. Friend receives actual text message!

## 💰 Twilio Pricing

### Free Trial:
- $15.50 credit
- Can send ~500 SMS messages
- Must verify recipient phone numbers first

### After Trial:
- ~$0.0075 per SMS (less than 1 cent)
- Pay as you go
- No monthly fees

## 🧪 Testing Without Real SMS

### Option 1: Keep Simulation Mode (Current)
```bash
# In .env file:
ENABLE_SMS=false
```
- SMS logged to console
- No actual messages sent
- Free, no setup needed

### Option 2: Twilio Test Credentials
Use Twilio test credentials for development:
- Test Account SID
- Test Auth Token
- Messages appear in Twilio console but don't deliver

## 🔍 Troubleshooting

### "SMS sent" but no message received?

**Check:**
1. Is `ENABLE_SMS=true` in `.env`?
2. Did you restart the server after adding `.env`?
3. Is phone number in E.164 format (+15551234567)?
4. Check server console for errors

### Twilio Errors:

**"Unverified number"** (Free Trial)
- Solution: Verify recipient phone in Twilio console

**"Invalid phone number"**
- Solution: Ensure format is +[country code][number]
- Example: +15551234567

**"Insufficient funds"**
- Solution: Add credits to Twilio account

## 📊 Console Output

### Simulation Mode (Current):
```
📱 SMS Notification:
   To: +15551234567
   Message: Hi John! You owe $20.00...
ℹ️  SMS simulated (ENABLE_SMS=false)
```

### Real SMS Mode:
```
📱 SMS Notification:
   To: +15551234567
   Message: Hi John! You owe $20.00...
✅ Real SMS sent! SID: SM1234567890abcdef
```

## 🎯 Quick Start Checklist

- [ ] Sign up for Twilio
- [ ] Get Account SID, Auth Token, Phone Number
- [ ] Run `npm install twilio dotenv`
- [ ] Create `.env` file with credentials
- [ ] Set `ENABLE_SMS=true`
- [ ] Add `.env` to `.gitignore`
- [ ] Restart server
- [ ] Test with an expense
- [ ] Check console for success message
- [ ] Verify friend receives SMS

## 🔒 Security Best Practices

1. **Never commit `.env` file to git**
2. **Keep Auth Token secret**
3. **Use environment variables in production**
4. **Rotate credentials if exposed**
5. **Use Twilio's IP whitelisting in production**

## 📞 Support

- **Twilio Docs**: https://www.twilio.com/docs/sms
- **Twilio Console**: https://console.twilio.com
- **Twilio Support**: https://support.twilio.com

---

## Current Setup Summary

✅ SMS simulation working
✅ Phone number formatting (E.164)
✅ Validation and error handling
✅ Console logging
⏳ Real SMS delivery (requires Twilio setup)

To enable real SMS, follow steps above!
