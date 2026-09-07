# Git & GitHub Setup Guide

You need to push your code to GitHub before deploying to Railway/Vercel.

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `request-management-system`
3. Description: `Employee Request Management & Approval System`
4. Select **Private** (recommended) or Public
5. **DO NOT** check "Add README", ".gitignore", or "license"
6. Click "Create repository"
7. Keep this page open!

## Step 2: Initialize Git in Your Project

Open terminal and run these commands:

```bash
# Navigate to your project
cd /Users/deepikathangarasu/001

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Request Management System"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/request-management-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify

1. Go to your GitHub repository page
2. Refresh the page
3. You should see all your files uploaded!

## What if I get an error?

### Error: "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/request-management-system.git
```

### Error: Authentication failed
1. GitHub may ask for username and password
2. **Password is NOT your GitHub password**
3. You need a Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a name: "Deploy App"
   - Check "repo" scope
   - Click "Generate token"
   - Copy the token (save it somewhere safe!)
   - Use this token as your password

### Error: "Nothing to commit"
```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Alternative: Use GitHub Desktop (Easier)

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and login with GitHub
3. File → Add Local Repository
4. Choose: `/Users/deepikathangarasu/001`
5. Click "Create repository"
6. Click "Publish repository"
7. Choose name and privacy
8. Click "Publish repository"
9. Done! ✅

## After Setup

Once your code is on GitHub:
1. Go back to `QUICK_DEPLOY.md`
2. Follow Step 2 (Deploy Backend to Railway)
3. Railway will be able to access your GitHub repository

