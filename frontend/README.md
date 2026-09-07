# Request Management System - Frontend

React-based frontend for the Request Management & Approval System.

## Features

- Clean, professional enterprise UI
- Role-based navigation
- Responsive design
- Real-time updates
- Modal dialogs for actions
- Status badges and indicators
- Workflow visualization

## Pages

### Authentication
- **Login**: User authentication
- **Register**: New user registration

### Employee Pages
- **Dashboard**: Recent requests overview
- **All Requests**: View all own requests
- **Create Request**: Submit new request
- **Queries**: View and respond to queries
- **My Profile**: Update phone, change password

### Approver Pages
- **Dashboard**: Pending requests overview
- **All Requests**: View assigned requests
- **Flagged Requests**: SLA-breached requests
- **Queries**: Send and manage queries
- **My Profile**: Update phone, change password

## Installation

```bash
npm install
```

## Configuration

Create or verify `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Development

```bash
npm start
```

Runs on `http://localhost:3000`

## Build

```bash
npm run build
```

Creates optimized production build in `build/` directory.

## Project Structure

```
src/
├── components/
│   ├── Sidebar.js           # Navigation sidebar
│   └── PrivateRoute.js      # Protected route wrapper
├── context/
│   └── AuthContext.js       # Authentication context
├── pages/
│   ├── Login.js             # Login page
│   ├── Register.js          # Registration page
│   ├── Dashboard.js         # Dashboard
│   ├── CreateRequest.js     # Create request form
│   ├── AllRequests.js       # Requests list
│   ├── RequestDetails.js    # Request details & actions
│   ├── FlaggedRequests.js   # Flagged requests list
│   ├── Queries.js           # Query management
│   └── Profile.js           # User profile
├── services/
│   └── api.js               # API service layer
├── styles/
│   ├── App.css              # Main styles
│   ├── Auth.css             # Authentication styles
│   └── Sidebar.css          # Sidebar styles
├── utils/
│   └── helpers.js           # Helper functions
├── App.js                   # Main app component
└── index.js                 # Entry point
```

## Key Components

### AuthContext
- Manages authentication state
- Provides login/logout functions
- Handles token storage
- User data management

### Sidebar
- Role-based navigation
- Active route highlighting
- Mobile responsive
- User information display

### PrivateRoute
- Protects authenticated routes
- Redirects to login if not authenticated
- Loading state handling

## Styling

- Professional color palette
- Consistent spacing and typography
- Reusable CSS classes
- Responsive grid layouts
- Clean card-based design

## API Integration

All API calls go through the `services/api.js` module:

```javascript
import { requestAPI, queryAPI, userAPI, authAPI } from './services/api';

// Example usage
const requests = await requestAPI.getAll();
const query = await queryAPI.send(data);
```

## Role-Based UI

The UI adapts based on user role:

- Employee: Can create requests, cannot see flagged requests
- Other roles: Cannot create requests, can see flagged requests (except CEO)
- CEO: Can approve, cannot forward

## Deployment

### Build for Production

```bash
npm run build
```

### Serve Static Files

The `build/` folder can be served with any static file server:

```bash
# Using serve
npx serve -s build

# Using Apache/Nginx
# Configure to serve build/ directory
```

### Environment Variables

For production, update `.env` or set environment variables:

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile devices
- Requires JavaScript enabled

## Dependencies

- **react**: UI library
- **react-router-dom**: Routing
- **axios**: HTTP client

## Development Tips

1. Use React DevTools for debugging
2. Check browser console for errors
3. Verify API_URL in .env
4. Ensure backend is running
5. Clear browser cache if styles don't update
