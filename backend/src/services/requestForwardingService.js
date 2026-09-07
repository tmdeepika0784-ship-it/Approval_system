const Request = require('../models/Request');
const workflowService = require('./workflowService');
const { WORKFLOW_PATHS } = require('../config/roles');

// Check and forward requests that have passed the 5-minute window
const checkAndForwardRequests = async () => {
  try {
    const now = new Date();
    
    // ALWAYS log each check
    console.log(`\n[${now.toISOString()}] ⏱️ AUTO-FORWARD CHECK RUNNING`);

    // Find requests that are still with employee and past the deadline
    const query = {
      currentStage: 'Employee',
      revertDeadline: { $exists: true, $lte: now },
      overallStatus: 'pending',
      isReverted: { $ne: true }
    };
    
    console.log(`  Query: ${JSON.stringify(query)}`);

    const requestsToForward = await Request.find(query)
      .populate('createdBy currentHandler', 'name email role');

    console.log(`  Found ${requestsToForward.length} request(s) ready for transfer`);

    if (requestsToForward && requestsToForward.length > 0) {
      for (const request of requestsToForward) {
        try {
          console.log(`\n  📋 Processing ${request.requestId}:`);
          console.log(`    Created: ${request.createdAt.toISOString()}`);
          console.log(`    Submitted: ${request.submittedAt?.toISOString() || 'N/A'}`);
          console.log(`    Deadline: ${request.revertDeadline.toISOString()}`);
          console.log(`    Current Stage: ${request.currentStage}`);
          console.log(`    Current Handler: ${request.currentHandler?.name}`);
          console.log(`    Time until deadline: ${(request.revertDeadline.getTime() - now.getTime()) / 1000} seconds`);

          // Get the workflow for this request type
          const workflow = WORKFLOW_PATHS[request.requestType];
          if (!workflow || workflow.length === 0) {
            console.error(`    ✗ Invalid workflow for request type: ${request.requestType}`);
            continue;
          }

          // First stage should be Manager
          const managerStage = workflow[0];
          if (managerStage !== 'Manager') {
            console.error(`    ✗ Unexpected first stage in workflow: ${managerStage}`);
            continue;
          }

          // Get manager for this request type
          const manager = await workflowService.getHandlerForStage('Manager', request.requestType);

          if (!manager) {
            console.error(`    ✗ No manager available for request type: ${request.requestType}`);
            continue;
          }

          console.log(`    → Transferring to: ${manager.name} (${manager.email})`);

          // Update request to forward to manager
          request.currentStage = 'Manager';
          request.currentHandler = manager._id;
          request.canRevert = false;
          
          // Update workflow - set first stage (Manager) as arrived
          if (request.workflow && request.workflow.length > 0) {
            request.workflow[0].arrivedAt = new Date();
            request.workflow[0].status = 'pending';
          }
          
          request.lastActivityAt = new Date();
          
          const savedRequest = await request.save();
          
          console.log(`    ✅ TRANSFER COMPLETE`);
          console.log(`      New currentStage: ${savedRequest.currentStage}`);
          console.log(`      New currentHandler: ${savedRequest.currentHandler}`);
          console.log(`      canRevert: ${savedRequest.canRevert}`);
        } catch (error) {
          console.error(`    ✗ Error forwarding ${request.requestId}:`, error.message);
        }
      }
    } else {
      console.log(`  ℹ️ No requests ready for transfer`);
    }
  } catch (error) {
    console.error('✗ Critical error in checkAndForwardRequests:', error.message);
  }
};

// Run check every 30 seconds (aggressive check for immediate transfer)
const startForwardingService = () => {
  console.log('\n🚀 REQUEST AUTO-FORWARDING SERVICE STARTED');
  console.log('   Checking every 30 seconds for expired requests...\n');
  
  // Run immediately on startup
  checkAndForwardRequests();
  
  // Then run every 30 seconds for immediate detection
  setInterval(checkAndForwardRequests, 30 * 1000);
};

module.exports = {
  startForwardingService,
  checkAndForwardRequests
};
