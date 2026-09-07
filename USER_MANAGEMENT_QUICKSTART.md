# User Management Quick Start Guide

## Testing the User Management Feature

### 1. Start the Application

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

### 2. Login as CEO

Navigate to: http://localhost:3000/login

**Credentials:**
- Email: `ceo@test.com`
- Password: `password123`

### 3. Access User Management

After login, you'll see "User Management" in the sidebar (only for CEO).

Click on "User Management" to open the page.

## Add Single User

1. Click **"Add Single"** button
2. Fill in the form:
   - **Name:** Enter full name (e.g., "Jane Smith")
   - **Employee ID:** Unique identifier (e.g., "EMP-0020")
   - **Email:** Valid email address (e.g., "jane@nexaflow.com")
   - **Phone:** Phone number (e.g., "+1234567890")
   - **Role:** Select from dropdown (Employee, Manager, HR, IT & Purchase, Finance, Accountant, General Manager, CEO)
   - **Company:** NexaFlow (only option)
   - **Department:** Select or leave blank (Operations, Human Resources, Technology, Finance, Management, Executive)
3. Click **"Create User"**
4. Success dialog appears
5. User appears in the table

**Default Password:** All new users get password `password123`

## Bulk Upload Users

### Step 1: Download Template

1. Click **"Download Template"** button
2. Save the `user_template.csv` file
3. Open in Excel or text editor

### Step 2: Fill Template

The CSV must have these exact columns:
```csv
name,employeeID,email,phone,department
John Doe,EMP-0021,john@nexaflow.com,+1234567890,Operations
Jane Smith,EMP-0022,jane@nexaflow.com,+1234567891,Finance
Bob Johnson,EMP-0023,bob@nexaflow.com,+1234567892,Technology
```

**Important:**
- Column names MUST match exactly: `name,employeeID,email,phone,department`
- Do NOT add or remove columns
- Do NOT include Role or Company in CSV (set in UI)
- Each employeeID must be unique
- Each email must be unique
- Department is optional

### Step 3: Upload and Create

1. Click **"Bulk Upload"** button
2. Select **Role** that will be applied to ALL users (e.g., "Employee")
3. Select **Company** (NexaFlow - only option)
4. Click **"Choose Excel File"** and select your CSV
5. Preview table shows all users before creation
6. Verify data is correct
7. Click **"Create X Users"** button
8. Success dialog shows how many users were created
9. All users appear in the table

## Edit User

1. Find user in the table
2. Click **"Edit"** button for that user
3. Modify fields:
   - Name
   - Phone
   - Role (can change role here)
   - Department
4. Click **"Update User"**
5. Success dialog appears
6. Table refreshes with updated data

**Note:** Email and Employee ID cannot be changed (unique identifiers)

## Delete User

1. Find user in the table
2. Click **"Delete"** button for that user
3. Confirmation dialog appears: "Are you sure?"
4. Click **"Confirm"** to delete
5. User is deactivated (soft delete)
6. User disappears from table
7. User can no longer login

**Note:** User data remains in database for audit purposes

## View All Users

The main table shows all active users with:
- Name
- Employee ID
- Email
- Role (badge)
- Department
- Actions (Edit/Delete buttons)

Total user count shown in header: "Users (X)"

## Excel Template Format

### Correct Format:
```csv
name,employeeID,email,phone,department
Alice Cooper,EMP-0030,alice@nexaflow.com,+1234567893,Operations
Bob Dylan,EMP-0031,bob@nexaflow.com,+1234567894,Finance
Charlie Brown,MGR-0010,charlie@nexaflow.com,+1234567895,Management
```

### Common Mistakes to Avoid:

❌ **Wrong column names:**
```csv
Name,Employee ID,Email Address,Phone Number,Department
```

❌ **Including Role/Company in CSV:**
```csv
name,employeeID,email,phone,role,company,department
```

❌ **Reordering columns:**
```csv
email,name,phone,employeeID,department
```

❌ **Using spaces instead of commas:**
```csv
name employeeID email phone department
```

✅ **Correct - use EXACT column names:**
```csv
name,employeeID,email,phone,department
```

## Validation Errors

### Email Already Exists
```
Error: User with this email already exists
```
**Solution:** Use a different email address

### Employee ID Already Exists
```
Error: Employee ID is already registered
```
**Solution:** Use a different Employee ID

### Missing Required Fields
```
Error: Please provide all required fields
```
**Solution:** Fill in name, email, phone, role, and employeeID

## Predefined Departments

When adding users, you can select from:
- Operations
- Human Resources
- Technology
- Finance
- Management
- Executive

Or leave blank (department is optional)

## All Roles Available

- **Employee** - Can create requests, respond to queries
- **Manager** - Can forward/reject requests, send queries
- **HR** - Handles HR requests
- **IT & Purchase** - Handles IT & Purchase requests (renamed from IT & Research)
- **Finance** - Handles Finance requests
- **Accountant** - Handles Finance after Finance dept
- **General Manager** - Reviews before CEO
- **CEO** - Final approver, has User Management access

## Demo Users for Testing

Test the system with these existing users:

| Role | Email | Password | Employee ID |
|------|-------|----------|-------------|
| Employee | employee@test.com | password123 | EMP-0001 |
| Manager | manager@test.com | password123 | MGR-0001 |
| HR | hr@test.com | password123 | HR-0001 |
| IT & Purchase | it@test.com | password123 | IT-0001 |
| Finance | finance@test.com | password123 | FIN-0001 |
| Accountant | accountant@test.com | password123 | ACC-0001 |
| General Manager | gm@test.com | password123 | GM-0001 |
| CEO | ceo@test.com | password123 | CEO-0001 |

## Testing Scenarios

### Scenario 1: Add Single Employee
1. Login as CEO
2. Go to User Management
3. Click "Add Single"
4. Create user with role "Employee"
5. Logout
6. Login with new user (password: password123)
7. Verify Employee can access Dashboard and Create Request

### Scenario 2: Bulk Upload Managers
1. Create CSV with 3 managers
2. Use template format exactly
3. Upload and select Role: "Manager"
4. Verify all 3 created successfully
5. Check table shows all managers

### Scenario 3: Edit User Role
1. Find an Employee in table
2. Click Edit
3. Change role to "Manager"
4. Save
5. Logout and login as that user
6. Verify they now have Manager permissions (can see Flagged Requests)

### Scenario 4: Delete Inactive User
1. Find a user to remove
2. Click Delete
3. Confirm deletion
4. User disappears from table
5. Try to login as that user
6. Verify login fails with "account deactivated" message

### Scenario 5: Duplicate Detection
1. Try to create user with existing email
2. Verify error: "Email already exists"
3. Try to create user with existing Employee ID
4. Verify error: "Employee ID already registered"

## API Testing (Optional)

### Get All Users
```bash
curl -X GET http://localhost:5001/api/users/all \
  -H "Authorization: Bearer YOUR_CEO_TOKEN"
```

### Create Single User
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Authorization: Bearer YOUR_CEO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@nexaflow.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "Employee",
    "employeeId": "EMP-9999",
    "department": "Operations"
  }'
```

### Update User
```bash
curl -X PUT http://localhost:5001/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_CEO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "role": "Manager"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:5001/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_CEO_TOKEN"
```

## Troubleshooting

### "Access Denied" Message
**Problem:** User sees "Access denied. Only CEO can access User Management"  
**Solution:** You must be logged in as CEO (ceo@test.com)

### "User Management" Not in Sidebar
**Problem:** User Management menu item not visible  
**Solution:** This feature is only visible to CEO role

### CSV Upload Shows No Preview
**Problem:** File uploaded but no preview appears  
**Solution:** 
- Check column names match exactly: `name,employeeID,email,phone,department`
- Ensure file is CSV format (not .xlsx)
- Check for special characters or encoding issues

### Some Users Failed to Create
**Problem:** Bulk upload shows "Created 5 users, 3 failed"  
**Solution:** Check error messages for failed users:
- Duplicate emails
- Duplicate Employee IDs
- Invalid data format
- Fix errors and upload again

### Default Password Not Working
**Problem:** New user can't login with "password123"  
**Solution:** 
- Ensure you're using the correct email
- Password is case-sensitive: `password123` (lowercase)
- Check user is active (not deleted)

## Security Notes

✅ **Secure:**
- Only CEO can access User Management
- All endpoints require CEO authorization
- Passwords are hashed (bcrypt)
- Soft delete preserves audit trail
- Email and Employee ID uniqueness enforced

❌ **Limitations:**
- Default password is the same for all users (password123)
- New users must change password manually
- No email notifications for new accounts

## Next Steps

After creating users:
1. Inform users of their login credentials
2. Ask them to change password on first login (Profile → Change Password)
3. Verify each user has correct role and permissions
4. Test the request workflow with new users

## Support

For issues or questions:
1. Check this guide
2. Review USER_MANAGEMENT_IMPLEMENTATION_COMPLETE.md
3. Check application logs (backend console)
4. Verify database connection
5. Confirm you're logged in as CEO

---

**Remember:** User Management is ONLY accessible by CEO users. Regular employees cannot create or manage users.
