# Quick Start Guide

Get the Request Management System running in 5 minutes.

## Prerequisites

- Node.js installed
- MongoDB installed and running
- Terminal/Command Prompt

## Step 1: Clone/Download Project

Ensure you're in the project directory:
```bash
cd /Users/deepikathangarasu/REPR-01/001
```

## Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Seed database with test users
npm run seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

**Note**: If MongoDB is not running, start it first:
```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Or manually
mongod --config /usr/local/etc/mongod.conf
```

## Step 3: Setup Frontend (New Terminal)

```bash
# Navigate to frontend from project root
cd frontend

# Install dependencies
npm install

# Start frontend application
npm start
```

Frontend will open automatically at `http://localhost:3000`

## Step 4: Login

Use any of these test accounts:

**Employee Account**
- Email: `employee@test.com`
- Password: `password123`

**Manager Account**
- Email: `manager@test.com`
- Password: `password123`

**CEO Account**
- Email: `ceo@test.com`
- Password: `password123`

## Test the Complete Flow

### 1. Create a Request (as Employee)

1. Login as Employee
2. Click "Create Request"
3. Fill in:
   - Title: "Test Request"
   - Type: "HR Request"
   - Description: "This is a test request"
4. Submit
5. Note the 5-minute revert timer

### 2. Forward Request (as Manager)

1. Logout and login as Manager (`manager@test.com` / `password123`)
2. Click on the request in Dashboard
3. Add comments
4. Click "Forward"

### 3. Forward Again (as HR)

1. Logout and login as HR (`hr@test.com` / `password123`)
2. Click on the request
3. Click "Forward"

### 4. Forward to CEO (as General Manager)

1. Login as General Manager (`gm@test.com` / `password123`)
2. Forward the request

### 5. Approve (as CEO)

1. Login as CEO (`ceo@test.com` / `password123`)
2. Click on the request
3. Click "Approve"

## Test Query System

1. Login as Manager
2. Open any pending request
3. Click "Send Query"
4. Select Employee as recipient
5. Send message
6. Logout and login as Employee
7. Go to "Queries"
8. View and respond to query

## Test 5-Minute Revert

1. Login as Employee
2. Create a new request
3. Immediately click on it
4. See "Revert Request" section with countdown
5. Click "Revert/Cancel Request"
6. Confirm the request is cancelled

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists in backend folder
- Check port 5000 is not in use

### Frontend won't start
- Check backend is running first
- Verify `.env` file exists in frontend folder
- Check port 3000 is not in use

### Can't login
- Ensure you ran `npm run seed` in backend
- Check MongoDB connection
- Verify backend is running

### No requests showing
- Create a request as Employee first
- Check browser console for errors
- Verify API_URL in frontend/.env

## Next Steps

- Explore different roles and permissions
- Test the flagged requests feature (requires waiting or manual DB update)
- Customize the email settings in backend/.env
- Review the code structure
- Read the full README.md for detailed documentation

## Common Commands

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run seed         # Seed test data
npm start            # Start production server
```

### Frontend
```bash
cd frontend
npm start            # Start development server
npm run build        # Build for production
```

## Default URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## Support

For detailed information, see:
- Main README.md - Complete documentation
- backend/README.md - Backend specific docs
- frontend/README.md - Frontend specific docs
