# Request Management & Approval System

A complete, production-ready MERN stack application for managing and approving requests with role-based workflows, SLA tracking, and query management.

## Features

### Authentication & Authorization
- Secure JWT-based authentication
- Role-based access control (8 roles)
- Password hashing with bcrypt
- Password reset via email

### Roles & Permissions
- **Employee**: Create requests, view own requests, revert within 5 minutes, respond to queries
- **Manager**: Forward, reject, send queries (cannot approve)
- **HR**: Forward, reject, send queries (cannot approve)
- **IT & Research**: Forward, reject, send queries (cannot approve)
- **Finance**: Forward, reject, send queries (cannot approve)
- **Accountant**: Forward, reject, send queries (cannot approve)
- **General Manager**: Forward, reject, send queries (cannot approve)
- **CEO**: Approve, reject, send queries (cannot forward)

### Request Workflow
- **HR Request**: Employee → Manager → HR → General Manager → CEO
- **IT & Research Request**: Employee → Manager → IT & Research → General Manager → CEO
- **Finance Request**: Employee → Manager → Accountant → General Manager → CEO

### Key Functionality

#### 5-Minute Revert Window
- Employees can revert/cancel newly submitted requests
- Strictly enforced 5-minute window from submission
- Backend validation prevents bypassing
- Real-time countdown display
- Automatically disabled after deadline

#### SLA Management
- Working hours tracking (9 AM - 6 PM, weekdays only)
- Excludes weekends and holidays
- Automatic reminder after 9 working hours
- Automatic flagging after 10 working hours
- Escalation for flagged requests

#### Query System
- Role-based query permissions
- Employee → Manager
- HR → Manager, Employee
- IT & Research → Manager, Employee
- Finance → Manager, Employee
- Accountant → Finance, Manager, Employee
- General Manager → All except CEO
- CEO → All roles
- Query tracking and response management

#### Request Details & Workflow Visualization
- Complete request information
- Visual workflow timeline
- Current stage highlighting
- Action history with comments
- SLA status display

### User Interface
- Clean, professional enterprise design
- Responsive layout
- Minimal dashboards (recent requests only)
- Status badges and indicators
- Modal dialogs for actions
- Table-based data display

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Bcrypt password hashing
- Nodemailer for emails

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Context API for state management
- Responsive CSS

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/request_management
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@requestmanagement.com
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

5. Seed the database with test users:
```bash
npm run seed
```

6. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Verify `.env` file exists with:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend application:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Test Accounts

After seeding, use these credentials to test different roles:

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@test.com | password123 |
| Manager | manager@test.com | password123 |
| HR | hr@test.com | password123 |
| IT & Research | it@test.com | password123 |
| Finance | finance@test.com | password123 |
| Accountant | accountant@test.com | password123 |
| General Manager | gm@test.com | password123 |
| CEO | ceo@test.com | password123 |

## Usage Guide

### As Employee
1. Login with employee credentials
2. Navigate to "Create Request"
3. Fill in request details and submit
4. View request status in "All Requests"
5. Revert within 5 minutes if needed
6. Respond to queries from approvers

### As Approver (Manager, HR, IT, Finance, Accountant, GM)
1. Login with appropriate credentials
2. View pending requests in Dashboard
3. Click on request to see details
4. Forward with comments to next stage
5. Reject if necessary (with comments)
6. Send queries to relevant roles
7. Monitor flagged requests in "Flagged Requests"

### As CEO
1. Login with CEO credentials
2. View requests awaiting final approval
3. Review complete workflow history
4. Approve or reject with comments
5. Send queries to any role if needed

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth & error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (SLA, workflow, email)
│   │   ├── utils/           # Utilities & seed data
│   │   └── server.js        # Entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service
│   │   ├── styles/          # CSS files
│   │   ├── utils/           # Helper functions
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── .env
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Requests
- `POST /api/requests` - Create request (Employee only)
- `GET /api/requests` - Get all requests
- `GET /api/requests/dashboard` - Get dashboard data
- `GET /api/requests/flagged` - Get flagged requests
- `GET /api/requests/:id` - Get single request
- `POST /api/requests/:id/forward` - Forward request
- `POST /api/requests/:id/approve` - Approve request (CEO only)
- `POST /api/requests/:id/reject` - Reject request
- `POST /api/requests/:id/revert` - Revert request (Employee, 5 min)

### Queries
- `POST /api/queries` - Send query
- `GET /api/queries` - Get queries (sent/received)
- `GET /api/queries/:id` - Get single query
- `POST /api/queries/:id/respond` - Respond to query
- `GET /api/queries/request/:requestId` - Get queries for request

### Users
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/by-role/:role` - Get users by role

## Key Implementation Details

### Backend Security
- JWT tokens for authentication
- Password hashing with bcrypt (10 rounds)
- Role-based middleware for authorization
- Input validation
- Error handling middleware

### SLA Calculation
- Backend service runs hourly
- Calculates working hours only
- Excludes weekends and holidays
- Stores reminder and flag timestamps
- Cannot be bypassed from frontend

### 5-Minute Revert
- Deadline calculated on server
- Stored in database
- Backend validation on revert endpoint
- Frontend shows real-time countdown
- Automatically disabled after expiry

### Workflow Management
- Defined workflow paths per request type
- Automatic stage progression
- Handler assignment
- Complete audit trail

## Testing

### Manual Testing Steps

1. **Employee Flow**
   - Create a request
   - Verify 5-minute revert window
   - Try reverting after 5 minutes (should fail)
   - Check request in "All Requests"

2. **Approval Flow**
   - Login as Manager → Forward
   - Login as HR/IT/Accountant → Forward
   - Login as General Manager → Forward
   - Login as CEO → Approve

3. **Query Flow**
   - Send query from Manager to Employee
   - Login as Employee → Respond to query
   - Verify query status updates

4. **SLA Testing**
   - Create request and wait (or manually update lastActivityAt)
   - Verify flagging after 10 working hours
   - Check "Flagged Requests" section

## Production Deployment

### Environment Variables
- Use strong JWT secret
- Configure production MongoDB URI
- Set up email service (SendGrid, AWS SES, etc.)
- Set NODE_ENV=production

### Security Considerations
- Enable CORS for specific origins
- Use HTTPS
- Implement rate limiting
- Add request validation
- Regular security updates

### Monitoring
- Log errors and activities
- Monitor SLA service
- Track request processing times
- Database backups

## License

This project is provided as-is for educational and commercial use.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
