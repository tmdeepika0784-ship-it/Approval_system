# Request Management System - Project Map

## 🗂️ Complete Project Structure

```
/Users/deepikathangarasu/REPR-01/001/
│
├── 📄 README.md                         # Main documentation
├── 📄 QUICKSTART.md                     # Quick start guide
├── 📄 IMPLEMENTATION_SUMMARY.md         # Features verification
├── 📄 SETUP_COMPLETE.md                 # Setup instructions
├── 📄 PROJECT_MAP.md                    # This file
│
├── 📁 backend/                          # Node.js + Express Backend
│   ├── 📄 package.json                  # Dependencies & scripts
│   ├── 📄 .env                          # Environment variables
│   ├── 📄 .env.example                  # Environment template
│   ├── 📄 .gitignore                    # Git ignore rules
│   ├── 📄 README.md                     # Backend documentation
│   │
│   └── 📁 src/
│       ├── 📄 server.js                 # Application entry point
│       │
│       ├── 📁 config/
│       │   ├── 📄 database.js           # MongoDB connection
│       │   └── 📄 roles.js              # Role definitions & permissions
│       │
│       ├── 📁 models/
│       │   ├── 📄 User.js               # User schema (8 roles)
│       │   ├── 📄 Request.js            # Request schema + workflow
│       │   ├── 📄 Query.js              # Query schema
│       │   └── 📄 Holiday.js            # Holiday schema (SLA)
│       │
│       ├── 📁 controllers/
│       │   ├── 📄 authController.js     # Register, Login, Reset
│       │   ├── 📄 userController.js     # Profile, Password
│       │   ├── 📄 requestController.js  # CRUD, Workflow, SLA
│       │   └── 📄 queryController.js    # Send, Respond
│       │
│       ├── 📁 routes/
│       │   ├── 📄 authRoutes.js         # /api/auth/*
│       │   ├── 📄 userRoutes.js         # /api/users/*
│       │   ├── 📄 requestRoutes.js      # /api/requests/*
│       │   └── 📄 queryRoutes.js        # /api/queries/*
│       │
│       ├── 📁 middleware/
│       │   ├── 📄 auth.js               # JWT verification
│       │   └── 📄 errorHandler.js       # Error handling
│       │
│       ├── 📁 services/
│       │   ├── 📄 emailService.js       # Email notifications
│       │   ├── 📄 slaService.js         # SLA calculation & flagging
│       │   └── 📄 workflowService.js    # Workflow logic
│       │
│       └── 📁 utils/
│           └── 📄 seed.js               # Database seeding
│
└── 📁 frontend/                         # React Frontend
    ├── 📄 package.json                  # Dependencies & scripts
    ├── 📄 .env                          # API URL configuration
    ├── 📄 .gitignore                    # Git ignore rules
    ├── 📄 README.md                     # Frontend documentation
    │
    ├── 📁 public/
    │   └── 📄 index.html                # HTML template
    │
    └── 📁 src/
        ├── 📄 index.js                  # React entry point
        ├── 📄 App.js                    # Main app + routing
        │
        ├── 📁 components/
        │   ├── 📄 Sidebar.js            # Navigation sidebar
        │   └── 📄 PrivateRoute.js       # Route protection
        │
        ├── 📁 context/
        │   └── 📄 AuthContext.js        # Auth state management
        │
        ├── 📁 pages/
        │   ├── 📄 Login.js              # Login page
        │   ├── 📄 Register.js           # Registration page
        │   ├── 📄 Dashboard.js          # Dashboard (role-based)
        │   ├── 📄 CreateRequest.js      # Request creation form
        │   ├── 📄 AllRequests.js        # Request list + filters
        │   ├── 📄 RequestDetails.js     # Request details + actions
        │   ├── 📄 FlaggedRequests.js    # SLA-flagged requests
        │   ├── 📄 Queries.js            # Query management
        │   └── 📄 Profile.js            # User profile
        │
        ├── 📁 services/
        │   └── 📄 api.js                # API service layer
        │
        ├── 📁 styles/
        │   ├── 📄 App.css               # Main styles
        │   ├── 📄 Auth.css              # Authentication styles
        │   └── 📄 Sidebar.css           # Sidebar styles
        │
        └── 📁 utils/
            └── 📄 helpers.js            # Helper functions
```

---

## 🔑 Key Files & Their Purpose

### Backend Core Files

| File | Purpose | Lines | Complexity |
|------|---------|-------|------------|
| `server.js` | Application entry, middleware setup, SLA service | ~60 | Medium |
| `database.js` | MongoDB connection configuration | ~20 | Low |
| `roles.js` | Role hierarchy, permissions, workflow paths | ~120 | High |

### Models (Database Schemas)

| Model | Collections | Purpose |
|-------|-------------|---------|
| `User.js` | users | 8 roles, authentication, profile |
| `Request.js` | requests | Workflow, SLA tracking, 5-min revert |
| `Query.js` | queries | Query system between roles |
| `Holiday.js` | holidays | SLA working day exclusions |

### Controllers (Business Logic)

| Controller | Routes | Key Functions |
|------------|--------|---------------|
| `authController.js` | 5 | register, login, getMe, forgotPassword, resetPassword |
| `userController.js` | 3 | updateProfile, changePassword, getUsersByRole |
| `requestController.js` | 9 | create, getAll, forward, approve, reject, revert, getFlagged |
| `queryController.js` | 5 | send, getAll, getById, respond, getByRequest |

### Services (Complex Logic)

| Service | Purpose | Key Features |
|---------|---------|--------------|
| `slaService.js` | SLA tracking | Working hours calculation, holiday exclusion, auto-flagging |
| `workflowService.js` | Workflow management | Path determination, stage progression, handler assignment |
| `emailService.js` | Email notifications | Password reset, query notifications, status updates |

### Frontend Components

| Component | Type | Purpose |
|-----------|------|---------|
| `Sidebar.js` | Layout | Role-based navigation menu |
| `PrivateRoute.js` | Guard | Protected route authentication |
| `AuthContext.js` | State | Global authentication state |

### Frontend Pages

| Page | Route | Access | Features |
|------|-------|--------|----------|
| `Login.js` | /login | Public | JWT authentication |
| `Register.js` | /register | Public | User registration |
| `Dashboard.js` | /dashboard | Private | Recent requests, stats |
| `CreateRequest.js` | /create-request | Employee | Request form, validation |
| `AllRequests.js` | /requests | Private | List, filters, pagination |
| `RequestDetails.js` | /requests/:id | Private | Workflow, actions, queries |
| `FlaggedRequests.js` | /flagged-requests | Approvers | SLA-breached requests |
| `Queries.js` | /queries | Private | Send/receive queries |
| `Profile.js` | /profile | Private | Update phone, change password |

---

## 🔄 Data Flow Architecture

### Request Creation Flow
```
Employee (Frontend)
    ↓ POST /api/requests
Request Controller
    ↓ createRequest()
Workflow Service
    ↓ initializeWorkflow()
MongoDB (Request Model)
    ↓ save()
Manager Assignment
    ↓ getHandlerForStage()
Response → Frontend
```

### Request Approval Flow
```
Manager/Approver (Frontend)
    ↓ POST /api/requests/:id/forward
Request Controller
    ↓ forwardRequest()
Permission Check
    ↓ PERMISSIONS[role].canForward
Workflow Service
    ↓ getNextStage(), updateWorkflowStage()
Handler Assignment
    ↓ getHandlerForStage()
SLA Reset
    ↓ lastActivityAt = now
MongoDB Update
    ↓ save()
Response → Frontend
```

### SLA Monitoring Flow
```
SLA Service (Background)
    ↓ runs every hour
Calculate Working Hours
    ↓ calculateWorkingHours()
Check Thresholds
    ↓ 9 hours → reminder
    ↓ 10 hours → flag
Update Request
    ↓ isFlagged = true
Database Save
```

### Query Flow
```
Sender (Frontend)
    ↓ POST /api/queries
Query Controller
    ↓ sendQuery()
Permission Check
    ↓ QUERY_RECIPIENTS[role]
Create Query
    ↓ MongoDB save
Update Request Status
    ↓ overallStatus = 'query_raised'
Recipient Notification
    ↓ emailService (optional)
Response → Frontend
```

---

## 🛡️ Security Layers

### Layer 1: Frontend
- Route protection (PrivateRoute)
- Role-based UI rendering
- Input validation
- Token storage (localStorage)

### Layer 2: Backend Middleware
- JWT verification (`auth.protect`)
- Role authorization (`auth.authorize`)
- Error handling
- Request validation

### Layer 3: Controller Logic
- Permission checks (PERMISSIONS object)
- Ownership verification
- Business rule enforcement
- Status validation

### Layer 4: Database
- Schema validation
- Unique constraints
- Indexes for performance
- Relationships (refs)

---

## 📊 Database Schema Relations

```
User (8 roles)
  ↓ creates
Request
  ├── createdBy → User (Employee)
  ├── currentHandler → User (Approver)
  └── workflow[] → actionBy → User
  
Request
  ↓ has many
Query
  ├── sentBy → User
  ├── sentTo → User
  └── request → Request

Holiday (independent)
  └── Used for SLA calculations
```

---

## 🚀 API Endpoints Summary

### Authentication (`/api/auth`)
- POST `/register` - Create new user
- POST `/login` - Authenticate user
- GET `/me` - Get current user
- POST `/forgot-password` - Request reset
- POST `/reset-password/:token` - Reset password

### Users (`/api/users`)
- PUT `/profile` - Update phone
- PUT `/change-password` - Change password
- GET `/by-role/:role` - Get users by role

### Requests (`/api/requests`)
- POST `/` - Create request
- GET `/` - Get all requests
- GET `/dashboard` - Get dashboard data
- GET `/flagged` - Get flagged requests
- GET `/:id` - Get single request
- POST `/:id/forward` - Forward request
- POST `/:id/approve` - Approve request
- POST `/:id/reject` - Reject request
- POST `/:id/revert` - Revert request

### Queries (`/api/queries`)
- POST `/` - Send query
- GET `/` - Get queries
- GET `/:id` - Get single query
- POST `/:id/respond` - Respond to query
- GET `/request/:requestId` - Get queries for request

---

## 💾 Environment Variables

### Backend (.env)
```
PORT                # Server port (5000)
MONGODB_URI         # Database connection
JWT_SECRET          # Token signing key
JWT_EXPIRE          # Token expiration
EMAIL_HOST          # SMTP host
EMAIL_PORT          # SMTP port
EMAIL_USER          # SMTP username
EMAIL_PASSWORD      # SMTP password
EMAIL_FROM          # From email address
FRONTEND_URL        # Frontend URL for CORS
NODE_ENV            # Environment (development/production)
```

### Frontend (.env)
```
REACT_APP_API_URL   # Backend API URL
```

---

## 🎨 UI Component Hierarchy

```
App
├── Router
│   ├── Public Routes
│   │   ├── Login
│   │   └── Register
│   │
│   └── Private Routes (PrivateRoute)
│       ├── AppLayout
│       │   ├── Sidebar
│       │   │   ├── Logo
│       │   │   ├── User Info
│       │   │   ├── Navigation
│       │   │   └── Logout
│       │   │
│       │   └── Main Content
│       │       ├── Dashboard
│       │       ├── CreateRequest
│       │       ├── AllRequests
│       │       ├── RequestDetails
│       │       ├── FlaggedRequests
│       │       ├── Queries
│       │       └── Profile
```

---

## 📈 Workflow Paths Visualization

### HR Request
```
Employee
    ↓ submit
Manager
    ↓ forward
HR
    ↓ forward
General Manager
    ↓ forward
CEO
    ↓ approve/reject
```

### IT & Research Request
```
Employee
    ↓ submit
Manager
    ↓ forward
IT & Research
    ↓ forward
General Manager
    ↓ forward
CEO
    ↓ approve/reject
```

### Finance Request
```
Employee
    ↓ submit
Manager
    ↓ forward
Accountant
    ↓ forward
General Manager
    ↓ forward
CEO
    ↓ approve/reject
```

---

## 🔧 Development Commands

### Backend
```bash
npm install          # Install dependencies
npm run dev          # Development mode (nodemon)
npm start            # Production mode
npm run seed         # Seed database
```

### Frontend
```bash
npm install          # Install dependencies
npm start            # Development mode (port 3000)
npm run build        # Production build
npm test             # Run tests
```

---

## 📦 Package Dependencies Summary

### Backend (Core)
- express (Web framework)
- mongoose (MongoDB ODM)
- jsonwebtoken (JWT auth)
- bcryptjs (Password hashing)
- dotenv (Environment vars)
- cors (CORS handling)
- nodemailer (Email service)
- express-validator (Validation)
- morgan (Logging)

### Frontend (Core)
- react (UI library)
- react-dom (React rendering)
- react-router-dom (Routing)
- axios (HTTP client)

---

## 🎯 Quick Reference

### Default Ports
- Frontend: 3000
- Backend: 5000
- MongoDB: 27017

### Test Accounts
All passwords: `password123`
- employee@test.com
- manager@test.com
- hr@test.com
- it@test.com
- finance@test.com
- accountant@test.com
- gm@test.com
- ceo@test.com

### Key Features
- 5-minute revert window (backend enforced)
- 10-hour SLA tracking (working hours only)
- Role-based permissions (8 roles)
- Query system (role-based recipients)
- Workflow visualization
- Flagged requests section

---

## 📚 Documentation Files

1. **README.md** - Complete overview, installation, usage
2. **QUICKSTART.md** - Get started in 5 minutes
3. **IMPLEMENTATION_SUMMARY.md** - Requirements verification
4. **SETUP_COMPLETE.md** - Post-installation guide
5. **PROJECT_MAP.md** - This file (architecture overview)
6. **backend/README.md** - Backend specific documentation
7. **frontend/README.md** - Frontend specific documentation

---

## ✨ Project Statistics

- **Total Files:** 55+
- **Backend Files:** 27
- **Frontend Files:** 24
- **Documentation Files:** 7
- **Lines of Code:** ~8000+
- **Dependencies:** 1442 packages
- **API Endpoints:** 22
- **Database Models:** 4
- **React Pages:** 9
- **User Roles:** 8

---

## 🎉 You're Ready!

This complete project map shows the entire architecture of your Request Management & Approval System. Every component, file, and flow has been implemented according to specifications.

**Next:** Follow SETUP_COMPLETE.md to run the application!
