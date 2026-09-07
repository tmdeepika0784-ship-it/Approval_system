# Complete End-to-End Test Plan for 5-Minute Auto-Forward

## Prerequisites
- Backend running on port 5001
- MongoDB running on localhost:27017
- Frontend running on port 3000
- Both Employee and Manager users exist in the system

## Test Procedure

### Phase 1: Setup & Baseline (Before Test)

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```
   
   Look for:
   ```
   Server running in development mode on port 5001
   MongoDB Connected: localhost
   🚀 REQUEST AUTO-FORWARDING SERVICE STARTED
      Checking every 30 seconds for expired requests...
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```
   
   Expect: React dev server on port 3000

3. **Verify Database Connection:**
   ```bash
   mongosh
   > use request_management
   > db.requests.find().limit(1)
   ```

---

### Phase 2: Submit Test Request

1. **Employee Login:**
   - Navigate to http://localhost:3000
   - Login as Employee (e.g., john@test.com / password)

2. **Create Request:**
   - Click "Create Request"
   - Fill in:
     - Title: "Auto-Forward Test Request"
     - Description: "Testing 5-minute automatic transfer"
     - Request Type: "HR Request" (or any type)
     - Priority: "Medium"
   - Click Submit
   - **NOTE EXACT SUBMISSION TIME** (e.g., 10:00:00 AM)
   - **NOTE EXACT REQUEST ID** from response

3. **Console Output Expected:**
   ```
   Request created successfully. You have 5 minutes to edit or cancel 
   before it is sent to the manager.
   ```

---

### Phase 3: Monitor Service (During 5-Minute Wait)

1. **Watch Backend Console:**
   
   Every 30 seconds, you should see:
   ```
   [2024-08-31T10:00:30.000Z] ⏱️ AUTO-FORWARD CHECK RUNNING
     Query: {"currentStage":"Employee","revertDeadline":{"$lte":"..."},...}
     Found 0 request(s) ready for transfer
     ℹ️ No requests ready for transfer
   ```

2. **Timing Checks:**
   - T+30: Check (should say "No requests ready")
   - T+60: Check (should say "No requests ready")
   - T+90: Check (should say "No requests ready")
   - T+120: Check (should say "No requests ready")
   - T+150: Check (should say "No requests ready")
   - T+180: Check (should say "No requests ready")
   - T+210: Check (should say "No requests ready")
   - T+240: Check (should say "No requests ready")
   - T+270: Check (should say "No requests ready")
   - **T+300: Check (should FIND and TRANSFER the request)**

3. **Expected Transfer Output (at T+300):**
   ```
   [2024-08-31T10:05:00.000Z] ⏱️ AUTO-FORWARD CHECK RUNNING
     Query: {"currentStage":"Employee","revertDeadline":{"$lte":"..."},...}
     Found 1 request(s) ready for transfer
     
     📋 Processing REQ-000123:
       Created: 2024-08-31T10:00:00.123Z
       Submitted: 2024-08-31T10:00:00.456Z
       Deadline: 2024-08-31T10:05:00.000Z
       Current Stage: Employee
       Current Handler: John
       Time until deadline: 0 seconds
       → Transferring to: Sarah (sarah@test.com)
       ✅ TRANSFER COMPLETE
         New currentStage: Manager
         New currentHandler: <sarah_id>
         canRevert: false
   ```

---

### Phase 4: Database Verification (After T+300)

1. **Query MongoDB:**
   ```bash
   mongosh
   > use request_management
   > db.requests.find({ requestId: "REQ-000123" }).pretty()
   ```

2. **Verify Fields:**
   ```javascript
   {
     _id: ObjectId("..."),
     requestId: "REQ-000123",
     title: "Auto-Forward Test Request",
     createdBy: ObjectId("employee_id"),
     currentStage: "Manager",           ✅ Should be "Manager"
     currentHandler: ObjectId("manager_id"),  ✅ Should be manager's ID
     overallStatus: "pending",          ✅ Should be "pending"
     submittedAt: ISODate("2024-08-31T10:00:00.456Z"),
     revertDeadline: ISODate("2024-08-31T10:05:00.000Z"),
     canRevert: false,                  ✅ Should be false
     isReverted: false,                 ✅ Should be false
     workflow: [
       {
         role: "Manager",
         status: "pending",
         arrivedAt: ISODate("2024-08-31T10:05:00.123Z"),  ✅ Should be around T+300
         actionBy: null,                ✅ Not yet acted on
         actionDate: null,
         comments: null
       },
       ...
     ],
     createdAt: ISODate("2024-08-31T10:00:00.000Z"),
     updatedAt: ISODate("2024-08-31T10:05:00.456Z"),  ✅ Should be around T+300
     lastActivityAt: ISODate("2024-08-31T10:05:00.456Z")
   }
   ```

---

### Phase 5: Manager Dashboard Verification

1. **Employee Page Check (Before Manager Login):**
   - Employee should still see their request in "All Requests"
   - Status should show "Pending"
   - Note: Employee CANNOT revert anymore (button should be disabled)

2. **Manager Login:**
   - Logout Employee
   - Login as Manager (e.g., sarah@test.com / password)

3. **Check Dashboard:**
   - Manager should see the transferred request in:
     - "Dashboard" → Recent Requests
     - "All Requests" with status "Pending"

4. **Verify Request Details:**
   - Click on the request
   - Should show:
     - Title: "Auto-Forward Test Request"
     - Current Stage: "Manager"
     - Status: "Pending"
     - Workflow: Shows transfer from Employee to Manager at T+300

---

### Phase 6: Complete Workflow (Optional)

1. **Manager Actions:**
   - Manager can now:
     - Forward to next stage
     - Reject
     - Send Query to Employee
     - Flag

2. **Verify No Duplicates:**
   - After Manager action, only ONE request should exist
   - Should NOT create duplicate

---

## Expected Success Criteria

✅ Request created at T=0
✅ Employee can see request in first 5 minutes
✅ Service finds request at T=300
✅ Service transfers to Manager (logs show transfer)
✅ Database shows updated fields:
   - currentStage = 'Manager'
   - currentHandler = manager._id
   - canRevert = false
   - workflow[0].arrivedAt updated
✅ Manager can see request in their dashboard
✅ No duplicate requests
✅ Workflow history shows transfer

---

## Troubleshooting

### If Service Doesn't Find Request at T+300:
1. Check backend console for "AUTO-FORWARD CHECK RUNNING" messages
   - If not appearing: Service might not have started
   - Restart backend: `npm start`

2. Check query matches database state:
   ```
   mongosh
   > db.requests.find({
       currentStage: 'Employee',
       revertDeadline: { $lte: new Date() },
       overallStatus: 'pending',
       canRevert: true,
       isReverted: { $ne: true }
     })
   ```

3. If query doesn't find the request:
   - Check `revertDeadline` value in database
   - Check `currentStage` is exactly 'Employee'
   - Check `overallStatus` is exactly 'pending'
   - Check `canRevert` is true
   - Check `isReverted` is not true

### If Service Finds Request But Doesn't Transfer:
1. Check for errors in console
2. Check Manager exists in database:
   ```
   mongosh
   > db.users.find({ role: "Manager" })
   ```
3. Check workflow is initialized correctly

### If Manager Doesn't See Request:
1. Verify `currentHandler` in database is Manager's ID
2. Verify Manager's ID in session matches database
3. Check Manager's getAllRequests query:
   ```
   mongosh
   > db.requests.find({
       $or: [
         { currentHandler: ObjectId("manager_id") },
         { 'workflow.actionBy': ObjectId("manager_id") }
       ]
     })
   ```

---

## Notes

- Tests can be repeated with different request types
- Each test should use a fresh request (don't revert during the wait)
- Console timestamps are in ISO format (UTC)
- Check system time is correct on the server

