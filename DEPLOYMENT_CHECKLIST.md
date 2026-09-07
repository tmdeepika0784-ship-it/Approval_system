# 📋 Deployment Checklist

Use this checklist to track your deployment progress.

---

## Pre-Deployment Setup

- [ ] Code is working locally
- [ ] Backend runs on `http://localhost:5001`
- [ ] Frontend runs on `http://localhost:3000`
- [ ] Can login with test accounts
- [ ] Git is initialized
- [ ] Code is pushed to GitHub

**If any unchecked**: See `GIT_SETUP_GUIDE.md`

---

## Phase 1: Database Setup (MongoDB Atlas)

- [ ] Created MongoDB Atlas account
- [ ] Created FREE M0 cluster
- [ ] Created database user (username + password saved)
- [ ] Configured network access (0.0.0.0/0 allowed)
- [ ] Got connection string
- [ ] Tested connection string format:
  ```
  mongodb+srv://username:password@cluster.mongodb.net/request_management
  ```

**Estimated Time**: 15 minutes  
**If stuck**: See `QUICK_DEPLOY.md` Step 1

---

## Phase 2: Backend Deployment (Railway)

- [ ] Created Railway account (via GitHub)
- [ ] Created new project from GitHub repo
- [ ] Configured root directory: `/backend`
- [ ] Configured start command: `npm start`
- [ ] Added all environment variables:
  - [ ] PORT
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] JWT_EXPIRE
  - [ ] EMAIL_HOST
  - [ ] EMAIL_PORT
  - [ ] EMAIL_USER
  - [ ] EMAIL_PASSWORD
  - [ ] EMAIL_FROM
  - [ ] FRONTEND_URL (temporary)
  - [ ] NODE_ENV
- [ ] Backend deployed successfully
- [ ] Generated public domain
- [ ] Backend URL saved: `___________________________`
- [ ] Tested health endpoint: `https://your-backend.up.railway.app/api/health`
- [ ] Health check returns `{"status":"ok"}`
- [ ] Installed Railway CLI locally
- [ ] Logged into Railway CLI
- [ ] Linked project with Railway CLI
- [ ] Seeded database: `railway run npm run seed`
- [ ] Seed successful (saw success message)

**Estimated Time**: 15 minutes  
**If stuck**: See `QUICK_DEPLOY.md` Step 2

---

## Phase 3: Frontend Deployment (Vercel)

- [ ] Updated `frontend/.env.production` with Railway backend URL
- [ ] Saved the file
- [ ] Installed Vercel CLI: `npm install -g vercel`
- [ ] Logged into Vercel: `vercel login`
- [ ] Navigated to frontend directory
- [ ] Ran `vercel` (preview deployment)
- [ ] Answered all prompts
- [ ] Preview deployment successful
- [ ] Ran `vercel --prod` (production deployment)
- [ ] Production deployment successful
- [ ] Frontend URL saved: `___________________________`
- [ ] Can access frontend in browser
- [ ] Login page loads correctly
- [ ] No console errors in browser

**Estimated Time**: 10 minutes  
**If stuck**: See `QUICK_DEPLOY.md` Step 3

---

## Phase 4: Connect Frontend & Backend

- [ ] Went back to Railway dashboard
- [ ] Selected backend service
- [ ] Updated `FRONTEND_URL` with Vercel URL
- [ ] Backend redeployed automatically
- [ ] Waited for redeploy to complete (2-3 minutes)

**Estimated Time**: 5 minutes  
**If stuck**: See `QUICK_DEPLOY.md` Step 4

---

## Phase 5: Email Configuration (Optional)

- [ ] Enabled 2FA on Gmail account
- [ ] Created App Password in Google Account
- [ ] Saved 16-character app password
- [ ] Updated `EMAIL_PASSWORD` in Railway
- [ ] Updated `EMAIL_USER` in Railway
- [ ] Updated `EMAIL_FROM` in Railway
- [ ] Backend redeployed

**Estimated Time**: 5 minutes  
**If stuck**: See `QUICK_DEPLOY.md` Step 5

---

## Phase 6: Testing

### Backend Tests
- [ ] Health endpoint works: `/api/health`
- [ ] Returns proper JSON response
- [ ] No error in Railway logs

### Frontend Tests
- [ ] Website loads without errors
- [ ] Login page displays correctly
- [ ] Can login with `employee@test.com` / `password123`
- [ ] Dashboard loads
- [ ] No network errors in browser console

### Full Flow Tests
- [ ] Can create a request as Employee
- [ ] Request appears in dashboard
- [ ] Can logout and login as Manager
- [ ] Can see the request
- [ ] Can add comments
- [ ] Can forward request
- [ ] Email notifications work (if configured)

**Estimated Time**: 10 minutes  
**If stuck**: See `QUICK_DEPLOY.md` Step 6

---

## Post-Deployment

- [ ] Bookmark production URLs
- [ ] Share URLs with team (if applicable)
- [ ] Document any custom configurations
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)

---

## Troubleshooting Status

If something isn't working, mark what you've checked:

### Frontend Issues
- [ ] Checked browser console for errors
- [ ] Verified `REACT_APP_API_URL` in Vercel
- [ ] Redeployed frontend with `vercel --prod`
- [ ] Cleared browser cache

### Backend Issues
- [ ] Checked Railway deployment logs
- [ ] Verified all environment variables are set
- [ ] MongoDB connection string is correct
- [ ] Health endpoint returns 200 OK
- [ ] No errors in Railway logs

### Database Issues
- [ ] MongoDB Atlas cluster is running
- [ ] Network access allows 0.0.0.0/0
- [ ] Connection string password is correct
- [ ] Database name is included in connection string
- [ ] Seed command ran successfully
- [ ] Can see `users` collection in MongoDB Atlas

### CORS Issues
- [ ] `FRONTEND_URL` in backend matches Vercel URL exactly
- [ ] No trailing slash in URLs
- [ ] Backend has redeployed after URL update
- [ ] Cleared browser cache

---

## Success Criteria ✅

Your deployment is successful when ALL these work:

1. ✅ Frontend loads at Vercel URL
2. ✅ Backend health check returns OK
3. ✅ Can login with test accounts
4. ✅ Can create a request
5. ✅ Can see requests in dashboard
6. ✅ Can forward requests
7. ✅ No errors in browser console
8. ✅ No errors in Railway logs

---

## URLs Reference Card

Fill this out as you deploy:

```
┌─────────────────────────────────────────────────┐
│         DEPLOYMENT URLS                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ Frontend (Vercel):                              │
│ https://________________________________        │
│                                                 │
│ Backend (Railway):                              │
│ https://________________________________        │
│                                                 │
│ Backend API:                                    │
│ https://________________________________/api    │
│                                                 │
│ MongoDB Atlas:                                  │
│ mongodb+srv://___________________________       │
│                                                 │
│ GitHub Repository:                              │
│ https://github.com/______________________       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Time Estimate

- **Total Time**: 45-60 minutes
- **Database Setup**: 15 min
- **Backend Deploy**: 15 min
- **Frontend Deploy**: 10 min
- **Configuration**: 5 min
- **Email Setup**: 5 min (optional)
- **Testing**: 10 min

---

## Next Steps After Deployment

1. Share URLs with users
2. Create additional admin accounts
3. Configure custom domain (optional)
4. Set up monitoring/alerts
5. Review security settings
6. Plan for scaling

---

## Support Resources

- **Quick Deploy Guide**: `QUICK_DEPLOY.md`
- **Full Guide**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Git Setup**: `GIT_SETUP_GUIDE.md`
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com

