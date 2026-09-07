# CEO Flagged Requests, Query Recipients, Notifications & Details - Complete

## Summary
Implemented four key improvements: CEO flagged requests with role filter, fixed query recipients logic, added unread query badge, and displayed request purpose in query details.

---

## 1. CEO FLAGGED REQUESTS WITH ROLE FILTER ✅

### Changes Made

**A. Added Flagged Requests to CEO Sidebar**
- CEO sidebar now includes "Flagged Requests" menu item
- Accessible at `/flagged-requests` route
- Added CEO to `hasFlaggedRequestsAccess` function

**B. Role Filter Dropdown (CEO Only)**
- Dropdown shows:
  - All Roles (total count)
  - Manager (count)
  - HR (count)
  - IT & Research (count)
  - Finance (count)
  - Accountant (count)
  - General Manager (count)
- Counts shown in parentheses, including 0 when no flagged requests
- Selecting a role filters to show only that role's flagged requests

**C. Filtering Logic**
- CEO sees all flagged requests by default
- Can filter by specific role
- Count updates dynamically based on filter
- Shows "All Roles (X)" option to see everything

### Files Modified

**Frontend:**
1. `frontend/src/utils/helpers.js` - Added CEO to hasFlaggedRequestsAccess
2. `frontend/src/pages/FlaggedRequests.js` - Added role filter dropdown and logic
3. `frontend/src/components/Sidebar.js` - No change needed (uses hasFlaggedRequestsAccess)

**Backend:**
- No changes needed (existing API works)

### UI Implementation
```javascript
// Dropdown in card header (CEO only)
<select value={selectedRole} onChange={handleRoleChange}>
  <option value="all">All Roles (15)</option>
  <option value="Manager">Manager (5)</option>
  <option value="HR">HR (2)</option>
  <option value="IT & Research">IT & Research (3)</option>
  <option value="Finance">Finance (4)</option>
  <option value="Accountant">Accountant (1)</option>
  <option value="General Manager">General Manager (0)</option>
</select>
```

---

## 2. QUERY RECIPIENTS - SHOW ONLY RELEVANT USERS ✅

### Problem Fixed
Previously, query recipients showed everyone based on user role permissions, which was incorrect.

### New Logic
Recipients are now based on the **request's current workflow stage**, not the sender's role.

**Example:**
- Request created by John (Employee)
- Currently with IT & Research
- Query recipient dropdown shows: **Only IT & Research users**
- Does NOT show: Employee, Manager, HR, Finance, etc.

### Implementation

**Old Logic:**
```javascript
// Showed all users from allowed roles
const allowedRoles = getQueryRecipients(user.role);
// Could show HR, Finance, etc. even if request is with IT
```

**New Logic:**
```javascript
// Shows only users from current stage
if (request.currentStage !== 'Employee') {
  // Get users from current stage role
  const response = await userAPI.getByRole(request.currentStage);
}
// Also allows querying the request creator
if (request.createdBy._id !== user.id) {
  recipients.push(request.createdBy);
}
// Removes duplicates and current user
```

### Rules Applied
1. **Query current stage handlers** - Users from the role currently handling the request
2. **Query request creator** - Can always query the employee who created the request
3. **Cannot query self** - Current user excluded from list
4. **No duplicates** - Unique recipients only

### Files Modified
**Frontend:**
- `frontend/src/pages/RequestDetails.js` - Updated loadRecipients function

**Backend:**
- No changes needed

---

## 3. QUERY NOTIFICATION BADGE ✅

### Feature Added
Unread query count badge displayed on "Queries" sidebar item.

### How It Works

**A. Sidebar Display**
```
Queries  ①   (1 unread)
Queries  ③   (3 unread)
Queries      (no badge when 0)
```

**B. Badge Logic**
- Counts **pending (unread)** queries received by the user
- Updates automatically every 30 seconds
- Red badge with white text
- Badge only shows when count > 0

**C. Count Updates**
- Initial load when user logs in
- Polls every 30 seconds for new queries
- Updates when queries are responded to
- Real-time indicator of new queries

### Implementation

**API Call:**
```javascript
queryAPI.getAll({ type: 'received', status: 'pending' })
// Returns count of pending received queries
```

**Badge Styling:**
```javascript
{unreadQueryCount > 0 && (
  <span style={{
    marginLeft: 'auto',
    background: '#e53e3e',  // Red
    color: 'white',
    borderRadius: '10px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '600'
  }}>
    {unreadQueryCount}
  </span>
)}
```

### Files Modified

**Frontend:**
1. `frontend/src/components/Sidebar.js` - Added query count state and badge display
   - Imports queryAPI
   - useEffect to fetch count on mount
   - Polls every 30 seconds
   - Badge shown inline with Queries menu item

**Backend:**
- No changes needed (existing API returns count)

---

## 4. REQUEST PURPOSE IN QUERY DETAILS ✅

### Feature Added
Query details modal now displays the **Request Purpose** of the related request.

### Display Format

**Before:**
```
Request: REQ-000008 - Request Title
From: Manager (Manager)
To: IT User (IT & Research)
Date: ...
Status: ...
Message: ...
Response: ...
```

**After:**
```
Request: REQ-000008 - Request Title

Request Purpose:
┌──────────────────────────────────────┐
│ Need new laptops for the IT team     │
│ to upgrade from old hardware.        │
│ Budget approved by Finance dept.     │
└──────────────────────────────────────┘

From: Manager (Manager)
To: IT User (IT & Research)
Date: ...
Status: ...
Message: ...
Response: ...
```

### Implementation

**Frontend Display:**
```javascript
{selectedQuery.request?.description && (
  <div>
    <strong>Request Purpose:</strong>
    <div style={{
      marginTop: '8px',
      padding: '12px',
      background: '#f7fafc',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#4a5568',
      whiteSpace: 'pre-wrap'
    }}>
      {selectedQuery.request.description}
    </div>
  </div>
)}
```

**Backend Change:**
```javascript
// Updated populate to include description
.populate('request', 'requestId title requestType description')
```

### Benefits
- Provides context for the query
- Helps understand why the request was made
- No need to click through to request details
- All information in one view

### Files Modified

**Frontend:**
- `frontend/src/pages/Queries.js` - Added Request Purpose display

**Backend:**
- `backend/src/controllers/queryController.js` - Updated getQueries populate to include description

---

## Testing Checklist

### CEO Flagged Requests
- [ ] Login as CEO
- [ ] See "Flagged Requests" in sidebar
- [ ] Click Flagged Requests
- [ ] See role filter dropdown
- [ ] Verify dropdown shows all roles with counts
- [ ] Select "Manager" → See only Manager's flagged requests
- [ ] Select "HR" → See only HR's flagged requests
- [ ] Select "All Roles" → See all flagged requests
- [ ] Verify counts are correct (including 0 counts)

### Query Recipients
- [ ] Create request (Employee → Manager)
- [ ] Login as Manager
- [ ] Open request, click "Send Query"
- [ ] Verify dropdown shows only:
  - Employee (request creator)
  - No HR, Finance, IT users
- [ ] Forward request to IT & Research
- [ ] Login as IT user
- [ ] Open same request, click "Send Query"
- [ ] Verify dropdown shows only:
  - Employee (request creator)
  - Other IT & Research users (if any)
  - No Manager, HR, Finance users

### Query Notification Badge
- [ ] Login as any user
- [ ] Check sidebar → "Queries" (no badge if no unread)
- [ ] Have someone send you a query
- [ ] Wait up to 30 seconds
- [ ] Verify badge appears: "Queries ①"
- [ ] Have 2 more queries sent
- [ ] Verify badge updates: "Queries ③"
- [ ] Respond to one query
- [ ] Verify badge updates: "Queries ②"
- [ ] Respond to all queries
- [ ] Verify badge disappears

### Request Purpose in Query Details
- [ ] Create request with detailed purpose
- [ ] Send query about that request
- [ ] Login as query recipient
- [ ] Go to Queries → Received
- [ ] Click "View" on the query
- [ ] Verify modal shows:
  - Request ID and Title
  - **Request Purpose** (in gray box)
  - From, To, Date, Status
  - Message
  - Response (if available)
- [ ] Verify purpose text is formatted correctly (preserves line breaks)

---

## What Did NOT Change

✅ Existing UI design, colors, fonts - unchanged
✅ Sidebar styling - unchanged (only added badge)
✅ Request workflows - unchanged
✅ Query permissions - unchanged (only filtered recipients)
✅ Query response functionality - unchanged
✅ All other features - unchanged

---

## Technical Details

### Query Count Polling
```javascript
// Sidebar.js
useEffect(() => {
  if (user) {
    fetchUnreadQueryCount();
    const interval = setInterval(fetchUnreadQueryCount, 30000); // 30 sec
    return () => clearInterval(interval);
  }
}, [user]);
```

### Role Filter State Management
```javascript
// FlaggedRequests.js
const [allRequests, setAllRequests] = useState([]);
const [requests, setRequests] = useState([]);
const [selectedRole, setSelectedRole] = useState('all');
const [roleCounts, setRoleCounts] = useState({});

// Calculate counts per role
const calculateRoleCounts = (reqs) => {
  const counts = {};
  roles.forEach(role => {
    counts[role] = reqs.filter(req => req.currentStage === role).length;
  });
};

// Filter by selected role
const filterRequestsByRole = () => {
  if (selectedRole === 'all') {
    setRequests(allRequests);
  } else {
    setRequests(allRequests.filter(req => req.currentStage === selectedRole));
  }
};
```

### Query Recipients Logic
```javascript
// RequestDetails.js - loadRecipients()
// 1. Get users from current stage
if (request.currentStage !== 'Employee') {
  const response = await userAPI.getByRole(request.currentStage);
  recipients.push(...response.data.users);
}

// 2. Add request creator
if (request.createdBy._id !== user.id) {
  recipients.push(request.createdBy);
}

// 3. Remove duplicates and current user
const uniqueRecipients = recipients.filter((recipient, index, self) =>
  recipient._id !== user.id &&
  index === self.findIndex((r) => r._id === recipient._id)
);
```

---

## File Changes Summary

### Frontend
1. `frontend/src/utils/helpers.js` - Added CEO to hasFlaggedRequestsAccess
2. `frontend/src/pages/FlaggedRequests.js` - Added role filter for CEO
3. `frontend/src/components/Sidebar.js` - Added query count badge
4. `frontend/src/pages/RequestDetails.js` - Fixed query recipients logic
5. `frontend/src/pages/Queries.js` - Added Request Purpose display

### Backend
6. `backend/src/controllers/queryController.js` - Updated getQueries populate

---

## Current System Status

**Backend:**
- ✅ Running on port 5001
- ✅ MongoDB connected
- ✅ Query endpoints updated
- ✅ SLA service active
- ✅ Auto-forwarding service active

**Frontend:**
- ✅ Running on port 3000
- ✅ Compiled successfully
- ✅ All new features active
- ✅ Query badge polling active

---

## Notes

1. **Query Badge Polling:** Updates every 30 seconds. Can be adjusted in Sidebar.js if needed.

2. **CEO Filter Persistence:** Filter selection resets when page is refreshed. This is intentional to always show all requests by default.

3. **Query Recipients:** Only shows relevant users based on workflow. Much cleaner and more intuitive than before.

4. **Request Purpose:** Shows full description with line breaks preserved. Helps provide context without leaving the query modal.

5. **Zero Counts:** Dropdown correctly shows "(0)" when a role has no flagged requests.

---

**Status:** ✅ ALL COMPLETE

**Date:** August 31, 2026  
**Backend:** Running (port 5001)  
**Frontend:** Running (port 3000)

**Quick Test:**
1. Login as CEO → See Flagged Requests with role filter
2. Create request → Send query → Check recipients (only relevant users)
3. Check sidebar → See query badge with count
4. View query → See Request Purpose displayed
