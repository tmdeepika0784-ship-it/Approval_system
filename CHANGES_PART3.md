# Additional Changes Made - Part 3

## Summary of New Changes

### ✅ 1. Password Change via OTP Only
**Files Modified:**
- `frontend/src/pages/Profile.js`
- `backend/src/controllers/authController.js`
- `backend/src/services/emailService.js`

**Changes:**

**OLD Behavior:**
- Option 1: Direct password change with current password
- Option 2: Request reset link via email

**NEW Behavior:**
- **Only OTP method available**
- Click "Send OTP to Email" button
- Receive 6-digit OTP via email
- OTP valid for 15 minutes
- Use OTP to reset password securely

**Profile Page Now Shows:**
```
Change Password Section:
- Your registered email displayed
- Single button: "Send OTP to Email"
- Info message about security
- Warning about OTP validity
```

**Backend Changes:**
- Generates 6-digit random OTP (e.g., 123456)
- Stores hashed OTP in database
- Expires after 15 minutes
- Email contains nicely formatted OTP

**Email Format:**
```
Subject: Password Reset OTP - Request Management System

Your One-Time Password (OTP) is:

    123456

This OTP will expire in 15 minutes.
```

**Result:** More secure password change process using OTP verification

---

### ✅ 2. Active Role Dropdown in Sign Up
**File:** `frontend/src/pages/Register.js`

**OLD Behavior:**
- Role dropdown was **disabled**
- Fixed to "Employee" only
- No other roles could be selected

**NEW Behavior:**
- Role dropdown is now **active/enabled**
- All 8 roles can be selected:
  - Employee
  - Manager
  - HR
  - IT & Research
  - Finance
  - Accountant
  - General Manager
  - CEO

**Conditional Employee ID Field:**
- If role = "Employee" → No Employee ID field shown
- If role = any other role → Employee ID field appears (required)

**Help Text:**
- "Select your role in the organization"
- "Employee ID is required for non-employee roles"

**Result:** Users can sign up as any role, with Employee ID validation for non-employees

---

## UI Changes

### Profile Page - Change Password Section

**Before:**
```
[ ] Current Password
[ ] New Password  
[ ] Confirm New Password
[Change Password] [Request Reset via Email]
```

**After:**
```
Registered Email: user@example.com

[Send OTP to Email]

Note: You will receive an OTP via email.
```

**Benefits:**
- Cleaner interface
- More secure (no password exposed in form)
- Better user experience
- Industry standard practice

---

### Sign Up Page - Role Selection

**Before:**
```
Role: [Employee ▼] (disabled/grayed out)
Help: "Role is fixed as Employee"
```

**After:**
```
Role: [Employee ▼] (active/clickable)
       - Employee
       - Manager
       - HR
       - IT & Research
       - Finance
       - Accountant
       - General Manager
       - CEO
Help: "Select your role in the organization"

[Shows Employee ID field if non-Employee selected]
```

---

## Security Improvements

### OTP System

1. **Random 6-digit OTP**: 100,000 to 999,999
2. **Hashed Storage**: OTP is hashed before storing in database
3. **Time Limit**: 15 minutes expiration
4. **One-time Use**: OTP becomes invalid after successful password reset
5. **Email Verification**: Confirms user owns the email address

### Benefits Over Direct Password Change

| Feature | Old (Direct) | New (OTP) |
|---------|-------------|-----------|
| Email Verification | ❌ No | ✅ Yes |
| Time Limited | ❌ No | ✅ 15 min |
| One-time Use | ❌ No | ✅ Yes |
| Security Level | Medium | High |
| Industry Standard | ❌ No | ✅ Yes |

---

## Backend API Changes

### POST /api/auth/forgot-password
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent to your email. Valid for 15 minutes."
}
```

**What Happens:**
1. Generates 6-digit OTP
2. Hashes OTP with SHA256
3. Stores in database with 15-min expiry
4. Sends formatted email with OTP
5. Returns success message

---

### POST /api/auth/reset-password/:otp
**Request:**
```json
{
  "password": "newPassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "message": "Password reset successful"
}
```

**What Happens:**
1. Hashes provided OTP
2. Looks up user with matching hashed OTP
3. Checks if OTP not expired (< 15 min)
4. Updates password
5. Clears OTP from database
6. Returns JWT token for auto-login

---

## Testing Checklist

### Test OTP Password Reset

1. **Request OTP:**
   - [ ] Login to any account
   - [ ] Go to Profile → Change Password
   - [ ] Click "Send OTP to Email"
   - [ ] Check email for 6-digit OTP
   - [ ] Verify OTP format (e.g., 123456)

2. **Verify OTP Email:**
   - [ ] Email has proper subject
   - [ ] OTP is clearly visible
   - [ ] Expiry time mentioned (15 minutes)
   - [ ] Professional formatting

3. **Reset Password (if implementing reset page):**
   - [ ] Enter OTP
   - [ ] Enter new password
   - [ ] Submit
   - [ ] Verify password changed
   - [ ] Login with new password

4. **Test Expiry:**
   - [ ] Wait 16 minutes
   - [ ] Try to use old OTP
   - [ ] Should show "Invalid or expired OTP"

### Test Role Selection in Sign Up

1. **Test Employee Registration:**
   - [ ] Go to Sign Up page
   - [ ] Select "Employee" from dropdown
   - [ ] Verify NO Employee ID field shows
   - [ ] Complete registration
   - [ ] Should work

2. **Test Manager Registration:**
   - [ ] Select "Manager" from dropdown
   - [ ] Verify Employee ID field appears
   - [ ] It should be marked as required
   - [ ] Try submitting without Employee ID → Should fail
   - [ ] Fill Employee ID → Should work

3. **Test All Roles:**
   - [ ] Try selecting each role:
     - Manager
     - HR
     - IT & Research
     - Finance
     - Accountant
     - General Manager
     - CEO
   - [ ] Verify Employee ID field appears for all non-Employee roles
   - [ ] Complete registration with valid data

---

## Database Schema

**No changes needed** - existing fields support new features:
- `passwordResetToken` - stores hashed OTP
- `passwordResetExpires` - stores expiry timestamp
- `employeeId` - already added in previous changes

---

## Email Configuration

For OTP emails to work, ensure your `.env` has valid SMTP settings:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@requestmanagement.com
```

**Note:** For Gmail, you need to use an "App Password" not your regular password.

---

## Files Modified in Part 3

**Backend (2 files):**
1. `src/controllers/authController.js` - OTP generation and validation
2. `src/services/emailService.js` - OTP email formatting

**Frontend (2 files):**
1. `src/pages/Profile.js` - Removed direct password change
2. `src/pages/Register.js` - Enabled role dropdown

**Total Files Modified: 4**

---

## Important Notes

1. **OTP Security:**
   - OTP is hashed before storage
   - Cannot be retrieved or viewed
   - 15-minute expiry enforced
   - One-time use only

2. **Email Requirement:**
   - SMTP must be configured for OTP delivery
   - In development, check console if email fails
   - Use real SMTP service in production

3. **Role Selection:**
   - All roles can now be selected during signup
   - Employee ID required for non-Employee roles
   - No backend restrictions on role selection

4. **Backward Compatibility:**
   - Existing password reset endpoint still works
   - Just uses OTP instead of token
   - Same security, better UX

---

## Next Steps

**1. Restart Backend:**
```bash
cd backend
npm run dev
```

**2. Frontend Auto-Reloads**

**3. Test Features:**
- Go to Profile → Change Password → Send OTP
- Check your email (or console if SMTP not configured)
- Go to Sign Up → Try selecting different roles
- Verify Employee ID field shows/hides correctly

All previous features remain intact! ✅
