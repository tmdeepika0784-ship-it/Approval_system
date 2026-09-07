# Vercel Deployment Guide - Request Management System

## Overview

This guide explains how to deploy your Request Management System to production using Vercel (frontend) and a backend hosting service.

## Architecture

- **Frontend**: Vercel (React app)
- **Backend**: Railway/Render/Heroku (Node.js + MongoDB)
- **Database**: MongoDB Atlas (cloud database)

---

## Part 1: Deploy Backend (Choose One Platform)

### Option A: Deploy to Railway (Recommended)

#### Step 1: Prepare Backend for Production

Already done - your backend is production-ready!

#### Step 2: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Create a FREE cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Replace `<password>` with your actual password
7. Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/request_management`

#### Step 3: Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Click on the deployed service
6. Go to "Variables" tab
7. Add these environment variables:

```
PORT=5001
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@requestmanagement.com
FRONTEND_URL=your_vercel_frontend_url
NODE_ENV=production
```

8. In "Settings" tab:
   - Root Directory: `/backend`
   - Start Command: `npm start`
9. Click "Deploy"
10. Copy your Railway backend URL (e.g., `https://your-app.railway.app`)

#### Step 4: Seed Database (One-time)

After deployment, you need to add test users:

1. In Railway dashboard, click on your service
2. Go to "Deployments" tab
3. Click on the latest deployment
4. Click "View Logs"
5. Open a new terminal locally and run:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run seed command
railway run npm run seed
```

---

### Option B: Deploy to Render

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: request-management-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables (same as Railway above)
7. Click "Create Web Service"
8. Copy your Render backend URL

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment

Create/update `frontend/.env.production`:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 3: Deploy Frontend

```bash
# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy (first time - will ask questions)
vercel

# Answer the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? request-management-frontend
# - Directory? ./ (current directory)
# - Override settings? No

# Production deployment
vercel --prod
```

### Step 4: Configure Environment Variables on Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api`
   - **Environments**: Check "Production", "Preview", "Development"
5. Click "Save"

### Step 5: Redeploy Frontend

```bash
vercel --prod
```

Your frontend will be live at: `https://your-project.vercel.app`

---

## Part 3: Update Backend FRONTEND_URL

1. Go back to Railway (or Render) dashboard
2. Update `FRONTEND_URL` environment variable to your Vercel URL:
   ```
   FRONTEND_URL=https://your-project.vercel.app
   ```
3. This will automatically redeploy the backend

---

## Part 4: Verify Deployment

### Test Backend

Visit: `https://your-backend-url.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-09-06T..."
}
```

### Test Frontend

1. Visit: `https://your-project.vercel.app`
2. Try logging in with:
   - Email: `employee@test.com`
   - Password: `password123`

---

## Part 5: Database Seeding (If needed)

If you didn't seed via Railway CLI, you can manually add users to MongoDB Atlas:

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Select your database → `users` collection
4. Click "Insert Document"
5. Use the seed data from `backend/src/utils/seed.js`

---

## Quick Commands Reference

### Deploy Frontend to Vercel
```bash
cd frontend
vercel --prod
```

### Deploy Backend (if using Git)
```bash
# Just push to GitHub
git add .
git commit -m "Deploy updates"
git push origin main

# Railway/Render will auto-deploy
```

### View Logs
```bash
# Railway
railway logs

# Or view in dashboard
```

---

## Troubleshooting

### Frontend can't connect to backend

1. Check CORS settings in backend
2. Verify `FRONTEND_URL` in backend environment variables
3. Check `REACT_APP_API_URL` in Vercel environment variables
4. Look at browser console for errors

### Backend not starting

1. Check environment variables are set correctly
2. Verify MongoDB Atlas connection string
3. Check logs in Railway/Render dashboard
4. Ensure MongoDB Atlas allows connections from anywhere (IP: 0.0.0.0/0)

### Database connection issues

1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Confirm

### Email not working

1. Enable 2FA on Gmail
2. Create App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use the 16-character app password in `EMAIL_PASSWORD`

---

## Environment Variables Checklist

### Backend (Railway/Render)
- [ ] PORT
- [ ] MONGODB_URI (MongoDB Atlas connection string)
- [ ] JWT_SECRET
- [ ] JWT_EXPIRE
- [ ] EMAIL_HOST
- [ ] EMAIL_PORT
- [ ] EMAIL_USER
- [ ] EMAIL_PASSWORD
- [ ] EMAIL_FROM
- [ ] FRONTEND_URL (Your Vercel URL)
- [ ] NODE_ENV=production

### Frontend (Vercel)
- [ ] REACT_APP_API_URL (Your Railway/Render backend URL + /api)

---

## Costs

- **Vercel**: Free tier (sufficient for testing)
- **Railway**: $5/month (after free trial)
- **Render**: Free tier available (may sleep after inactivity)
- **MongoDB Atlas**: Free tier (512MB)

**Total Cost**: $0-5/month for a production deployment

---

## Alternative: Deploy Both on Railway

If you prefer to deploy everything on Railway:

1. Create two services:
   - Service 1: Backend (root: `/backend`)
   - Service 2: Frontend (root: `/frontend`)
2. Configure build commands:
   - Backend: `npm install` → `npm start`
   - Frontend: `npm install && npm run build` → `npx serve -s build`
3. Set environment variables for both services

---

## Next Steps After Deployment

1. Test all features in production
2. Set up custom domain (optional)
3. Configure monitoring/alerts
4. Set up backup strategy for MongoDB
5. Review security settings
6. Set up CI/CD pipeline

---

## Support

If you face issues:
1. Check deployment logs
2. Verify all environment variables
3. Test API endpoints individually
4. Check browser console for errors
5. Review CORS configuration

