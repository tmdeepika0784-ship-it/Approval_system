# Workflow Status/History Logic - Verification Report

## Summary
The workflow status/history logic is **ALREADY CORRECTLY IMPLEMENTED**. All stages maintain independent statuses, previous stages are preserved, and each action is properly recorded.

## Workflow Status Flow - Verified

### 1. Request Creation
When an employee creates a request:
- **Workflow array** is initialized with all stages for the request type
- **Initial state**: All stages set to `status: 'pending'`
- **First stage** gets `arrivedAt` timestamp

**Example (HR Request):**
```
Employee creates request
↓
Workflow initialized:
[
  { role: 'Manager', status: 'pending', arrivedAt: null, actionBy: null },
  { role: 'HR', status: 'pending', arrivedAt: null, actionBy: null },
  { role: 'General Manager', status: 'pending', arrivedAt: null, actionBy: null },
  { role: 'CEO', status: 'pending', arrivedAt: null, actionBy: null }
]

Request stays with Employee for 5 minutes (revert window)
currentStage: 'Employee'
currentHandler: Employee (creator)
```

### 2. Auto-Forward to Manager (After 5 minutes)
**File:** `backend/src/services/requestForwardingService.js` (lines 8-98)

When revert deadline passes, auto-forwarding service moves request to Manager:
```javascript
// requestForwardingService.js - checkAndForwardRequests()
request.currentStage = 'Manager';
request.currentHandler = manager._id;
request.workflow[0].arrivedAt = new Date();
request.workflow[0].status = 'pending';
```

**Result:**
```
Workflow after auto-forward:
[
  { role: 'Manager', status: 'pending', arrivedAt: 2024-01-15T10:05:00Z, actionBy: null },
  { role: 'HR', status: 'pending', arrivedAt: null, actionBy: null },
  { role: 'General Manager', status: 'pending', arrivedAt: null, actionBy: null },
  { role: 'CEO', status: 'pending', arrivedAt: null, actionBy: null }
]

currentStage: 'Manager'
currentHandler: manager._id
overallStatus: 'pending'
```

### 3. Manager Forwards Request
**File:** `backend/src/controllers/requestController.js` (lines 243-310)

When Manager clicks Forward:
```javascript
// Step 1: Mark Manager's stage as 'forwarded'
request.workflow = workflowService.updateWorkflowStage(
  request.workflow,
  'Manager',           // Current stage
  'forwarded',         // ← Status changes to FORWARDED
  req.user.id,         // ← Records who (Manager user ID)
  comments             // ← Records their comments
);

// Step 2: Get next stage (HR for HR Request)
const nextStage = workflowService.getNextStage(requestType, 'Manager');
// Returns: 'HR'

// Step 3: Move to next stage
request.currentStage = 'HR';
request.currentHandler = hrHandler._id;

// Step 4: Set arrival time for HR stage
request.workflow = workflowService.setStageArrivalTime(request.workflow, 'HR');
```

**Workflow after Manager forwards:**
```
[
  { 
    role: 'Manager', 
    status: 'forwarded',  ← CHANGED TO FORWARDED
    arrivedAt: 2024-01-15T10:05:00Z,
    actionBy: managerId,  ← Records who took action
    actionDate: 2024-01-15T10:30:00Z,  ← Records when
    comments: 'Looks good, forwarding to HR'  ← Records their comment
  },
  { 
    role: 'HR', 
    status: 'pending',  ← NEXT STAGE NOW SHOWS PENDING
    arrivedAt: 2024-01-15T10:30:00Z,  ← Now has arrival time
    actionBy: null  ← No action yet
  },
  { role: 'General Manager', status: 'pending', arrivedAt: null, actionBy: null },
  { role: 'CEO', status: 'pending', arrivedAt: null, actionBy: null }
]

currentStage: 'HR'
currentHandler: hrId
overallStatus: 'pending' (unchanged - still awaiting action)
```

### 4. HR Forwards Request
Following the same pattern, when HR forwards:

```javascript
// updateWorkflowStage marks HR's workflow entry
workflow[1].status = 'forwarded';
workflow[1].actionBy = hrUserId;
workflow[1].actionDate = new Date();
workflow[1].comments = comments;
```

**Workflow after HR forwards:**
```
[
  { 
    role: 'Manager', 
    status: 'forwarded',  ← UNCHANGED - Previous stage preserved
    arrivedAt: 2024-01-15T10:05:00Z,
    actionBy: managerId,
    actionDate: 2024-01-15T10:30:00Z,
    comments: 'Looks good, forwarding to HR'
  },
  { 
    role: 'HR', 
    status: 'forwarded',  ← CHANGED TO FORWARDED
    arrivedAt: 2024-01-15T10:30:00Z,
    actionBy: hrId,  ← HR user ID
    actionDate: 2024-01-15T11:00:00Z,
    comments: 'Approved by HR, forwarding to GM'
  },
  { 
    role: 'General Manager', 
    status: 'pending',  ← NEXT STAGE NOW PENDING (CURRENT)
    arrivedAt: 2024-01-15T11:00:00Z,  ← Arrival time set
    actionBy: null
  },
  { role: 'CEO', status: 'pending', arrivedAt: null, actionBy: null }
]

currentStage: 'General Manager'
currentHandler: gmId
overallStatus: 'pending' (still awaiting action)
```

### 5. Rejection Example
If at any point an authority rejects, their stage changes to 'rejected':

**Example: HR rejects instead of forwarding**
```
[
  { 
    role: 'Manager', 
    status: 'forwarded',  ← UNCHANGED
    ...
  },
  { 
    role: 'HR', 
    status: 'rejected',  ← CHANGED TO REJECTED
    arrivedAt: 2024-01-15T10:30:00Z,
    actionBy: hrId,
    actionDate: 2024-01-15T11:00:00Z,
    comments: 'Missing required documents'
  },
  { role: 'General Manager', status: 'pending', arrivedAt: null, actionBy: null },
  { role: 'CEO', status: 'pending', arrivedAt: null, actionBy: null }
]

currentStage: 'HR'  ← Stays with HR
currentHandler: hrId
overallStatus: 'rejected'  ← Overall status changes to rejected
```

### 6. CEO Final Approval
When request reaches CEO and they approve:

```javascript
request.workflow = workflowService.updateWorkflowStage(
  request.workflow,
  'CEO',
  'approved',  ← Status changes to APPROVED
  req.user.id,
  comments
);

request.overallStatus = 'approved';
```

**Final workflow after CEO approval (assuming all forwarded):**
```
[
  { 
    role: 'Manager', 
    status: 'forwarded',  ← PRESERVED
    arrivedAt: 2024-01-15T10:05:00Z,
    actionBy: managerId,
    actionDate: 2024-01-15T10:30:00Z,
    comments: 'Looks good, forwarding to HR'
  },
  { 
    role: 'HR', 
    status: 'forwarded',  ← PRESERVED
    arrivedAt: 2024-01-15T10:30:00Z,
    actionBy: hrId,
    actionDate: 2024-01-15T11:00:00Z,
    comments: 'Approved by HR, forwarding to GM'
  },
  { 
    role: 'General Manager', 
    status: 'forwarded',  ← PRESERVED
    arrivedAt: 2024-01-15T11:00:00Z,
    actionBy: gmId,
    actionDate: 2024-01-15T11:30:00Z,
    comments: 'Forwarding to CEO for final approval'
  },
  { 
    role: 'CEO', 
    status: 'approved',  ← CHANGED TO APPROVED
    arrivedAt: 2024-01-15T11:30:00Z,
    actionBy: ceoId,
    actionDate: 2024-01-15T12:00:00Z,
    comments: 'Approved and processed'
  }
]

currentStage: 'CEO'
currentHandler: ceoId
overallStatus: 'approved'  ← Request is now fully approved
```

## Key Implementation Details

### 1. Workflow Stage Schema
**File:** `backend/src/models/Request.js` (lines 1-20)

```javascript
const workflowStageSchema = new mongoose.Schema({
  role: { type: String, required: true },
  status: { 
    type: String,
    enum: ['pending', 'approved', 'rejected', 'forwarded', 'query_sent'],
    default: 'pending'
  },
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actionDate: Date,
  comments: String,
  arrivedAt: { type: Date, default: Date.now }
}, { _id: false });
```

Each stage independently tracks:
- **role**: Stage name (Manager, HR, etc.)
- **status**: Current status (pending/approved/rejected/forwarded/query_sent)
- **actionBy**: User who took action
- **actionDate**: When action was taken
- **comments**: Optional action comments
- **arrivedAt**: When request arrived at this stage

### 2. Workflow Initialization
**File:** `backend/src/services/workflowService.js` (lines 53-61)

```javascript
exports.initializeWorkflow = (requestType) => {
  const workflow = WORKFLOW_PATHS[requestType];
  
  return workflow.map(stage => ({
    role: stage,
    status: 'pending',
    arrivedAt: null
  }));
};
```

Workflow paths from `backend/src/config/roles.js`:
- **HR Request**: Manager → HR → General Manager → CEO
- **IT & Research Request**: Manager → IT & Research → General Manager → CEO
- **Finance Request**: Manager → Finance → Accountant → General Manager → CEO

### 3. Stage Status Update (Core Logic)
**File:** `backend/src/services/workflowService.js` (lines 64-74)

```javascript
exports.updateWorkflowStage = (workflow, stage, status, actionBy, comments) => {
  const stageIndex = workflow.findIndex(w => w.role === stage);
  
  if (stageIndex !== -1) {
    workflow[stageIndex].status = status;      // ← Update status
    workflow[stageIndex].actionBy = actionBy;  // ← Record who
    workflow[stageIndex].actionDate = new Date(); // ← Record when
    workflow[stageIndex].comments = comments;  // ← Record why
  }
  
  return workflow;
};
```

This function:
- Finds the stage by role name (e.g., 'Manager')
- Updates ONLY that stage's entry
- Leaves all other stages untouched
- Returns the modified workflow array

### 4. Next Stage Arrival Time Setup
**File:** `backend/src/services/workflowService.js` (lines 77-84)

```javascript
exports.setStageArrivalTime = (workflow, stage) => {
  const stageIndex = workflow.findIndex(w => w.role === stage);
  
  if (stageIndex !== -1 && !workflow[stageIndex].arrivedAt) {
    workflow[stageIndex].arrivedAt = new Date();
  }
  
  return workflow;
};
```

This sets `arrivedAt` for the next stage when a request moves to it.

### 5. Frontend Display
**File:** `frontend/src/pages/RequestDetails.js` (lines 689-708)

```javascript
{request.workflow.map((stage, index) => {
  const isCurrent = stage.role === request.currentStage;
  const isCompleted = stage.status !== 'pending';
  
  return (
    <div className={`workflow-step ${isCompleted ? 'completed' : ''}`}>
      <div className={`workflow-icon ${isCurrent ? 'current' : isCompleted ? 'completed' : 'pending'}`}>
        {isCompleted ? '✓' : (isCurrent ? '●' : index + 1)}
      </div>
      <div className="workflow-content">
        <div className="workflow-role">{stage.role}</div>
        <div className="workflow-status">
          {getWorkflowStatusLabel(stage.status)}
          {isCurrent && ' (Current)'}
        </div>
      </div>
    </div>
  );
})}
```

Frontend displays:
- Icon: ✓ if completed (status !== 'pending'), ● if current, or stage number
- Role name
- Status label (Pending/Approved/Rejected/Forwarded/Query Sent)
- "(Current)" indicator if it's the current stage

**Status Label Mapping** (`frontend/src/utils/helpers.js`):
```javascript
export const getWorkflowStatusLabel = (status) => {
  const statusMap = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    forwarded: 'Forwarded',
    query_sent: 'Query Sent'
  };
  return statusMap[status] || status;
};
```

## Verification Checklist

✅ **When authority forwards:**
- Current stage → 'forwarded' with actionBy/actionDate/comments
- Next stage → 'pending' with arrivedAt
- Previous stages → PRESERVED unchanged
- Request → moves to next authority

✅ **When authority rejects:**
- Current stage → 'rejected' with actionBy/actionDate/comments
- Request → stays at that stage
- Previous stages → PRESERVED unchanged
- overallStatus → 'rejected'

✅ **When CEO approves:**
- CEO stage → 'approved' with actionBy/actionDate/comments
- Previous stages → PRESERVED with their statuses
- overallStatus → 'approved'
- Request marked as complete

✅ **Stage status independence:**
- Each stage has independent status
- Updating one stage doesn't affect others
- All previous actions recorded in workflow array
- Complete audit trail maintained

✅ **No data overwrites:**
- `updateWorkflowStage` modifies only the target stage
- Finds stage by index, updates in-place
- Returns full workflow array with all stages
- Previous entries never overwritten

## Conclusion

The workflow status/history logic is **CORRECTLY IMPLEMENTED** and requires **NO CHANGES**. The system properly:

1. ✅ Initializes all stages with 'pending' status
2. ✅ Marks current stage as 'forwarded' when forwarded
3. ✅ Marks current stage as 'rejected' when rejected
4. ✅ Marks CEO stage as 'approved' when approved
5. ✅ Preserves all previous stages with their statuses
6. ✅ Records actionBy, actionDate, comments for each action
7. ✅ Tracks arrivedAt for each stage
8. ✅ Displays stages with correct status labels
9. ✅ Shows "(Current)" indicator on current stage
10. ✅ Maintains complete workflow history

**All requirements are met. No modifications needed.**
