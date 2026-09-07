# Auto-Forward Bug Fix - Employee to Manager

## Problem
**Requests were NOT automatically moving from Employee to Manager after 5 minutes.**

All old requests were stuck in Employee stage with `canRevert: false`, preventing the auto-forward service from finding them.

## Root Cause
In the `getRequest` endpoint (requestController.js, line 271-275), when anyone viewed a request after the revert deadline had passed, the code was:

```javascript
if (request.revertDeadline && now > request.revertDeadline) {
  request.canRevert = false;
  await request.save();  // ← BUG: Saved immediately!
}
```

This was saving `canRevert: false` to the database every time someone viewed the request BEFORE the auto-forward service could find it.

Meanwhile, the auto-forward query required `canRevert: true`:
```javascript
const query = {
  currentStage: 'Employee',
  revertDeadline: { $exists: true, $lte: now },
  overallStatus: 'pending',
  canRevert: true,  // ← BUG: This prevented old requests from being found!
  isReverted: { $ne: true }
};
```

Result: Auto-forward service never found the requests to forward!

## Solution

### Fix 1: Don't Save canRevert in getRequest (requestController.js)
```javascript
// BEFORE:
if (request.revertDeadline && now > request.revertDeadline) {
  request.canRevert = false;
  await request.save();  // ← Removed this line
}

// AFTER:
if (request.revertDeadline && now > request.revertDeadline) {
  request.canRevert = false;
  // DO NOT SAVE - let auto-forward service handle it
}
```

The property is still set in memory for the API response, but NOT saved to database. This prevents premature marking as non-revertible.

### Fix 2: Remove canRevert Requirement (requestForwardingService.js)
```javascript
// BEFORE:
const query = {
  currentStage: 'Employee',
  revertDeadline: { $exists: true, $lte: now },
  overallStatus: 'pending',
  canRevert: true,  // ← Removed
  isReverted: { $ne: true }
};

// AFTER:
const query = {
  currentStage: 'Employee',
  revertDeadline: { $exists: true, $lte: now },
  overallStatus: 'pending',
  isReverted: { $ne: true }
};
```

Now the auto-forward service only checks for:
1. Still in Employee stage
2. Revert deadline has passed
3. Overall status is still pending
4. Not already reverted

Much simpler and doesn't depend on canRevert flag.

## How It Works Now

### Step 1: Employee Creates Request
- Request saved with `canRevert: true`
- `revertDeadline` set to 5 minutes from now

### Step 2: Someone Views Request Before Deadline
- Endpoint checks if deadline passed
- If deadline NOT passed: request unchanged
- If deadline passed: `canRevert` set to false IN MEMORY only (not saved)
- Response shows `canRevert: false` to frontend
- Request stays unchanged in database ✅

### Step 3: Auto-Forward Service Runs (Every 30 seconds)
- Query finds all Employee stage requests with past deadline
- For each request found:
  - Sets `currentStage: 'Manager'`
  - Assigns to available Manager
  - Updates workflow[0].arrivedAt
  - Sets workflow[0].status = 'pending'
  - Saves to database ✅
- Request is now with Manager

### Step 4: Manager Reviews & Forwards
- Manager can now forward request
- Request moves through workflow normally

## Timeline

**Before Fix:**
```
00:00 - Employee creates REQ-000002
00:05 - Deadline expires
00:06 - Someone views request → canRevert set to false AND saved
00:30 - Auto-forward checks → finds canRevert=false → skips it ❌
Next 24 hours: Request stuck in Employee stage ❌
```

**After Fix:**
```
00:00 - Employee creates REQ-000002
00:05 - Deadline expires
00:06 - Someone views request → canRevert set to false in memory (NOT saved)
00:30 - Auto-forward checks → finds request with past deadline → forwards it ✅
00:31 - Request now with Manager ✅
```

## Files Modified

1. **backend/src/controllers/requestController.js** (Line 273-275)
   - Removed `await request.save()` from getRequest after setting `canRevert: false`
   - Keep the assignment for response, just don't persist

2. **backend/src/services/requestForwardingService.js** (Line 21-26)
   - Removed `canRevert: true` from auto-forward query
   - Query now only checks for: Employee stage + past deadline + pending + not reverted

## Testing

After deploying these changes, any NEW requests created will automatically move to Manager after 5 minutes.

For OLD stuck requests (like REQ-000002 through REQ-000022), you have two options:

**Option 1: Manual Migration Script**
```bash
# Run once to forward all stuck requests to Manager
node scripts/migrate-stuck-requests.js
```

**Option 2: Let auto-forward handle them naturally**
After restarting the server, the auto-forward service will pick them up on the first run and forward them.

## Build Status
✅ Backend syntax valid
✅ Frontend builds successfully

## What Changed
- Fixed auto-forward from Employee to Manager
- Requests no longer get stuck in Employee stage
- canRevert flag no longer blocks auto-forward

## What Didn't Change
- Revert window still 5 minutes
- Revert/Edit functionality unchanged
- Permissions unchanged
- Workflow logic unchanged
- All other functionality preserved
