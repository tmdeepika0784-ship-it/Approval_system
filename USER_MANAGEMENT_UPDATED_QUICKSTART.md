# User Management - Updated Quick Start Guide

## Overview

The User Management page now has a clean, professional interface with three main sections:
1. **Create users** - Add single users
2. **Bulk create via Excel** - Upload Excel files
3. **Existing users** - View/edit/delete users

## Getting Started

### 1. Login as CEO

```
URL: http://localhost:3000/login
Email: ceo@test.com
Password: password123
```

### 2. Navigate to User Management

Click **"User Management"** in the left sidebar (only visible to CEO).

## Using the Interface

### Section 1: Create Users

**Purpose:** Add individual users one at a time.

**How to use:**
1. Click the **"+ Add single"** button in the top-right
2. Fill in the form:
   - Name: Full name
   - Employee ID: Unique identifier (e.g., EMP-0020)
   - Email: Valid email address
   - Phone: Contact number
   - Role: Select from dropdown
   - Company: NexaFlow (only option)
   - Department: Optional
3. Click **"Create User"**
4. User is created with password: `password123`

**Note:** The disabled dropdowns "Head of Department" and "Select Institution" are placeholders for future features.

### Section 2: Bulk Create via Excel

**Purpose:** Create multiple users at once from an Excel file.

#### Step 1: Download Template

1. Click **"Download template"** (blue link)
2. File `user_template.xlsx` downloads
3. Open in Excel, Google Sheets, or any spreadsheet app

#### Step 2: Fill Template

The template includes **two example rows** to show the format:

| name | employeeID | email | phone | department |
|------|------------|-------|-------|------------|
| John Doe | EMP-0001 | john@nexaflow.com | +1234567890 | Operations |
| Jane Smith | EMP-0002 | jane@nexaflow.com | +1234567891 | Finance |

**Replace the example rows** with your actual users:

```excel
name            employeeID    email                    phone           department
Alice Cooper    EMP-0030     alice@nexaflow.com      +1234567893     Operations
Bob Dylan       EMP-0031     bob@nexaflow.com        +1234567894     Finance
Charlie Brown   MGR-0010     charlie@nexaflow.com    +1234567895     Management
```

**Important:**
- ✅ Keep column names EXACTLY as shown
- ✅ Delete the example rows and add your data
- ✅ Use `.xlsx` or `.xls` format (Excel format)
- ✅ Each employeeID must be unique
- ✅ Each email must be unique
- ✅ Department is optional (can be blank)

#### Step 3: Upload File

1. Click **"Choose .xls file"** button
2. Select your filled Excel file
3. **Preview table appears** showing all users
4. Green indicator shows: **"✓ X users loaded"**

#### Step 4: Configure and Create

1. Select **Role** (applies to ALL users in file)
2. Select **Company** (NexaFlow - applies to ALL users)
3. Review the preview table
4. Click **"Create X Users"** button
5. Success dialog shows how many users were created
6. All users get default password: `password123`

**Tips:**
- If upload fails, check column names match exactly
- Use the template as a starting point
- Maximum recommended: 100 users per file
- For large imports, split into multiple files

### Section 3: Existing Users

**Purpose:** View and manage all existing users.

#### View All Users

1. Click **"View / edit / delete users"** button
2. Modal opens showing table of all users
3. Columns: Name, Employee ID, Email, Role, Department, Actions

#### Edit User

1. In the user table, click **"Edit"** for any user
2. Form opens with current data
3. You can change:
   - Name
   - Phone
   - Role
   - Department
4. **Cannot change:** Email, Employee ID (unique identifiers)
5. Click **"Update User"**
6. Changes saved immediately

#### Delete User

1. In the user table, click **"Delete"** for any user
2. Confirmation dialog appears
3. Click **"Confirm"** to delete
4. User is **deactivated** (soft delete)
5. User can no longer login
6. User data preserved in database for audit

## Excel Template Details

### Format

The downloaded `user_template.xlsx` file contains:

**Headers (Row 1):**
```
name | employeeID | email | phone | department
```

**Example Data (Rows 2-3):**
- John Doe, EMP-0001, john@nexaflow.com, +1234567890, Operations
- Jane Smith, EMP-0002, jane@nexaflow.com, +1234567891, Finance

**Column Widths:**
- name: Wide enough for full names
- employeeID: Standard ID width
- email: Wide for email addresses
- phone: Standard phone width
- department: Standard text width

### Editing Tips

1. **Keep the headers** in row 1 (don't change them)
2. **Delete the example rows** (rows 2-3)
3. **Add your users** starting from row 2
4. **Fill all columns** except department (optional)
5. **Save as .xlsx** before uploading

### Common Mistakes

❌ **Wrong:** Changing column names
```excel
Name | Employee ID | Email Address | Phone Number | Dept
```

✅ **Right:** Exact column names
```excel
name | employeeID | email | phone | department
```

❌ **Wrong:** Including role in Excel
```excel
name | employeeID | email | phone | role | department
```

✅ **Right:** Role selected in UI (not in Excel)
```excel
name | employeeID | email | phone | department
```

## Validation & Errors

### During Upload

**File Validation:**
- File must be .xlsx or .xls format
- Must have correct column names
- Must parse successfully

**Data Validation:**
- All fields checked row by row
- Errors shown for each problematic row
- Valid users created, invalid users skipped

### Common Errors

**"Email already exists"**
- Solution: Use unique email for each user

**"Employee ID already registered"**
- Solution: Use unique Employee ID for each user

**"Missing required fields"**
- Solution: Fill in name, employeeID, email, phone

**"Parse error"**
- Solution: Ensure file is .xlsx format
- Check column names match exactly
- Remove special characters

## Demo Users

Test with existing users:

| Role | Email | Password |
|------|-------|----------|
| CEO | ceo@test.com | password123 |
| Employee | employee@test.com | password123 |
| Manager | manager@test.com | password123 |

## Testing Scenarios

### Test 1: Add Single User
1. Click "+ Add single"
2. Create user: Name="Test User", Email="test@nexaflow.com", EmployeeID="TEST-001"
3. Verify success message
4. Click "View / edit / delete users"
5. Verify new user appears in table

### Test 2: Bulk Upload
1. Click "Download template"
2. Open template in Excel
3. Delete example rows
4. Add 3 test users
5. Save as test_users.xlsx
6. Click "Choose .xls file"
7. Select test_users.xlsx
8. Verify preview shows 3 users
9. Select Role: "Employee"
10. Click "Create 3 Users"
11. Verify success message
12. Check user table has 3 new users

### Test 3: Edit User
1. Click "View / edit / delete users"
2. Click "Edit" on any user
3. Change name to "Updated Name"
4. Change role to "Manager"
5. Click "Update User"
6. Verify changes in table

### Test 4: Delete User
1. Click "View / edit / delete users"
2. Click "Delete" on a test user
3. Confirm deletion
4. Verify user removed from table
5. Try to login as deleted user
6. Verify login fails

## Troubleshooting

### Excel Template Won't Download
- Check browser download settings
- Try different browser
- Ensure popup blocker is disabled

### File Upload Not Working
- Ensure file is .xlsx or .xls (not .csv)
- Check file isn't corrupted
- Try re-downloading template
- Verify column names match exactly

### No Preview After Upload
- Check file format is correct
- Open file in Excel to verify structure
- Ensure first row has column headers
- Look for error message

### Some Users Failed
- Check error details in response
- Verify email uniqueness
- Verify Employee ID uniqueness
- Check all required fields filled

### Can't See User Management Menu
- Must be logged in as CEO
- Logout and login again
- Clear browser cache
- Check user role in database

## Best Practices

1. **Always use the template** - Download and modify it
2. **Test with small batch** - Upload 2-3 users first
3. **Check preview carefully** - Verify data before creating
4. **Keep backups** - Save Excel file for records
5. **Use consistent format** - Same pattern for Employee IDs
6. **Document passwords** - Tell users their default password
7. **Regular cleanup** - Delete unused accounts

## Security Notes

- ✅ Only CEO can access User Management
- ✅ All passwords hashed (bcrypt)
- ✅ Email uniqueness enforced
- ✅ Employee ID uniqueness enforced
- ✅ Soft delete preserves audit trail
- ⚠️ Default password is "password123" - users should change it
- ⚠️ No email notifications sent - inform users manually

## Next Steps

After creating users:

1. **Inform users** of their credentials
2. **Remind them** to change password on first login
3. **Verify permissions** - test each role works correctly
4. **Document** - keep record of who has what role
5. **Monitor** - regularly review user accounts

## Support

**If something doesn't work:**
1. Check this guide
2. Review console logs (F12 in browser)
3. Check backend logs (terminal running npm start)
4. Verify you're logged in as CEO
5. Try in incognito/private window

**Common Issues:**
- Browser cache: Clear cache and reload
- Token expired: Logout and login again
- Network error: Check backend is running
- Permission denied: Verify CEO role

---

**Remember:** 
- Excel template has **sample data** - delete it and add your users
- Template downloads as **real Excel file** (.xlsx), not CSV
- All users get **same default password**: password123
- User Management is **CEO-only** feature
