# 🚀 Quick Deploy to Production - Step by Step

Follow these exact steps to deploy your application.

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account
- [ ] Gmail account (for sending emails)
- [ ] Git installed on your computer
- [ ] Code pushed to GitHub repository

---

## Step 1: Create MongoDB Atlas Database (15 minutes)

### 1.1 Sign Up
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or email
3. Choose **FREE** M0 Cluster

### 1.2 Create Cluster
1. Click "Build a Database"
2. Select **M0 FREE** tier
3. Choose a cloud provider (AWS recommended)
4. Choose region closest to you
5. Cluster Name: `RequestManagement`
6. Click "Create Cluster" (takes 1-3 minutes)

### 1.3 Create Database User
1. In "Security" → "Database Access"
2. Click "Add New Database User"
3. Username: `admin`
4. Password: Click "Autogenerate Secure Password" (SAVE THIS!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

### 1.4 Allow Network Access
1. In "Security" → "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm

### 1.5 Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/
   ```
5. Replace `<password>` with the password you saved
6. Add database name at end: `request_management`
7. Final string looks like:
   ```
   mongodb+srv://admin:YourPassword123@cluster0.xxxxx.mongodb.net/request_management
   ```

✅ **Save this connection string - you'll need it soon!**

---

## Step 2: Deploy Backend to Railway (10 minutes)

### 2.1 Sign Up & Create Project
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway
4. Click "New Project"
5. Select "Deploy from GitHub repo"
6. Connect your GitHub account if not connected
7. Select your repository
8. Railway will automatically detect and try to deploy

### 2.2 Configure Backend Service
1. Click on the service card (should show "backend")
2. Click "Settings" tab
3. Under "Build & Deploy":
   - **Root Directory**: `/backend`
   - **Start Command**: `npm start`
4. Click "Deploy" if needed

### 2.3 Add Environment Variables
1. Click on your backend service
2. Go to "Variables" tab
3. Click "New Variable" or "RAW Editor"
4. Paste these variables (update with your values):

```bash
PORT=5001
MONGODB_URI=mongodb+srv://admin:YourPassword@cluster.mongodb.net/request_management
JWT_SECRET=your-super-secret-key-min-32-characters-long-change-this
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@requestmanagement.com
FRONTEND_URL=https://temporary-will-update-later.vercel.app
NODE_ENV=production
```

5. Click "Add" or "Save"
6. Service will automatically redeploy

### 2.4 Get Backend URL
1. Go to "Settings" tab
2. Under "Networking" → "Public Networking"
3. Click "Generate Domain"
4. Copy the URL (e.g., `https://your-backend-production.up.railway.app`)

✅ **Save this backend URL!**

### 2.5 Seed Database with Test Users
1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and link project:
   ```bash
   railway login
   # Opens browser to authenticate
   
   railway link
   # Select your project
   ```

3. Seed the database:
   ```bash
   cd /Users/deepikathangarasu/001/backend
   railway run npm run seed
   ```

You should see: "✅ Database seeded successfully!"

---

## Step 3: Deploy Frontend to Vercel (10 minutes)

### 3.1 Update Frontend Configuration
1. Open `frontend/.env.production` file
2. Update the API URL with your Railway backend URL:
   ```
   REACT_APP_API_URL=https://your-backend-production.up.railway.app/api
   ```
3. Save the file

### 3.2 Install Vercel CLI
```bash
npm install -g vercel
```

### 3.3 Deploy Frontend
```bash
# Navigate to frontend
cd /Users/deepikathangarasu/001/frontend

# Login to Vercel
vercel login
# Opens browser - login with GitHub or email

# Deploy (preview)
vercel

# Answer the prompts:
# Set up and deploy? → Yes
# Which scope? → Select your account
# Link to existing project? → No
# Project name? → request-management-frontend (or press Enter)
# In which directory is your code located? → ./
# Want to modify settings? → No

# Wait for deployment...

# Deploy to production
vercel --prod
```

### 3.4 Get Frontend URL
After deployment completes, you'll see:
```
✅ Production: https://request-management-frontend.vercel.app
```

✅ **Save this frontend URL!**

---

## Step 4: Update Backend with Frontend URL (5 minutes)

### 4.1 Update Railway Environment Variable
1. Go back to Railway dashboard
2. Click on backend service
3. Go to "Variables" tab
4. Find `FRONTEND_URL`
5. Update it with your Vercel URL:
   ```
   FRONTEND_URL=https://request-management-frontend.vercel.app
   ```
6. Click "Add" or "Update"
7. Backend will automatically redeploy

---

## Step 5: Setup Gmail App Password (Optional - for email notifications)

### 5.1 Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled

### 5.2 Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. App name: `Request Management System`
3. Click "Create"
4. Copy the 16-character password (no spaces)

### 5.3 Update Railway Variables
1. Go to Railway → Backend service → Variables
2. Update `EMAIL_PASSWORD` with the app password
3. Update `EMAIL_USER` with your Gmail address
4. Save

---

## Step 6: Test Your Deployment 🎉

### 6.1 Test Backend
Visit: `https://your-backend-production.up.railway.app/api/health`

Should show:
```json
{
  "status": "ok",
  "timestamp": "2026-09-06T..."
}
```

### 6.2 Test Frontend
1. Visit: `https://request-management-frontend.vercel.app`
2. You should see the login page
3. Login with:
   - Email: `employee@test.com`
   - Password: `password123`

### 6.3 Test Full Flow
1. Create a request as Employee
2. Logout and login as Manager (`manager@test.com` / `password123`)
3. Forward the request
4. Check if everything works!

---

## 🎉 Success! Your App is Live!

**Frontend**: https://request-management-frontend.vercel.app  
**Backend**: https://your-backend-production.up.railway.app

---

## Common Issues & Solutions

### ❌ Frontend shows "Network Error"
**Solution**: 
1. Check backend is running on Railway
2. Verify `REACT_APP_API_URL` in Vercel environment variables
3. Redeploy frontend: `vercel --prod`

### ❌ "Cannot connect to database"
**Solution**:
1. Check MongoDB Atlas is running
2. Verify connection string in Railway variables
3. Check Network Access in MongoDB Atlas (allow 0.0.0.0/0)

### ❌ "CORS Error" in browser console
**Solution**:
1. Update `FRONTEND_URL` in Railway backend variables
2. Make sure it matches your Vercel URL exactly
3. Wait for backend to redeploy

### ❌ "Cannot find module" error
**Solution**:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Redeploy

### ❌ Users can't login
**Solution**:
1. Make sure you ran `railway run npm run seed`
2. Check MongoDB has the `users` collection
3. Try seeding again

---

## Update Deployed App Later

### Update Frontend
```bash
cd frontend
# Make your changes, then:
vercel --prod
```

### Update Backend
```bash
# Just push to GitHub
git add .
git commit -m "Update backend"
git push origin main
# Railway auto-deploys!
```

---

## Cost Summary

- **MongoDB Atlas**: FREE (512MB)
- **Railway**: $5/month (after $5 free credit)
- **Vercel**: FREE (generous limits)

**Total**: ~$5/month for production hosting

---

## Need Help?

Check the full deployment guide: `VERCEL_DEPLOYMENT_GUIDE.md`

