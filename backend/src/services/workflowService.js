const { WORKFLOW_PATHS } = require('../config/roles');
const User = require('../models/User');

// Get the workflow for a request type
exports.getWorkflowForRequestType = (requestType) => {
  return WORKFLOW_PATHS[requestType] || [];
};

// Get next stage in workflow
exports.getNextStage = (requestType, currentStage) => {
  const workflow = WORKFLOW_PATHS[requestType];
  const currentIndex = workflow.indexOf(currentStage);
  
  if (currentIndex === -1 || currentIndex === workflow.length - 1) {
    return null;
  }
  
  return workflow[currentIndex + 1];
};

// Get previous stage in workflow
exports.getPreviousStage = (requestType, currentStage) => {
  const workflow = WORKFLOW_PATHS[requestType];
  const currentIndex = workflow.indexOf(currentStage);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return workflow[currentIndex - 1];
};

// Check if stage is final in workflow
exports.isFinalStage = (requestType, stage) => {
  const workflow = WORKFLOW_PATHS[requestType];
  return workflow[workflow.length - 1] === stage;
};

// Get appropriate handler for a stage
exports.getHandlerForStage = async (stage, requestType) => {
  // For Manager stage, try to get a manager
  // For other stages, get user with matching role
  const user = await User.findOne({ 
    role: stage,
    isActive: true 
  }).sort({ createdAt: 1 });
  
  return user;
};

// Initialize workflow for a new request
exports.initializeWorkflow = (requestType) => {
  const workflow = WORKFLOW_PATHS[requestType];
  
  return workflow.map(stage => ({
    role: stage,
    status: 'pending',
    arrivedAt: null
  }));
};

// Update workflow stage
exports.updateWorkflowStage = (workflow, stage, status, actionBy, comments) => {
  const stageIndex = workflow.findIndex(w => w.role === stage);
  
  if (stageIndex !== -1) {
    workflow[stageIndex].status = status;
    workflow[stageIndex].actionBy = actionBy;
    workflow[stageIndex].actionDate = new Date();
    workflow[stageIndex].comments = comments;
  }
  
  return workflow;
};

// Set arrival time for next stage
exports.setStageArrivalTime = (workflow, stage) => {
  const stageIndex = workflow.findIndex(w => w.role === stage);
  
  if (stageIndex !== -1 && !workflow[stageIndex].arrivedAt) {
    workflow[stageIndex].arrivedAt = new Date();
  }
  
  return workflow;
};

module.exports = exports;
