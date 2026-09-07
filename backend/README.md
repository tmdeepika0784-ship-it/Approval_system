# Request Management System - Backend

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/request_management
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@requestmanagement.com
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

4. Seed the database with test users:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Test Accounts

After seeding, you can login with these accounts:

- **Employee**: employee@test.com / password123
- **Manager**: manager@test.com / password123
- **HR**: hr@test.com / password123
- **IT & Research**: it@test.com / password123
- **Finance**: finance@test.com / password123
- **Accountant**: accountant@test.com / password123
- **General Manager**: gm@test.com / password123
- **CEO**: ceo@test.com / password123

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password/:token` - Reset password

### Users
- PUT `/api/users/profile` - Update profile
- PUT `/api/users/change-password` - Change password
- GET `/api/users/by-role/:role` - Get users by role

### Requests
- POST `/api/requests` - Create request (Employee only)
- GET `/api/requests` - Get all requests
- GET `/api/requests/dashboard` - Get dashboard data
- GET `/api/requests/flagged` - Get flagged requests
- GET `/api/requests/:id` - Get single request
- POST `/api/requests/:id/forward` - Forward request
- POST `/api/requests/:id/approve` - Approve request (CEO only)
- POST `/api/requests/:id/reject` - Reject request
- POST `/api/requests/:id/revert` - Revert request (Employee only, 5 min window)

### Queries
- POST `/api/queries` - Send query
- GET `/api/queries` - Get queries (sent/received)
- GET `/api/queries/:id` - Get single query
- POST `/api/queries/:id/respond` - Respond to query
- GET `/api/queries/request/:requestId` - Get queries for request

## Features

### Role-Based Access Control
- Strict permissions enforced for each role
- JWT-based authentication

### Request Workflow
- Automated workflow routing based on request type
- Complete workflow tracking and visualization

### SLA Management
- Working hours calculation (9 AM - 6 PM, weekdays only)
- Automatic reminder after 9 working hours
- Automatic flagging after 10 working hours
- Excludes weekends and holidays

### 5-Minute Revert Window
- Employees can revert newly submitted requests
- Strictly enforced 5-minute deadline
- Backend validation prevents bypassing

### Query System
- Role-based query permissions
- Query tracking and response management

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth & error handling
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utilities & seed data
│   └── server.js       # Application entry point
├── .env.example        # Environment variables template
└── package.json        # Dependencies
```
