/**
 * Diagnostics utility to check system state and verify auto-forward setup
 */

const Request = require('../models/Request');
const User = require('../models/User');
const { ROLES } = require('../config/roles');

async function checkSystemState() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 SYSTEM DIAGNOSTICS - 5-MINUTE AUTO-FORWARD VERIFICATION');
  console.log('='.repeat(70) + '\n');

  try {
    // 1. Check database connection
    console.log('1️⃣  DATABASE CONNECTION');
    console.log('   Status: ✅ Connected (diagnostics running)\n');

    // 2. Check users exist
    console.log('2️⃣  USERS IN SYSTEM');
    const employees = await User.find({ role: ROLES.EMPLOYEE }).select('name email role');
    const managers = await User.find({ role: ROLES.MANAGER }).select('name email role');
    
    console.log(`   Employees: ${employees.length}`);
    employees.forEach(e => console.log(`     - ${e.name} (${e.email})`));
    
    console.log(`   Managers: ${managers.length}`);
    managers.forEach(m => console.log(`     - ${m.name} (${m.email})`));
    console.log();

    // 3. Check pending requests
    console.log('3️⃣  PENDING REQUESTS');
    const pendingRequests = await Request.find({ overallStatus: 'pending' })
      .populate('createdBy currentHandler', 'name email role')
      .sort({ createdAt: -1 })
      .limit(5);

    if (pendingRequests.length === 0) {
      console.log('   No pending requests\n');
    } else {
      console.log(`   Found ${pendingRequests.length} pending request(s):`);
      pendingRequests.forEach(req => {
        const now = new Date();
        const timeUntilDeadline = req.revertDeadline ? 
          Math.floor((req.revertDeadline.getTime() - now.getTime()) / 1000) : 'N/A';
        const isExpired = req.revertDeadline && req.revertDeadline <= now;
        
        console.log(`\n   📋 ${req.requestId}:`);
        console.log(`      Title: ${req.title}`);
        console.log(`      Created: ${req.createdAt.toISOString()}`);
        console.log(`      Current Stage: ${req.currentStage}`);
        console.log(`      Current Handler: ${req.currentHandler?.name || 'N/A'}`);
        console.log(`      Deadline: ${req.revertDeadline?.toISOString() || 'N/A'}`);
        console.log(`      Time Until Deadline: ${timeUntilDeadline} seconds`);
        console.log(`      Status: ${isExpired ? '⏰ EXPIRED' : '✅ ACTIVE'}`);
        console.log(`      Can Revert: ${req.canRevert}`);
        console.log(`      Is Reverted: ${req.isReverted}`);
      });
      console.log();
    }

    // 4. Check for requests ready to forward
    console.log('4️⃣  REQUESTS READY FOR AUTO-FORWARD');
    const now = new Date();
    const readyToForward = await Request.find({
      currentStage: 'Employee',
      revertDeadline: { $exists: true, $lte: now },
      overallStatus: 'pending',
      canRevert: true,
      isReverted: { $ne: true }
    }).populate('createdBy currentHandler', 'name email role');

    if (readyToForward.length === 0) {
      console.log('   No requests ready for auto-forward\n');
    } else {
      console.log(`   ⚠️  FOUND ${readyToForward.length} request(s) READY FOR AUTO-FORWARD:`);
      readyToForward.forEach(req => {
        console.log(`\n   📋 ${req.requestId}:`);
        console.log(`      Title: ${req.title}`);
        console.log(`      Created By: ${req.createdBy?.name}`);
        console.log(`      Deadline Passed: ${(now.getTime() - req.revertDeadline.getTime()) / 1000} seconds ago`);
        console.log(`      ⚠️  THIS REQUEST SHOULD HAVE BEEN AUTO-FORWARDED!`);
      });
      console.log();
    }

    // 5. Check recently transferred requests
    console.log('5️⃣  RECENTLY TRANSFERRED REQUESTS (Manager stage)');
    const transferred = await Request.find({ currentStage: 'Manager' })
      .populate('createdBy currentHandler', 'name email role')
      .sort({ updatedAt: -1 })
      .limit(5);

    if (transferred.length === 0) {
      console.log('   No requests in Manager stage\n');
    } else {
      console.log(`   Found ${transferred.length} request(s) with Manager:`);
      transferred.forEach(req => {
        const timeSinceUpdate = Math.floor((Date.now() - req.updatedAt.getTime()) / 1000);
        console.log(`\n   📋 ${req.requestId}:`);
        console.log(`      Title: ${req.title}`);
        console.log(`      Created By: ${req.createdBy?.name}`);
        console.log(`      Current Handler (Manager): ${req.currentHandler?.name}`);
        console.log(`      Updated: ${req.updatedAt.toISOString()}`);
        console.log(`      ${timeSinceUpdate} seconds ago`);
        console.log(`      Can Revert: ${req.canRevert} (should be false after auto-forward)`);
      });
      console.log();
    }

    // 6. Workflow verification
    console.log('6️⃣  WORKFLOW CONFIGURATION');
    const WORKFLOW_PATHS = require('../config/roles').WORKFLOW_PATHS;
    console.log('   Request Types and Workflows:');
    Object.entries(WORKFLOW_PATHS).forEach(([type, path]) => {
      console.log(`     - ${type}: ${path.join(' → ')}`);
    });
    console.log();

    console.log('='.repeat(70));
    console.log('✅ DIAGNOSTICS COMPLETE');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error running diagnostics:', error.message);
  }
}

module.exports = {
  checkSystemState
};
