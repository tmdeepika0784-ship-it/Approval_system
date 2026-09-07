# Edit Request Data-Loading Bug Fix - Test Plan

## Issue Fixed
When opening Edit Request, the saved Request Reason and associated documents were not being loaded from the database. The form would show "Please select a reason" even though a reason was previously selected during creation.

## Root Cause
The backend `createRequest` controller was not accepting and saving the `requestReason` and `requestReasonOther` fields that the frontend was sending. These fields were defined in the Request model but never populated during request creation.

## Solution Implemented

### Backend Fix (requestController.js - Line 12)
**Before:**
```javascript
const { title, description, requestType, priority, documents } = req.body;
```

**After:**
```javascript
const { title, description, requestType, priority, requestReason, requestReasonOther, documents } = req.body;
```

**Why:** Now the backend accepts and stores the requestReason and requestReasonOther fields when creating a request.

### Backend Implementation (requestController.js - Line 48)
The fields are now saved to the database when creating the request:
```javascript
const request = await Request.create({
  title,
  description,
  requestType,
  priority: 'medium',
  createdBy: req.user.id,
  currentStage: 'Employee',
  currentHandler: req.user.id,
  workflow: workflow,
  requestReason,           // NOW SAVED
  requestReasonOther,      // NOW SAVED
  documents: parsedDocuments,
  ...
});
```

### Frontend Fix (RequestDetails.js - Line 366)
When opening the edit form, fresh data is now fetched from the backend:
```javascript
const handleRevertAction = async (action) => {
  if (action === 'edit') {
    try {
      const response = await requestAPI.getById(id);
      const latestRequest = response.data.request;
      
      const currentDocs = Array.isArray(latestRequest.documents) ? latestRequest.documents : [];
      const savedReason = latestRequest.requestReason || '';
      const savedReasonOther = latestRequest.requestReasonOther || '';
      
      setEditFormData({
        title: latestRequest.title || '',
        description: latestRequest.description || '',
        requestType: latestRequest.requestType || 'HR Request',
        requestReason: savedReason,        // Pre-selected from database
        requestReasonOther: savedReasonOther,
        documents: currentDocs              // Pre-loaded from database
      });
      setEditDocuments(currentDocs);
    } catch (err) {
      console.error('Failed to fetch request for edit:', err);
      setEditError('Failed to load request data for editing');
    }
  }
};
```

### Frontend Display Logic (RequestDetails.js - Line 946 & 1080)
The dropdown and documents section work together:
1. **Line 946:** Dropdown only shows "Select a reason..." placeholder when requestReason is empty
2. **Line 1080:** Documents section displays when requestReason is pre-selected and not 'Other'

## Complete Flow After Fix

### Step 1: Create Request (Frontend)
- User selects Request Type (e.g., "HR Request")
- User selects Request Reason (e.g., "Leave Approval")
- User uploads required document
- Frontend sends to backend with `requestReason: "Leave Approval"` and document

### Step 2: Backend Saves (createRequest)
- Receives requestReason and requestReasonOther
- Stores in database: `requestReason: "Leave Approval"`
- Stores documents array with uploaded file

### Step 3: User Opens Edit (Within 5 minutes)
- Clicks "Edit Request" button
- handleRevertAction calls `requestAPI.getById(id)`
- Backend getRequest returns request with `requestReason: "Leave Approval"` and documents

### Step 4: Edit Form Displays
- Dropdown shows "Leave Approval" (not "Please select...")
- Documents section automatically shows uploaded file
- User can modify or keep as-is
- User can remove and re-upload documents

## Fields Involved

### Request Model (backend/src/models/Request.js)
- `requestReason` (String): Stores predefined reason selection
- `requestReasonOther` (String): Stores custom reason if "Other" is selected
- `documents` (Array): Stores uploaded document references

### CreateRequest Page (frontend/src/pages/CreateRequest.js)
- Validates requestReason is selected (line 180-183)
- Sends requestReason and requestReasonOther in request body (line 224-225)
- Shows document upload section when reason is selected (line 433)

### RequestDetails Page (frontend/src/pages/RequestDetails.js)
- Fetches fresh request data when opening edit form (line 386)
- Pre-populates editFormData with requestReason and documents (line 390-397)
- Shows pre-selected reason in dropdown (line 946)
- Shows documents when reason is pre-selected (line 1080)

## Verification Checklist

- [✓] Backend syntax valid: `node -c src/controllers/requestController.js`
- [✓] Frontend builds: `npm run build` (warnings only, no errors)
- [ ] Manual test: Create HR Request with reason + document
- [ ] Manual test: Wait 2 minutes, click Edit Request
- [ ] Verify: Dropdown shows selected reason (not "Please select...")
- [ ] Verify: Documents section displays uploaded file
- [ ] Manual test: Try with all request types (HR, IT & Research, Finance)
- [ ] Manual test: Try with "Other" custom reason
- [ ] Manual test: Edit existing request, verify documents persist
- [ ] Manual test: Edit existing request, remove and re-upload document

## Database Query to Verify Data Saved
```javascript
db.requests.findOne({ title: "Your Request Title" }, 
  { requestReason: 1, requestReasonOther: 1, documents: 1 })
```

Should return:
```javascript
{
  _id: ObjectId(...),
  requestReason: "Leave Approval",  // Should be populated (not empty)
  requestReasonOther: null,          // null for predefined reasons
  documents: [
    {
      fileName: "...",
      originalName: "approval.pdf",
      documentType: "Leave Approval",
      fileSize: 12345,
      uploadedAt: ISODate(...)
    }
  ]
}
```

## No Other Changes Made
- ✓ UI remains unchanged
- ✓ Workflow logic unchanged
- ✓ Permissions unchanged
- ✓ Database schema unchanged (fields already existed)
- ✓ Other functionality preserved
