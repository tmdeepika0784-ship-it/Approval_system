const Request = require('../models/Request');
const Holiday = require('../models/Holiday');
const User = require('../models/User');
const { WORKFLOW_PATHS } = require('../config/roles');
const workflowService = require('./workflowService');

// Working hours: 9 AM to 6 PM (9 hours)
const WORKING_HOURS_START = 9;
const WORKING_HOURS_END = 18;
const WORKING_HOURS_PER_DAY = 9;
const REMINDER_HOURS = 9;
const FLAG_HOURS = 10;

// Escalation rules based on current stage
const ESCALATION_RULES = {
  'Manager': (requestType) => workflowService.getNextStage(requestType, 'Manager'),
  'HR': 'General Manager',
  'IT & Purchase': 'General Manager',
  'Finance': 'Accountant',
  'Accountant': 'General Manager',
  'General Manager': 'CEO',
  'CEO': null // Final authority, no escalation
};

// Check if a date is a weekend
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

// Check if a date is a holiday
const isHoliday = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const holiday = await Holiday.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
  
  return !!holiday;
};

// Check if a datetime is within working hours
const isWorkingHour = (date) => {
  const hour = date.getHours();
  return hour >= WORKING_HOURS_START && hour < WORKING_HOURS_END;
};

// Calculate working hours between two dates
const calculateWorkingHours = async (startDate, endDate) => {
  let totalHours = 0;
  let currentDate = new Date(startDate);
  
  while (currentDate < endDate) {
    if (!isWeekend(currentDate) && !(await isHoliday(currentDate))) {
      // Check if current time is within working hours
      if (isWorkingHour(currentDate)) {
        const nextHour = new Date(currentDate);
        nextHour.setHours(currentDate.getHours() + 1, 0, 0, 0);
        
        if (nextHour <= endDate && nextHour.getHours() <= WORKING_HOURS_END) {
          totalHours += 1;
        } else if (endDate > currentDate && currentDate.getHours() < WORKING_HOURS_END) {
          const minutesInHour = (endDate - currentDate) / (1000 * 60);
          totalHours += minutesInHour / 60;
          break;
        }
      }
    }
    
    // Move to next hour
    currentDate.setHours(currentDate.getHours() + 1, 0, 0, 0);
    
    // Skip to next working day start if outside working hours
    if (currentDate.getHours() >= WORKING_HOURS_END || currentDate.getHours() < WORKING_HOURS_START) {
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(WORKING_HOURS_START, 0, 0, 0);
    }
  }
  
  return totalHours;
};

// Escalate request to next authority
const escalateRequest = async (request) => {
  const escalationRule = ESCALATION_RULES[request.currentStage];
  
  if (!escalationRule) {
    console.log(`Request ${request.requestId} at CEO stage - no further escalation`);
    return;
  }
  
  // Determine next stage (handle both direct string and function-based rules)
  let nextStage;
  if (typeof escalationRule === 'function') {
    nextStage = escalationRule(request.requestType);
  } else {
    nextStage = escalationRule;
  }
  
  if (!nextStage) {
    console.log(`Request ${request.requestId} - no next stage for escalation`);
    return;
  }
  
  try {
    // Get handler for next stage
    const nextHandler = await workflowService.getHandlerForStage(nextStage, request.requestType);
    
    if (!nextHandler) {
      console.log(`No handler found for stage ${nextStage}`);
      return;
    }
    
    // Add to escalation history
    if (!request.escalationHistory) {
      request.escalationHistory = [];
    }
    
    request.escalationHistory.push({
      from: request.currentStage,
      to: nextStage,
      reason: 'SLA Breach - 10 Hour Limit Exceeded',
      escalatedAt: new Date(),
      escalatedBy: null // System escalation
    });
    
    // Record escalation event in workflow history
    request.workflow = workflowService.updateWorkflowStage(
      request.workflow,
      request.currentStage,
      'forwarded',
      null,
      `SLA Escalation: Automatically escalated due to 10 working hours of inactivity. Escalated to ${nextStage}.`
    );
    
    // Update request with new handler and stage
    request.currentStage = nextStage;
    request.currentHandler = nextHandler._id;
    request.lastActivityAt = new Date();
    
    // Update workflow stage arrival time for next stage
    workflowService.setStageArrivalTime(request.workflow, nextStage);
    
    // Keep isFlagged = true to maintain flagged record visibility
    request.isFlagged = true;
    
    await request.save();
    
    console.log(`Request ${request.requestId} escalated from ${request.escalationHistory[request.escalationHistory.length - 1].from} to ${nextStage}`);
  } catch (error) {
    console.error(`Error escalating request ${request.requestId}:`, error);
  }
};

// Check and flag requests based on SLA
exports.checkAndFlagRequests = async () => {
  try {
    const now = new Date();
    
    // Find all pending requests that are not already flagged
    const requests = await Request.find({
      overallStatus: 'pending',
      currentHandler: { $exists: true }
    }).populate('currentHandler');
    
    for (const request of requests) {
      const lastActivity = request.lastActivityAt || request.createdAt;
      const workingHours = await calculateWorkingHours(lastActivity, now);
      
      // Send reminder after 9 working hours and record event
      if (workingHours >= REMINDER_HOURS && !request.reminderSentAt) {
        request.reminderSentAt = now;
        
        // Record 9-hour reminder event in workflow history
        request.workflow = workflowService.updateWorkflowStage(
          request.workflow,
          request.currentStage,
          'pending',
          null,
          `SLA Reminder: Request has been in current stage for ${REMINDER_HOURS} working hours. Action required within 1 hour.`
        );
        
        await request.save();
        
        // In a real application, send notification to current handler
        console.log(`9-hour reminder sent for request ${request.requestId} to ${request.currentHandler.name}`);
      }
      
      // Flag request after 10 working hours and escalate
      if (workingHours >= FLAG_HOURS && !request.isFlagged) {
        request.isFlagged = true;
        request.flaggedAt = now;
        
        // Record 10-hour SLA breach event in workflow history
        request.workflow = workflowService.updateWorkflowStage(
          request.workflow,
          request.currentStage,
          'pending',
          null,
          `SLA Breach: Request has exceeded 10 working hours without action. Automatically escalating to next authority.`
        );
        
        await request.save();
        
        console.log(`Request ${request.requestId} has been flagged due to SLA breach`);
        
        // Escalate to next authority
        await escalateRequest(request);
      }
    }
  } catch (error) {
    console.error('Error in SLA check:', error);
  }
};

// Get working hours for a request
exports.getWorkingHoursForRequest = async (request) => {
  const now = new Date();
  const lastActivity = request.lastActivityAt || request.createdAt;
  return await calculateWorkingHours(lastActivity, now);
};

// Calculate time remaining until flag
exports.getTimeUntilFlag = async (request) => {
  const workingHours = await this.getWorkingHoursForRequest(request);
  const remainingHours = FLAG_HOURS - workingHours;
  return Math.max(0, remainingHours);
};

// Start SLA monitoring (run every hour)
exports.startSLAMonitoring = () => {
  // Initial check
  this.checkAndFlagRequests();
  
  // Check every hour
  setInterval(() => {
    this.checkAndFlagRequests();
  }, 60 * 60 * 1000); // 1 hour
  
  console.log('SLA monitoring service started');
};

module.exports = exports;
