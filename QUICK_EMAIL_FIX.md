# Quick Email Fix - 535 Error

## The Problem
Gmail is rejecting the login because you need an **App Password**, not your regular password.

---

## ⚡ Quick Fix (Choose One)

### Option A: Use Ethereal (Fastest - 2 minutes)
**For testing only - no real emails sent**

1. **Open browser:** https://ethereal.email/create
   
2. **Copy the credentials** shown on the page

3. **Update `backend/.env`:**
   ```env
   EMAIL_HOST=smtp.ethereal.email
   EMAIL_PORT=587
   EMAIL_USER=(paste username from ethereal)
   EMAIL_PASSWORD=(paste password from ethereal)
   EMAIL_FROM=noreply@ethereal.email
   ```

4. **Restart backend** (the terminal running `npm run dev`)
   - Press `Ctrl+C` to stop
   - Run `npm run dev` again

5. **Test it:**
   ```bash
   cd backend
   node test-email.js
   ```

6. **View emails:** Go back to https://ethereal.email and check inbox

---

### Option B: Use Gmail (Real Emails - 5 minutes)

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification" → Turn it ON

2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" → Select "Other (Custom name)"
   - Type "Request Management" → Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

3. **Update `backend/.env`:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  (remove spaces!)
   EMAIL_FROM=youremail@gmail.com
   ```

4. **Restart backend:**
   - Press `Ctrl+C` in backend terminal
   - Run `npm run dev` again

5. **Test it:**
   ```bash
   cd backend
   node test-email.js
   ```

6. **Check your Gmail inbox** for test email

---

## 🧪 Test Your Configuration

After updating `.env` and restarting backend:

```bash
cd backend
node test-email.js
```

**If successful, you'll see:**
```
✅ SMTP connection successful!
✅ Test email sent successfully!
```

**If it fails:**
- Double-check credentials in `.env`
- Make sure no spaces in password
- Restart backend after changes

---

## 🎯 Recommendation

**Right now (testing):** Use **Ethereal** (2 minutes, no setup)

**Later (production):** Switch to **Gmail** with App Password

---

## After Setup

Once email is working, test the password change feature:

1. Go to: http://localhost:3000/profile
2. Click "Change Password" tab
3. Click "Send OTP to Email"
4. Check your email (or Ethereal inbox)
5. Enter OTP and new password
6. Success! ✅

---

## Still Having Issues?

Run the test script and send me the error:
```bash
cd backend
node test-email.js
```

Common issues:
- **"Username and Password not accepted"** → Use App Password for Gmail
- **"Connection timeout"** → Wrong host/port
- **"Must issue STARTTLS"** → Use port 587
- **Credentials not updated** → Check `.env` file, restart backend
