# Employee ID / Staff ID - Update Summary

## Changes Made

### 1. Seed Data Updated (backend/src/utils/seed.js)
Added `employeeId` field to all seed users with role-based prefixes:

```javascript
{
  name: 'John',
  email: 'employee@test.com',
  employeeId: 'EMP-0001',  // ← Added
  role: 'Employee',
  department: 'Operations'
},
{
  name: 'Sarah',
  email: 'manager@test.com',
  employeeId: 'MGR-0001',  // ← Added
  role: 'Manager',
  department: 'Operations'
},
// ... and so on for all roles
```

**Employee ID Format:**
- Employee: `EMP-XXXX`
- Manager: `MGR-XXXX`
- HR: `HR-XXXX`
- IT & Research: `IT-XXXX`
- Finance: `FIN-XXXX`
- Accountant: `ACC-XXXX`
- General Manager: `GM-XXXX`
- CEO: `CEO-XXXX`

### 2. User Controller Updated (backend/src/controllers/userController.js)

**updateProfile endpoint:**
- Added `employeeId` to response object
- Now returns complete user profile including employeeId

```javascript
res.status(200).json({
  success: true,
  message: 'Profile updated successfully',
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    employeeId: user.employeeId,  // ← Added
    phone: user.phone,
    role: user.role,
    department: user.department
  }
});
```

**getUsersByRole endpoint:**
- Added `employeeId` to select fields
- Now returns employee IDs when fetching users by role

```javascript
const users = await User.find({ 
  role,
  isActive: true 
}).select('name email employeeId role department');  // ← Added employeeId
```

### 3. Auth Controller (already correct)
No changes needed - login and getMe endpoints already include `employeeId`:
- ✅ POST /api/auth/login - includes employeeId in response
- ✅ GET /api/auth/me - includes employeeId in response  
- ✅ POST /api/auth/register - includes employeeId in response

### 4. Frontend Profile Page
No changes needed - already displaying `employeeId`:
```jsx
<div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>
  Employee ID / Staff ID
</div>
<div style={{ fontWeight: '500' }}>
  {user?.employeeId}  {/* Already displays */}
</div>
```

## How to Apply Changes

### Option 1: Re-seed the Database (Recommended)
This will clear all existing data and create fresh users with employee IDs:

```bash
cd backend
npm run seed
```

This will:
1. Delete all existing users
2. Create new users with Employee IDs
3. Create sample holidays

### Option 2: Update Existing Users (if you want to keep existing data)
Note: This requires running a migration script or MongoDB update directly.

## Affected Fields

### User Model (backend/src/models/User.js)
The `employeeId` field was already in the schema:
```javascript
employeeId: {
  type: String,
  required: [true, 'Employee ID is required'],
  sparse: true,
  unique: true,
  trim: true
}
```

## API Endpoints That Return employeeId

1. **POST /api/auth/login**
   - Returns: user.employeeId ✅

2. **GET /api/auth/me**
   - Returns: user.employeeId ✅

3. **POST /api/auth/register**
   - Returns: user.employeeId ✅

4. **PUT /api/users/profile**
   - Returns: user.employeeId ✅ (updated)

5. **GET /api/users/by-role/:role**
   - Returns: employeeId in user list ✅ (updated)

## Verification

✅ Backend syntax valid
✅ Frontend builds successfully
✅ All affected endpoints updated
✅ Seed data includes employeeId
✅ Profile page displays employeeId

## Result

After applying these changes:
- All users will have an Employee ID / Staff ID
- Employee IDs will be visible in user profiles
- Employee IDs will be returned in all API responses
- Each role has a consistent prefix (EMP, MGR, HR, etc.)
- Employee IDs are unique and required for user registration
