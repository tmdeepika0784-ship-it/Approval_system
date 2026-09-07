const Query = require('../models/Query');
const Request = require('../models/Request');
const User = require('../models/User');
const { PERMISSIONS, QUERY_RECIPIENTS, ROLES } = require('../config/roles');

// @desc    Send query
// @route   POST /api/queries
// @access  Private (All except Employee)
exports.sendQuery = async (req, res, next) => {
  try {
    const { requestId, recipientId, message, managerComments } = req.body;

    // Check permission
    if (!PERMISSIONS[req.user.role].canSendQuery) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to send queries'
      });
    }

    // Verify request exists
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Verify recipient is in allowed list
    const allowedRecipients = QUERY_RECIPIENTS[req.user.role] || [];
    if (!allowedRecipients.includes(recipient.role)) {
      return res.status(403).json({
        success: false,
        message: `You cannot send queries to ${recipient.role}`
      });
    }

    // Create query
    const query = await Query.create({
      request: requestId,
      sentBy: req.user.id,
      sentTo: recipientId,
      message,
      managerComments: managerComments || ''
    });

    // Update request status
    request.overallStatus = 'query_raised';
    await request.save();

    await query.populate('sentBy sentTo', 'name email role');
    await query.populate('request', 'requestId title');

    res.status(201).json({
      success: true,
      message: 'Query sent successfully',
      query
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get queries (sent and received)
// @route   GET /api/queries
// @access  Private
exports.getQueries = async (req, res, next) => {
  try {
    const { type = 'received', status } = req.query;

    let query = {};

    if (type === 'received') {
      query.sentTo = req.user.id;
    } else if (type === 'sent') {
      query.sentBy = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    const queries = await Query.find(query)
      .populate('sentBy sentTo', 'name email role')
      .populate('request', 'requestId title requestType description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: queries.length,
      queries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single query
// @route   GET /api/queries/:id
// @access  Private
exports.getQuery = async (req, res, next) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('sentBy sentTo', 'name email role')
      .populate('request', 'requestId title requestType description');

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    // Verify user has access
    if (
      query.sentBy._id.toString() !== req.user.id &&
      query.sentTo._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this query'
      });
    }

    res.status(200).json({
      success: true,
      query
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to query
// @route   POST /api/queries/:id/respond
// @access  Private (Recipient only)
exports.respondToQuery = async (req, res, next) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response is required'
      });
    }

    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    // Verify user is the recipient
    if (query.sentTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this query'
      });
    }

    // Check if already responded
    if (query.status === 'responded') {
      return res.status(400).json({
        success: false,
        message: 'Query has already been responded to'
      });
    }

    query.response = response;
    
    // Add documents if any
    if (req.files && req.files.length > 0) {
      query.responseDocuments = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: file.filename,
        uploadedAt: new Date()
      }));
    } else {
      query.responseDocuments = [];
    }
    
    query.status = 'responded';
    query.respondedAt = new Date();

    await query.save();

    // Return the request back to the query sender for review
    const request = await Request.findById(query.request);
    if (request) {
      request.overallStatus = 'pending'; // Change from query_raised back to pending
      request.currentHandler = query.sentBy; // Assign back to the person who sent the query
      request.lastActivityAt = new Date();
      await request.save();
    }

    await query.populate('sentBy sentTo', 'name email role');
    await query.populate('request', 'requestId title');

    res.status(200).json({
      success: true,
      message: 'Response submitted successfully. Request returned to reviewer.',
      query
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get queries for a specific request
// @route   GET /api/queries/request/:requestId
// @access  Private
exports.getQueriesByRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const queries = await Query.find({ request: requestId })
      .populate('sentBy sentTo', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: queries.length,
      queries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workflow-based query recipients
// @route   GET /api/queries/:requestId/recipients
// @access  Private
exports.getWorkflowRecipients = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    // Fetch the request with workflow history
    const request = await Request.findById(requestId)
      .populate('workflow.actionBy', 'name email role')
      .populate('createdBy', 'name email role _id');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const senderRole = req.user.role;
    const recipientMap = new Map(); // Use Map to track by user ID and preserve order
    const recipientArray = []; // Maintain order as they appear in workflow

    // Get all users who have handled this request in the workflow (in sequence order)
    if (request.workflow && request.workflow.length > 0) {
      request.workflow.forEach((stage) => {
        if (stage.actionBy && stage.actionBy._id) {
          const userId = stage.actionBy._id.toString();
          
          // Skip if already added or if it's the current user
          if (recipientMap.has(userId) || userId === req.user.id) {
            return;
          }

          // Only add users from lower hierarchy to current sender
          const lowerHierarchy = isLowerHierarchy(stage.actionBy.role, senderRole);
          if (lowerHierarchy) {
            const recipient = {
              _id: stage.actionBy._id,
              name: stage.actionBy.name,
              email: stage.actionBy.email,
              role: stage.actionBy.role
            };
            recipientMap.set(userId, recipient);
            recipientArray.push(recipient);
          }
        }
      });
    }

    // Also add the request creator (Employee) if applicable and not already added
    if (request.createdBy && isLowerHierarchy(request.createdBy.role, senderRole)) {
      const creatorId = request.createdBy._id.toString();
      if (!recipientMap.has(creatorId) && creatorId !== req.user.id) {
        const creator = {
          _id: request.createdBy._id,
          name: request.createdBy.name,
          email: request.createdBy.email,
          role: request.createdBy.role
        };
        recipientArray.push(creator);
      }
    }

    res.status(200).json({
      success: true,
      count: recipientArray.length,
      recipients: recipientArray
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to determine if a role is lower in hierarchy
const isLowerHierarchy = (targetRole, senderRole) => {
  const hierarchy = {
    'Employee': 0,
    'Manager': 1,
    'HR': 2,
    'IT & Purchase': 2,
    'Finance': 2,
    'Accountant': 3,
    'General Manager': 4,
    'CEO': 5
  };

  return hierarchy[targetRole] < hierarchy[senderRole];
};

module.exports = exports;
