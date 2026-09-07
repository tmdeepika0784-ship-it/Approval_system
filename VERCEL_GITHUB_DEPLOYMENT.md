# Deploy to Vercel via GitHub - Complete Step-by-Step Guide

## ⚠️ Important Note About This Project

This project has **TWO parts** that need different deployment approaches:

1. **Frontend (React)** → Deploy to Vercel ✅
2. **Backend (Node.js + MongoDB)** → Deploy to Railway (NOT Vercel)

Vercel is **primarily for frontends**. Your backend needs a service like Railway because it requires:
- Persistent MongoDB connection
- Long-running processes (auto-forwarding, SLA monitoring)
- File uploads

---

## 🎯 Complete Deployment Plan

### Part A: Deploy Frontend to Vercel (via GitHub)
### Part B: Deploy Backend to Railway (via GitHub)

Let's start!

---

# PART A: FRONTEND TO VERCEL

## Step 1: Push Your Code to GitHub

### 1.1 Initialize Git Repository

Open Terminal and run:

```bash
# Navigate to your project
cd /Users/deepikathangarasu/001

# Initialize git
git init

# Create .gitignore file (to exclude unnecessary files)
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Uploads
backend/uploads/*
!backend/uploads/.gitkeep
EOF

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Request Management System"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `request-management-system` (or any name you prefer)
3. **Description**: `Employee Request Management & Approval System`
4. **Visibility**: Choose **Private** (recommended) or Public
5. **DO NOT** check any boxes (README, .gitignore, license)
6. Click **"Create repository"**

### 1.3 Push to GitHub

After creating the repository, GitHub shows you commands. Use these:

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/request-management-system.git

# Push your code
git branch -M main
git push -u origin main
```

**If you get authentication error:**
- GitHub requires a Personal Access Token (not password)
- Go to: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Name: "Deploy App"
- Check "repo" scope
- Generate and copy the token
- Use this token as your password when pushing

### 1.4 Verify on GitHub

1. Go to your repository URL: `https://github.com/YOUR_USERNAME/request-management-system`
2. Refresh the page
3. You should see all your files (backend, frontend, markdown files)

✅ **Code is now on GitHub!**

---

## Step 2: Setup MongoDB Atlas (Cloud Database)

Your backend needs a database. Let's set it up:

### 2.1 Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (use Google sign-in for fastest setup)
3. Choose **FREE** M0 cluster when prompted

### 2.2 Create Database Cluster

1. Click **"Build a Database"**
2. Choose **M0 (FREE)** tier
3. Cloud Provider: **AWS** (recommended)
4. Region: Choose closest to you
5. Cluster Name: `RequestManagement` (or leave default)
6. Click **"Create"** (takes 2-3 minutes)

### 2.3 Create Database User

1. You'll see a security setup screen
2. Under "Authentication Method": Choose **Username and Password**
3. Username: `admin`
4. Password: Click **"Autogenerate Secure Password"**
5. **COPY AND SAVE THIS PASSWORD SOMEWHERE SAFE!**
6. Click **"Create User"**

### 2.4 Setup Network Access

1. Under "Where would you like to connect from?"
2. Click **"My Local Environment"**
3. Click **"Add My Current IP Address"**
4. Then also click **"Add a Different IP Address"**
5. IP Address: `0.0.0.0/0` (allows from anywhere)
6. Description: `Allow all`
7. Click **"Add Entry"**
8. Click **"Finish and Close"**

### 2.5 Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you saved earlier
7. Add database name before the `?`:
   ```
   mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/request_management?retryWrites=true&w=majority
   ```

✅ **Save this connection string - you'll need it soon!**

---

## Step 3: Deploy Backend to Railway

Railway is better than Vercel for your backend.

### 3.1 Create Railway Account

1. Go to https://railway.app
2. Click **"Login"**
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub

### 3.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. If asked, authorize Railway to access repositories
4. Select your repository: `request-management-system`
5. Railway will start deploying automatically

### 3.3 Configure Backend Service

1. You'll see a service card (may say "failed" - that's OK for now)
2. Click on the service card
3. Click **"Settings"** tab
4. Scroll to **"Service"** section
5. **Root Directory**: Enter `/backend`
6. **Start Command**: Enter `npm start`
7. Click outside to save

### 3.4 Add Environment Variables

1. Click **"Variables"** tab
2. Click **"RAW Editor"** (easier to paste all at once)
3. Delete any existing content
4. Paste this (update with your values):

```env
PORT=5001
MONGODB_URI=mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/request_management?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key-change-this-to-something-random-at-least-32-characters
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@requestmanagement.com
FRONTEND_URL=https://temporary-url.vercel.app
NODE_ENV=production
```

5. Click **"Update Variables"**
6. Service will automatically redeploy (wait 2-3 minutes)

### 3.5 Get Backend URL

1. Click **"Settings"** tab
2. Scroll to **"Networking"** section
3. Under **"Public Networking"**
4. Click **"Generate Domain"**
5. Copy the URL (e.g., `https://request-management-backend-production.up.railway.app`)

✅ **Save this backend URL!**

**Write it here: __________________________________________**

### 3.6 Seed Database with Test Users

Install Railway CLI:

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway (opens browser)
railway login

# Link to your project
cd /Users/deepikathangarasu/001
railway link
# Select your project from the list

# Seed the database
cd backend
railway run npm run seed
```

You should see: **"✅ Database seeded successfully!"**

Test accounts created:
- employee@test.com / password123
- manager@test.com / password123
- ceo@test.com / password123
- hr@test.com / password123
- gm@test.com / password123

### 3.7 Verify Backend is Running

Open browser and visit:
```
https://your-backend-url.up.railway.app/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2026-09-06T..."}
```

✅ **Backend deployed successfully!**

---

## Step 4: Deploy Frontend to Vercel via GitHub

Now let's deploy the React frontend!

### 4.1 Update Frontend Configuration

Update the production API URL:

```bash
# Update the file
cat > /Users/deepikathangarasu/001/frontend/.env.production << 'EOF'
REACT_APP_API_URL=https://your-backend-url.up.railway.app/api
EOF
```

**Replace `your-backend-url.up.railway.app` with your actual Railway URL!**

Save and commit this change:

```bash
cd /Users/deepikathangarasu/001
git add frontend/.env.production
git commit -m "Update production API URL"
git push origin main
```

### 4.2 Login to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### 4.3 Import Project from GitHub

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see "Import Git Repository"
3. Find your repository: `request-management-system`
4. Click **"Import"**

### 4.4 Configure Frontend Deployment

Vercel will show configuration options:

1. **Project Name**: `request-management-frontend` (or any name)
2. **Framework Preset**: Should auto-detect "Create React App"
3. **Root Directory**: Click **"Edit"** → Enter `frontend` → **Include source files**
4. **Build Command**: `npm run build` (should be default)
5. **Output Directory**: `build` (should be default)
6. **Install Command**: `npm install` (should be default)

### 4.5 Add Environment Variables

Before clicking Deploy:

1. Expand **"Environment Variables"** section
2. Add variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.up.railway.app/api`
   - (Use your Railway backend URL)
3. Select environments: **Production**, **Preview**, **Development**
4. Click **"Add"**

### 4.6 Deploy!

1. Click **"Deploy"** button
2. Wait 2-4 minutes while Vercel builds and deploys
3. You'll see build logs
4. When complete, you'll see **"Congratulations!"**

### 4.7 Get Frontend URL

Copy your Vercel URL (e.g.):
```
https://request-management-frontend.vercel.app
```

Or
```
https://request-management-frontend-username.vercel.app
```

✅ **Frontend deployed on Vercel!**

**Write your URL here: __________________________________________**

---

## Step 5: Update Backend with Frontend URL

Now connect backend to frontend:

### 5.1 Update Railway Environment

1. Go back to Railway dashboard: https://railway.app
2. Click on your backend service
3. Click **"Variables"** tab
4. Find `FRONTEND_URL`
5. Update it with your Vercel URL:
   ```
   FRONTEND_URL=https://request-management-frontend.vercel.app
   ```
6. Click away to save
7. Backend will automatically redeploy (wait 2 minutes)

---

## Step 6: Test Your Deployment 🎉

### 6.1 Test Backend

Visit: `https://your-backend-url.up.railway.app/api/health`

✅ Should return: `{"status":"ok",...}`

### 6.2 Test Frontend

Visit: `https://your-frontend-url.vercel.app`

✅ Should show login page

### 6.3 Test Login

1. On the login page, enter:
   - Email: `employee@test.com`
   - Password: `password123`
2. Click **Login**
3. Should redirect to dashboard

✅ **SUCCESS! Your app is fully deployed!**

### 6.4 Test Creating a Request

1. Click **"Create Request"**
2. Fill in the form
3. Submit
4. Should see the request in your dashboard

✅ **Everything works!**

---

## 🎉 Deployment Complete!

Your application is now live:

**Frontend (Vercel)**: https://your-frontend.vercel.app  
**Backend (Railway)**: https://your-backend.up.railway.app  
**Database (MongoDB Atlas)**: Cloud-hosted

Anyone can access your app from anywhere!

---

## 📝 Important URLs - Save These!

Fill in your URLs:

```
┌─────────────────────────────────────────────┐
│  PRODUCTION URLS                            │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (Vercel):                         │
│  https://________________________           │
│                                             │
│  Backend (Railway):                         │
│  https://________________________           │
│                                             │
│  Backend API:                               │
│  https://________________________/api       │
│                                             │
│  GitHub Repo:                               │
│  https://github.com/_____________           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔄 How to Update Your App Later

### Update Frontend

```bash
cd /Users/deepikathangarasu/001

# Make your changes to frontend files

# Commit and push
git add .
git commit -m "Update frontend"
git push origin main

# Vercel automatically deploys!
# Check Vercel dashboard for deployment status
```

### Update Backend

```bash
cd /Users/deepikathangarasu/001

# Make your changes to backend files

# Commit and push
git add .
git commit -m "Update backend"
git push origin main

# Railway automatically deploys!
# Check Railway dashboard for deployment status
```

Both services have **automatic deployment** from GitHub!

---

## 🆘 Troubleshooting

### Problem: Frontend shows "Network Error"

**Solution:**
1. Check if backend is running (visit `/api/health`)
2. Verify `REACT_APP_API_URL` in Vercel settings:
   - Go to Vercel dashboard
   - Select your project
   - Settings → Environment Variables
   - Verify the URL is correct
3. Redeploy frontend:
   - Vercel dashboard → Deployments
   - Click ⋯ on latest deployment → Redeploy

### Problem: "Cannot login" or "User not found"

**Solution:**
1. Make sure you ran the seed command:
   ```bash
   railway run npm run seed
   ```
2. Check MongoDB Atlas:
   - Go to Database → Browse Collections
   - Look for `users` collection
   - Should have 5 users

### Problem: "CORS Error" in browser console

**Solution:**
1. Check `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. No trailing slash in the URL
3. Wait for backend to redeploy (2-3 minutes)

### Problem: Backend not starting on Railway

**Solution:**
1. Check Railway logs:
   - Click on service → View Logs
2. Common issues:
   - MongoDB connection string incorrect
   - Missing environment variables
   - Wrong root directory (should be `/backend`)

### Problem: Can't push to GitHub (authentication failed)

**Solution:**
1. Create Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Generate new token (classic)
   - Select "repo" scope
   - Copy token
2. Use token as password when pushing

---

## 💰 Cost Summary

- **MongoDB Atlas**: FREE (512MB)
- **Railway**: ~$5/month after free trial ($5 credit included)
- **Vercel**: FREE (generous free tier)
- **GitHub**: FREE

**Total: ~$5/month**

---

## ✅ Checklist

Track your progress:

- [ ] Git initialized locally
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Connection string saved
- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] Environment variables added
- [ ] Backend domain generated
- [ ] Database seeded with test users
- [ ] Backend health check passes
- [ ] Frontend `.env.production` updated
- [ ] Changes pushed to GitHub
- [ ] Vercel account created
- [ ] Frontend deployed to Vercel
- [ ] Environment variables added to Vercel
- [ ] Frontend URL copied
- [ ] `FRONTEND_URL` updated in Railway
- [ ] Can access frontend URL
- [ ] Can login with test account
- [ ] Can create and manage requests
- [ ] All features working

---

## 🎓 What You've Accomplished

✅ Set up Git and GitHub  
✅ Deployed React app to Vercel  
✅ Deployed Node.js API to Railway  
✅ Set up cloud MongoDB database  
✅ Connected all services together  
✅ Automatic deployment pipeline  
✅ Professional production environment  

**Your app is now accessible worldwide! 🌍**

