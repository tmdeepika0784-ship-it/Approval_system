# Flagged Requests & Automatic Escalation Implementation

## Summary
Implemented automatic escalation for requests that exceed the 10 working-hour SLA threshold with proper workflow routing and visibility management.

## Changes Made

### 1. Backend - SLA Service (slaService.js)
**Added automatic escalation logic:**
- Escalation rules mapping for each role:
  - Manager → Next department (HR, IT & Research, or Finance based on request type)
  - HR → General Manager
  - IT & Research → General Manager
  - Finance → Accountant
  - Accountant → General Manager
  - General Manager → CEO
  - CEO → No escalation (final authority)

**Implementation details:**
- `escalateRequest()` function handles the escalation process
- When a request is flagged (10 working hours exceeded):
  1. Request is marked as isFlagged = true
  2. Request is immediately escalated to the next authority
  3. escalationHistory is updated with from/to roles and timestamp
  4. currentHandler and currentStage are updated
  5. Same request object is used (no duplication)

**Key features:**
- Uses existing workflow paths for routing
- Preserves all request data (only updates stage and handler)
- Maintains audit trail via escalationHistory

### 2. Database - Request Model (Request.js)
**Added escalationHistory field:**
```javascript
escalationHistory: [escalationHistorySchema]
```

**escalationHistorySchema contains:**
- from: String (role the request was escalated FROM)
- to: String (role the request was escalated TO)
- reason: String (default: "SLA Breach")
- escalatedAt: Date (timestamp of escalation)
- escalatedBy: ObjectId ref to User (null for system escalations)

**Benefits:**
- Complete audit trail of all escalations
- Identifies where request was flagged originally
- Tracks system vs. manual escalations

### 3. Backend - Request Controller (requestController.js)
**Updated getFlaggedRequests() visibility rules:**

**For CEO:**
- Sees ALL flagged requests: `isFlagged: true, overallStatus: 'pending'`
- Can filter by currentStage to see which role each request is at

**For Non-CEO roles (Manager, HR, IT & Research, Finance, Accountant, General Manager):**
- See requests currently assigned to them: `currentStage = their role`
- See requests escalated FROM them: `escalationHistory.from = their role`
- This allows both originating and escalated-to authorities to see the request

**Result:**
- Same request is visible to multiple authorities
- No duplicate requests in MongoDB
- Correct visibility based on workflow position and escalation history

### 4. Frontend - No Changes Required
**Why no frontend changes needed:**
- Backend API already filters correctly
- Frontend FlaggedRequests page works as-is
- CEO dropdown shows counts by currentStage (correct - shows where each request is)
- Non-CEO roles only see relevant flagged requests (current + escalated from them)
- All existing UI/workflow/design preserved

## Escalation Flow Example

### Scenario: Finance Request flagged at Manager stage
1. **Created:** Employee creates Finance Request
2. **Stage 1:** Manager receives it (currentStage: Manager, currentHandler: Manager user)
3. **10 hrs elapsed:** Request flagged automatically
4. **Escalation 1:** Request immediately escalated to Finance
   - currentStage: Finance
   - currentHandler: Finance user
   - escalationHistory[0]: { from: Manager, to: Finance, reason: SLA Breach }
   - Manager can still see it (in FlaggedRequests via escalationHistory.from)
   - Finance sees it (in FlaggedRequests via currentStage)

5. **If Finance doesn't act for 10 more hours:**
   - Request escalated to Accountant
   - escalationHistory[1]: { from: Finance, to: Accountant }
   - Finance can see it (escalated from Finance)
   - Accountant can see it (currentStage)

6. **If Accountant doesn't act:**
   - Request escalated to General Manager
   - General Manager is final authority before CEO

## Visibility Rules Summary

| Role | Sees | Query |
|------|------|-------|
| CEO | All flagged requests | `isFlagged: true, overallStatus: pending` |
| Manager | Current + escalated from Manager | `currentStage: Manager OR escalationHistory.from: Manager` |
| HR | Current + escalated from HR | `currentStage: HR OR escalationHistory.from: HR` |
| IT & Research | Current + escalated from IT & Research | `currentStage: IT & Research OR escalationHistory.from: IT & Research` |
| Finance | Current + escalated from Finance | `currentStage: Finance OR escalationHistory.from: Finance` |
| Accountant | Current + escalated from Accountant | `currentStage: Accountant OR escalationHistory.from: Accountant` |
| General Manager | Current + escalated from GM | `currentStage: General Manager OR escalationHistory.from: General Manager` |

## Database Optimization
- Indexed on `isFlagged: 1` for efficient flagged request queries
- Indexed on `currentHandler, overallStatus` for stage handler queries
- escalationHistory array indexed for fast lookups of escalation history

## Key Implementation Points

✅ **No Duplicate Requests**
- Same request object is escalated (not copied)
- Only currentStage and currentHandler are updated
- escalationHistory tracks the escalation chain

✅ **Automatic Escalation**
- Triggered automatically when flagging occurs (10 working hours)
- No manual intervention needed
- Runs as part of hourly SLA check

✅ **Working Hours Calculation**
- Uses existing 10 working-hour SLA (9 AM - 6 PM, Mon-Fri)
- Excludes weekends and holidays
- Accurate escalation timing

✅ **Visibility & Audit Trail**
- Originating authority sees flagged request
- Escalated-to authority sees flagged request
- CEO sees all flagged requests
- Complete escalation history maintained
- No data loss or duplication

✅ **UI/Workflow Preservation**
- No changes to existing UI design
- No changes to workflow rules
- No changes to permissions
- Frontend works without modification
- Existing SLA display continues to work

## Testing Recommendations

1. **Unit Test:** Verify escalation rules for each role
2. **Integration Test:** Create request, wait 10+ hours (simulate), verify:
   - Request is flagged
   - Request escalated to correct next stage
   - escalationHistory populated correctly
   - Correct authorities can see the request
   - No duplicate requests created

3. **Visibility Test:** For each role, verify FlaggedRequests API returns:
   - Requests they are currently handling
   - Requests escalated from them (if applicable)

4. **CEO Test:** Verify CEO can see all flagged requests and filter by stage

## Related Files Modified
- `/backend/src/services/slaService.js` - Escalation logic
- `/backend/src/models/Request.js` - escalationHistory field
- `/backend/src/controllers/requestController.js` - Visibility rules
- No frontend changes required

## Deployment Notes
- No database migration needed (escalationHistory is optional field)
- Existing flagged requests will not have escalationHistory (null/empty array)
- New flagged requests will populate escalationHistory on escalation
- SLA check continues to run hourly as before
