# Fresh Start Guide - Request Management System

## ✅ System Status: CLEAN & READY

All test/demo requests have been removed. The system is now ready for fresh testing with a clean database.

---

## 🎯 What You Can Do Now

### 1. **Create New Requests**
- Log in as Employee
- Go to "Create Request"
- Create HR, IT, or Finance requests
- All requests will have fresh start (no legacy data)

### 2. **Test Complete Workflow**
- Employee creates request
- Manager receives and processes
- Departments handle appropriately
- General Manager reviews
- CEO approves/rejects

### 3. **Test SLA & Flagging**
- Create requests and monitor SLA
- Watch automatic flagging at 10 working hours
- See automatic escalation
- Track flagged requests across roles

### 4. **Test Queries**
- Send queries between authorities
- Respond to queries
- Continue request processing

### 5. **Test All Roles**
- Employee (create, view, revert)
- Manager (review, forward, reject)
- Department roles (process, forward, reject)
- Accountant (finance processing)
- General Manager (final review)
- CEO (approve/reject final)

---

## 👥 Available User Accounts (9 Total)

All users remain intact and ready to use:

### CEO
- **Username:** john@company.com
- **Password:** (as registered)
- **Role:** CEO

### Managers
- **Sarah:** sarah@company.com - Finance Manager
- **Lisa IT:** lisa@company.com - IT & Research Manager  
- **Mike:** mike@company.com - Finance Manager

### Department Roles
- **Tom:** tom@company.com - HR
- **Lisa HR:** lisahr@company.com - HR
- **James:** james@company.com - IT & Research
- **David:** david@company.com - Accountant

### Management
- **General Manager:** gm@company.com

---

## 🧪 Testing Scenarios

### Scenario 1: HR Request Approval
```
1. Log in as Employee
2. Create "HR Request"
3. Log in as Manager
4. Review and Forward to HR
5. Log in as HR
6. Review and Forward to General Manager
7. Log in as General Manager
8. Forward to CEO
9. Log in as CEO
10. Approve/Reject
```

### Scenario 2: IT Request with Query
```
1. Employee creates IT Request
2. Manager sends Query to Employee
3. Employee responds to Query
4. Manager forwards to IT & Research
5. IT processes and forwards
6. GM reviews and forwards to CEO
7. CEO approves
```

### Scenario 3: Finance Request Processing
```
1. Employee creates Finance Request
2. Manager forwards to Finance
3. Finance reviews and forwards to Accountant
4. Accountant processes and forwards to GM
5. GM forwards to CEO
6. CEO approves
```

### Scenario 4: SLA & Escalation
```
1. Create request (10:00 AM Monday)
2. Request at Manager
3. Wait until after 10 working hours
4. Request auto-flagged and escalated
5. Visible to both Manager (via history) and escalated-to role
6. Can monitor through Flagged Requests page
```

---

## 📊 Database State

**Current Clean State:**
- Requests: 0 (ready for new)
- Queries: 0 (ready for new)
- Users: 9 (all preserved)
- Holidays: Intact
- Configuration: Intact

---

## 🚀 How to Start

### 1. **Start Backend**
```bash
cd backend
npm run dev
# or
npm start
```

### 2. **Start Frontend**
```bash
cd frontend
npm start
```

### 3. **Access Application**
- Open browser: http://localhost:3000
- Login with any user account from the list above

### 4. **Test Request Flow**
- Create requests
- Process through workflow
- Monitor SLA
- Test escalation
- Verify approvals

---

## 🔄 Request Lifecycle

### Workflow Path: HR Request
```
Employee (Create)
    ↓
Manager (Forward/Reject)
    ↓
HR (Forward/Reject)
    ↓
General Manager (Forward/Reject)
    ↓
CEO (Approve/Reject)
```

### Workflow Path: IT Request
```
Employee (Create)
    ↓
Manager (Forward/Reject)
    ↓
IT & Research (Forward/Reject)
    ↓
General Manager (Forward/Reject)
    ↓
CEO (Approve/Reject)
```

### Workflow Path: Finance Request
```
Employee (Create)
    ↓
Manager (Forward/Reject)
    ↓
Finance (Forward/Reject)
    ↓
Accountant (Forward/Reject)
    ↓
General Manager (Forward/Reject)
    ↓
CEO (Approve/Reject)
```

---

## ⏱️ SLA Timeline

- **9 Working Hours:** Reminder sent (if implemented)
- **10 Working Hours:** Request flagged and auto-escalated
- **Next Authority:** Receives flagged request
- **History:** Original authority retains view in flagged history
- **CEO:** Can see all flagged requests and filter by stage

---

## 📋 What to Test

### Functional Tests
- ✅ Create requests with all document types
- ✅ Forward requests through workflow
- ✅ Reject requests with comments
- ✅ Send and respond to queries
- ✅ Edit requests (5-minute window for employees)
- ✅ Revert requests (5-minute window for employees)
- ✅ View request history
- ✅ Monitor SLA times

### Role-Based Tests
- ✅ Employee permissions (create, view, revert)
- ✅ Manager permissions (forward, reject, query)
- ✅ Department role permissions (forward, reject, query)
- ✅ Accountant permissions (forward, reject, query)
- ✅ GM permissions (forward, reject, query)
- ✅ CEO permissions (approve, reject, query, view all)

### SLA & Escalation Tests
- ✅ SLA calculation accuracy
- ✅ Auto-flagging at 10 hours
- ✅ Auto-escalation to next authority
- ✅ Flagged request visibility
- ✅ Escalation history tracking
- ✅ Multiple escalation levels

### Query Tests
- ✅ Send queries across roles
- ✅ Respond to queries
- ✅ Continue request after query resolution
- ✅ Query history tracking

---

## 🎉 Ready to Go!

The system is fully operational and ready for comprehensive testing. 

**Start Creating Requests Now!**

All infrastructure is in place:
- ✅ Database: Clean and ready
- ✅ Backend: All endpoints operational
- ✅ Frontend: All pages ready
- ✅ Users: All accounts available
- ✅ Workflow: All rules configured

Enjoy testing the Request Management System!

---

## 📞 Need to Reset Again?

If you want to start completely fresh again:

```bash
cd backend
node scripts/resetDatabase.js
```

This will:
- Delete all requests and queries
- Keep all users intact
- Show before/after state
- Confirm completion

No data loss except for test requests.
