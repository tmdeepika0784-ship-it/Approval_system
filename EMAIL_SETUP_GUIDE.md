# Email Configuration Guide

## Error: "Username and Password not accepted"

This error occurs because Gmail requires special App Passwords for third-party applications.

---

## Option 1: Gmail with App Password (Recommended for Production)

### Step-by-Step Setup:

**1. Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Find "2-Step Verification"
   - Click "Get started" and follow the setup

**2. Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other" as the device and name it "Request Management System"
   - Click "Generate"
   - You'll get a 16-character password like: `abcd efgh ijkl mnop`

**3. Update `.env` file:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  (remove spaces from app password)
   EMAIL_FROM=youremail@gmail.com
   ```

**4. Restart Backend:**
   ```bash
   # Stop current backend (Ctrl+C)
   # Then restart:
   cd backend
   npm run dev
   ```

---

## Option 2: Ethereal Email (Testing Only - No Real Emails)

Ethereal is a fake SMTP service for testing. Emails are captured but not actually sent.

### Quick Setup:

**1. Get Ethereal Credentials:**
   - Go to: https://ethereal.email/create
   - Copy the credentials shown

**2. Update `.env` file:**
   ```env
   EMAIL_HOST=smtp.ethereal.email
   EMAIL_PORT=587
   EMAIL_USER=<username from ethereal>
   EMAIL_PASSWORD=<password from ethereal>
   EMAIL_FROM=noreply@ethereal.email
   ```

**3. Restart Backend**

**4. View Test Emails:**
   - All emails will be shown in the Ethereal web interface
   - Perfect for development/testing
   - No real emails sent

---

## Option 3: Other Email Services

### SendGrid (Free Tier: 100 emails/day)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=verified-sender@yourdomain.com
```

### Mailgun (Free Tier: 100 emails/day)
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=<your-mailgun-password>
EMAIL_FROM=noreply@your-domain.mailgun.org
```

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=youremail@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=youremail@outlook.com
```

---

## Testing the Configuration

After updating `.env` and restarting the backend, test it:

**1. Try Changing Password:**
   - Go to Profile → Change Password
   - Click "Send OTP to Email"
   - Check your email (or Ethereal inbox)

**2. Check Backend Logs:**
   - Should see: `Email sent to user@example.com`
   - If error, check credentials again

**3. Common Issues:**

   **"Username and Password not accepted"**
   → You're using regular password instead of App Password
   → Solution: Generate App Password (see Option 1)

   **"Connection timeout"**
   → Wrong EMAIL_HOST or EMAIL_PORT
   → Solution: Double-check SMTP settings

   **"Must issue a STARTTLS command first"**
   → Wrong port or security settings
   → Solution: Use port 587 for TLS

   **"Sender address rejected"**
   → EMAIL_FROM doesn't match EMAIL_USER
   → Solution: Make them the same for Gmail

---

## Quick Fix for Development (Ethereal)

If you just want to test quickly without real emails:

1. Open browser: https://ethereal.email/create
2. Copy the credentials shown
3. Update your `.env`:
   ```env
   EMAIL_HOST=smtp.ethereal.email
   EMAIL_PORT=587
   EMAIL_USER=<paste username here>
   EMAIL_PASSWORD=<paste password here>
   EMAIL_FROM=noreply@ethereal.email
   ```
4. Restart backend: `npm run dev`
5. Test password change - check Ethereal inbox in browser

---

## Current Setup

Your current `.env` needs one of the above configurations to work.

The dummy credentials won't work with Gmail or any real SMTP service.

---

## Recommendation

**For Development/Testing:**
→ Use **Ethereal Email** (fastest, no setup needed)

**For Production:**
→ Use **Gmail with App Password** (free, reliable)
→ Or use **SendGrid/Mailgun** (better for high volume)

---

## Need Help?

If you're still having issues:
1. Double-check the credentials in `.env`
2. Make sure there are no spaces in the password
3. Restart the backend after changing `.env`
4. Check the backend console for error messages
