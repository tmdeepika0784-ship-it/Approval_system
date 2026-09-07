const Request = require('../models/Request');
const User = require('../models/User');
const { PERMISSIONS, ROLES } = require('../config/roles');
const workflowService = require('../services/workflowService');
const slaService = require('../services/slaService');

// @desc    Create new request
// @route   POST /api/requests
// @access  Private (Employee only)
exports.createRequest = async (req, res, next) => {
  try {
    const { title, description, requestType, priority, requestReason, requestReasonOther, leaveType, leaveTypeOther, fromDate, toDate, numberOfDays, leaveReason, documentRequired, documentRequiredOther, documentPeriod, purpose, requiredByDate, additionalInfo, dateOfJoining, lastWorkingDate, certificatePurpose, certRequiredByDate, certAdditionalInfo, salaryDocumentType, salaryDocumentTypeOther, salaryMonthYear, salaryPurpose, salaryRequiredByDate, salaryAdditionalInfo, expenseCategory, expenseCategoryOther, expenseDate, amount, vendorName, expensePurpose, paymentDueDate, expenseAdditionalInfo, projectSystemName, technicalSpecRequired, technicalRequirements, quantity, techSpecPurpose, techSpecRequiredByDate, serviceName, quotationVendorName, quotationQuantity, estimatedCost, purchasePurpose, quotationRequiredByDate, invoiceVendorName, invoiceNumber, invoiceDate, invoiceAmount, invoiceDueDate, invoicePurpose, paymentRequestVendorName, paymentRequestAmount, paymentRequestPurpose, paymentRequestDueDate, paymentRequestDescription, paymentMethod, otherFinancialRequest, otherFinancialAmount, otherFinancialReason, otherFinancialRequiredByDate, otherFinancialDetails, documents } = req.body;

    // Verify user has permission to create request
    if (!PERMISSIONS[req.user.role].canCreateRequest) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create requests'
      });
    }

    // Initialize workflow
    const workflow = workflowService.initializeWorkflow(requestType);
    
    // Set first stage arrival time
    workflow[0].arrivedAt = new Date();

    // Get manager to handle the request
    const manager = await workflowService.getHandlerForStage('Manager', requestType);

    if (!manager) {
      return res.status(500).json({
        success: false,
        message: 'No manager available to handle request'
      });
    }

    // Parse documents if they exist
    let parsedDocuments = [];
    if (documents) {
      try {
        parsedDocuments = typeof documents === 'string' ? JSON.parse(documents) : documents;
      } catch (e) {
        parsedDocuments = [];
      }
    }

    // Create request - stays with employee for 5 minutes (revert window)
    // After 5 minutes, automatically forwarded to Manager
    const now = new Date();
    const request = await Request.create({
      title,
      description,
      requestType,
      priority: 'medium', // Default priority
      createdBy: req.user.id,
      currentStage: 'Employee', // Stays with employee initially
      currentHandler: req.user.id, // Employee is the handler
      workflow: workflow,
      requestReason,
      requestReasonOther,
      leaveType,
      leaveTypeOther,
      fromDate,
      toDate,
      numberOfDays,
      leaveReason,
      documentRequired,
      documentRequiredOther,
      documentPeriod,
      purpose,
      requiredByDate,
      additionalInfo,
      dateOfJoining,
      lastWorkingDate,
      certificatePurpose,
      certRequiredByDate,
      certAdditionalInfo,
      salaryDocumentType,
      salaryDocumentTypeOther,
      salaryMonthYear,
      salaryPurpose,
      salaryRequiredByDate,
      salaryAdditionalInfo,
      expenseCategory,
      expenseCategoryOther,
      expenseDate,
      amount,
      vendorName,
      expensePurpose,
      paymentDueDate,
      expenseAdditionalInfo,
      projectSystemName,
      technicalSpecRequired,
      technicalRequirements,
      quantity,
      techSpecPurpose,
      techSpecRequiredByDate,
      serviceName,
      quotationVendorName,
      quotationQuantity,
      estimatedCost,
      purchasePurpose,
      quotationRequiredByDate,
      invoiceVendorName,
      invoiceNumber,
      invoiceDate,
      invoiceAmount,
      invoiceDueDate,
      invoicePurpose,
      paymentRequestVendorName,
      paymentRequestAmount,
      paymentRequestPurpose,
      paymentRequestDueDate,
      paymentRequestDescription,
      paymentMethod,
      otherFinancialRequest,
      otherFinancialAmount,
      otherFinancialReason,
      otherFinancialRequiredByDate,
      otherFinancialDetails,
      documents: parsedDocuments,
      lastActivityAt: now,
      canRevert: true,
      submittedAt: now,  // Exact submission timestamp
      revertDeadline: new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes from now
      overallStatus: 'pending'
    });

    await request.populate('createdBy currentHandler', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Request created successfully. You have 5 minutes to edit or cancel before it is sent to the manager.',
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
exports.getAllRequests = async (req, res, next) => {
  try {
    const { status, requestType, page = 1, limit = 20 } = req.query;
    
    let query = {};

    // Employee can only see their own requests
    if (req.user.role === ROLES.EMPLOYEE) {
      query.createdBy = req.user.id;
      // Apply status filter if provided
      if (status) {
        query.overallStatus = status;
      }
    } else {
      // Other roles can see requests they are handling or have handled
      query.$or = [
        { currentHandler: req.user.id },
        { 'workflow.actionBy': req.user.id }
      ];
      // Non-employees always exclude reverted requests
      query.overallStatus = { $ne: 'reverted' };
      
      // If status filter provided, combine with reverted exclusion
      if (status) {
        query.overallStatus = { $eq: status };
      }
    }

    if (requestType) {
      query.requestType = requestType;
    }

    const requests = await Request.find(query)
      .populate('createdBy currentHandler', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Request.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard data (recent requests only)
// @route   GET /api/requests/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    let query = {};

    // Employee sees their own recent requests
    if (req.user.role === ROLES.EMPLOYEE) {
      query.createdBy = req.user.id;
    } else {
      // Other roles see requests currently assigned to them
      query.currentHandler = req.user.id;
      query.overallStatus = 'pending';
    }

    // Get only recent requests (last 10)
    const recentRequests = await Request.find(query)
      .populate('createdBy currentHandler', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get counts
    const totalPending = await Request.countDocuments({
      ...query,
      overallStatus: 'pending'
    });

    const totalApproved = req.user.role === ROLES.EMPLOYEE
      ? await Request.countDocuments({
          createdBy: req.user.id,
          overallStatus: 'approved'
        })
      : 0;

    const totalRejected = req.user.role === ROLES.EMPLOYEE
      ? await Request.countDocuments({
          createdBy: req.user.id,
          overallStatus: 'rejected'
        })
      : 0;

    // For non-Employee roles, count forwarded and rejected by them
    let totalForwarded = 0;
    let totalRejectedByUser = 0;
    let totalApprovedByUser = 0;

    if (req.user.role !== ROLES.EMPLOYEE) {
      // Count requests where this user forwarded
      totalForwarded = await Request.countDocuments({
        'workflow.actionBy': req.user.id,
        'workflow.status': 'forwarded'
      });

      // Count requests where this user rejected
      totalRejectedByUser = await Request.countDocuments({
        'workflow.actionBy': req.user.id,
        'workflow.status': 'rejected'
      });

      // For CEO, count approved
      if (req.user.role === ROLES.CEO) {
        totalApprovedByUser = await Request.countDocuments({
          'workflow.actionBy': req.user.id,
          'workflow.status': 'approved'
        });
      }
    }

    // Count total requests user has access to
    let totalRequests = 0;
    if (req.user.role === ROLES.EMPLOYEE) {
      // Employee sees all their own requests
      totalRequests = await Request.countDocuments({
        createdBy: req.user.id
      });
    } else {
      // Other roles see all requests they are handling or have handled
      totalRequests = await Request.countDocuments({
        $or: [
          { currentHandler: req.user.id },
          { 'workflow.actionBy': req.user.id }
        ]
      });
    }

    res.status(200).json({
      success: true,
      dashboard: {
        recentRequests,
        stats: {
          totalPending,
          totalApproved: req.user.role === ROLES.EMPLOYEE ? totalApproved : totalApprovedByUser,
          totalRejected: req.user.role === ROLES.EMPLOYEE ? totalRejected : totalRejectedByUser,
          totalForwarded,
          totalRequests
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single request with detailed workflow
// @route   GET /api/requests/:id
// @access  Private
exports.getRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('createdBy currentHandler', 'name email role')
      .populate('workflow.actionBy', 'name email role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user has access to this request
    const hasAccess = 
      request.createdBy._id.toString() === req.user.id ||
      (request.currentHandler && request.currentHandler._id.toString() === req.user.id) ||
      request.workflow.some(w => w.actionBy && w.actionBy._id.toString() === req.user.id);

    if (!hasAccess && req.user.role !== ROLES.CEO) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this request'
      });
    }

    // Check if revert is still possible
    const now = new Date();
    if (request.revertDeadline && now > request.revertDeadline) {
      request.canRevert = false;
      // DO NOT SAVE HERE - let auto-forward service handle it
      // await request.save();
    }

    // Calculate working hours for SLA
    const workingHours = await slaService.getWorkingHoursForRequest(request);
    const timeUntilFlag = await slaService.getTimeUntilFlag(request);

    res.status(200).json({
      success: true,
      request,
      sla: {
        workingHours: workingHours.toFixed(2),
        timeUntilFlag: timeUntilFlag.toFixed(2),
        reminderSent: !!request.reminderSentAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forward request to next stage
// @route   POST /api/requests/:id/forward
// @access  Private (Manager, HR, IT, Finance, Accountant, GM)
exports.forwardRequest = async (req, res, next) => {
  try {
    const { comments } = req.body;

    // Check permission
    if (!PERMISSIONS[req.user.role].canForward) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to forward requests'
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify current handler
    if (request.currentHandler.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not the current handler of this request'
      });
    }

    // Get next stage
    const nextStage = workflowService.getNextStage(request.requestType, request.currentStage);

    if (!nextStage) {
      return res.status(400).json({
        success: false,
        message: 'No next stage available'
      });
    }

    // Update current stage in workflow
    request.workflow = workflowService.updateWorkflowStage(
      request.workflow,
      request.currentStage,
      'forwarded',
      req.user.id,
      comments
    );

    // Get handler for next stage
    const nextHandler = await workflowService.getHandlerForStage(nextStage, request.requestType);

    if (!nextHandler) {
      return res.status(500).json({
        success: false,
        message: `No ${nextStage} available to handle request`
      });
    }

    // Update request - set status to forwarded to reflect the action taken
    request.currentStage = nextStage;
    request.currentHandler = nextHandler._id;
    request.overallStatus = 'pending'; // Remains pending - now waiting for next authority
    request.lastActivityAt = new Date();
    request.isFlagged = false;
    request.reminderSentAt = null;

    // Set arrival time for next stage
    request.workflow = workflowService.setStageArrivalTime(request.workflow, nextStage);

    await request.save();
    await request.populate('createdBy currentHandler', 'name email role');
    await request.populate('workflow.actionBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Request forwarded successfully',
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve request
// @route   POST /api/requests/:id/approve
// @access  Private (CEO only)
exports.approveRequest = async (req, res, next) => {
  try {
    const { comments } = req.body;

    // Check permission
    if (!PERMISSIONS[req.user.role].canApprove) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to approve requests'
      });
    }

    const request = await Request.findById(req.params.id).populate('createdBy', 'email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify current handler
    if (request.currentHandler.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not the current handler of this request'
      });
    }

    // Update workflow
    request.workflow = workflowService.updateWorkflowStage(
      request.workflow,
      request.currentStage,
      'approved',
      req.user.id,
      comments
    );

    request.overallStatus = 'approved';
    request.lastActivityAt = new Date();

    await request.save();
    await request.populate('createdBy currentHandler', 'name email role');
    await request.populate('workflow.actionBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Request approved successfully',
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject request
// @route   POST /api/requests/:id/reject
// @access  Private (All except Employee)
exports.rejectRequest = async (req, res, next) => {
  try {
    const { comments } = req.body;

    if (!comments) {
      return res.status(400).json({
        success: false,
        message: 'Comments are required for rejection'
      });
    }

    // Check permission
    if (!PERMISSIONS[req.user.role].canReject) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reject requests'
      });
    }

    const request = await Request.findById(req.params.id).populate('createdBy', 'email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify current handler
    if (request.currentHandler.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not the current handler of this request'
      });
    }

    // Update workflow
    request.workflow = workflowService.updateWorkflowStage(
      request.workflow,
      request.currentStage,
      'rejected',
      req.user.id,
      comments
    );

    request.overallStatus = 'rejected';
    request.lastActivityAt = new Date();

    await request.save();
    await request.populate('createdBy currentHandler', 'name email role');
    await request.populate('workflow.actionBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revert/Cancel request (Employee only, within 5 minutes)
// @route   POST /api/requests/:id/revert
// @access  Private (Employee only)
exports.revertRequest = async (req, res, next) => {
  try {
    const { action } = req.body; // 'cancel' or 'edit'

    // Check permission
    if (!PERMISSIONS[req.user.role].canRevertRequest) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to revert requests'
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify ownership
    if (request.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only revert your own requests'
      });
    }

    // Check if already reverted
    if (request.isReverted) {
      return res.status(400).json({
        success: false,
        message: 'Request has already been reverted'
      });
    }

    // Check if request can still be reverted (within 5 minutes)
    const now = new Date();
    if (!request.canRevert || now > request.revertDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Revert period has expired. You can only revert within 5 minutes of submission'
      });
    }

    if (action === 'cancel') {
      request.overallStatus = 'reverted';
      request.isReverted = true;
      request.canRevert = false;
      request.lastActivityAt = new Date();
      await request.save();

      res.status(200).json({
        success: true,
        message: 'Request cancelled successfully',
        request
      });
    } else {
      // Return request data for editing
      res.status(200).json({
        success: true,
        message: 'Request data retrieved for editing',
        request: {
          id: request._id,
          title: request.title,
          description: request.description,
          requestType: request.requestType,
          priority: request.priority
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update and resubmit reverted request
// @route   PUT /api/requests/:id/resubmit
// @access  Private (Employee only)
exports.resubmitRequest = async (req, res, next) => {
  try {
    const { title, description, requestType, requestReason, requestReasonOther, leaveType, leaveTypeOther, fromDate, toDate, numberOfDays, leaveReason, documentRequired, documentRequiredOther, documentPeriod, purpose, requiredByDate, additionalInfo, dateOfJoining, lastWorkingDate, certificatePurpose, certRequiredByDate, certAdditionalInfo, salaryDocumentType, salaryDocumentTypeOther, salaryMonthYear, salaryPurpose, salaryRequiredByDate, salaryAdditionalInfo, expenseCategory, expenseCategoryOther, expenseDate, amount, vendorName, expensePurpose, paymentDueDate, expenseAdditionalInfo, projectSystemName, technicalSpecRequired, technicalRequirements, quantity, techSpecPurpose, techSpecRequiredByDate, serviceName, quotationVendorName, quotationQuantity, estimatedCost, purchasePurpose, quotationRequiredByDate, invoiceVendorName, invoiceNumber, invoiceDate, invoiceAmount, invoiceDueDate, invoicePurpose, paymentRequestVendorName, paymentRequestAmount, paymentRequestPurpose, paymentRequestDueDate, paymentRequestDescription, paymentMethod, otherFinancialRequest, otherFinancialAmount, otherFinancialReason, otherFinancialRequiredByDate, otherFinancialDetails, documents } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify ownership
    if (request.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own requests'
      });
    }

    // Check if within revert period
    const now = new Date();
    if (now > request.revertDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Edit period has expired'
      });
    }

    // Update request fields - include all CreateRequest fields
    request.title = title;
    request.description = description;
    request.requestType = requestType;
    request.requestReason = requestReason;
    request.requestReasonOther = requestReasonOther || null;
    request.leaveType = leaveType || null;
    request.leaveTypeOther = leaveTypeOther || null;
    request.fromDate = fromDate || null;
    request.toDate = toDate || null;
    request.numberOfDays = numberOfDays || null;
    request.leaveReason = leaveReason || null;
    request.documentRequired = documentRequired || null;
    request.documentRequiredOther = documentRequiredOther || null;
    request.documentPeriod = documentPeriod || null;
    request.purpose = purpose || null;
    request.requiredByDate = requiredByDate || null;
    request.additionalInfo = additionalInfo || null;
    request.dateOfJoining = dateOfJoining || null;
    request.lastWorkingDate = lastWorkingDate || null;
    request.certificatePurpose = certificatePurpose || null;
    request.certRequiredByDate = certRequiredByDate || null;
    request.certAdditionalInfo = certAdditionalInfo || null;
    request.salaryDocumentType = salaryDocumentType || null;
    request.salaryDocumentTypeOther = salaryDocumentTypeOther || null;
    request.salaryMonthYear = salaryMonthYear || null;
    request.salaryPurpose = salaryPurpose || null;
    request.salaryRequiredByDate = salaryRequiredByDate || null;
    request.salaryAdditionalInfo = salaryAdditionalInfo || null;
    request.expenseCategory = expenseCategory || null;
    request.expenseCategoryOther = expenseCategoryOther || null;
    request.expenseDate = expenseDate || null;
    request.amount = amount || null;
    request.vendorName = vendorName || null;
    request.expensePurpose = expensePurpose || null;
    request.paymentDueDate = paymentDueDate || null;
    request.expenseAdditionalInfo = expenseAdditionalInfo || null;
    request.projectSystemName = projectSystemName || null;
    request.technicalSpecRequired = technicalSpecRequired || null;
    request.technicalRequirements = technicalRequirements || null;
    request.quantity = quantity || null;
    request.techSpecPurpose = techSpecPurpose || null;
    request.techSpecRequiredByDate = techSpecRequiredByDate || null;
    request.serviceName = serviceName || null;
    request.quotationVendorName = quotationVendorName || null;
    request.quotationQuantity = quotationQuantity || null;
    request.estimatedCost = estimatedCost || null;
    request.purchasePurpose = purchasePurpose || null;
    request.quotationRequiredByDate = quotationRequiredByDate || null;
    request.invoiceVendorName = invoiceVendorName || null;
    request.invoiceNumber = invoiceNumber || null;
    request.invoiceDate = invoiceDate || null;
    request.invoiceAmount = invoiceAmount || null;
    request.invoiceDueDate = invoiceDueDate || null;
    request.invoicePurpose = invoicePurpose || null;
    request.paymentRequestVendorName = paymentRequestVendorName || null;
    request.paymentRequestAmount = paymentRequestAmount || null;
    request.paymentRequestPurpose = paymentRequestPurpose || null;
    request.paymentRequestDueDate = paymentRequestDueDate || null;
    request.paymentRequestDescription = paymentRequestDescription || null;
    request.paymentMethod = paymentMethod || null;
    request.otherFinancialRequest = otherFinancialRequest || null;
    request.otherFinancialAmount = otherFinancialAmount || null;
    request.otherFinancialReason = otherFinancialReason || null;
    request.otherFinancialRequiredByDate = otherFinancialRequiredByDate || null;
    request.otherFinancialDetails = otherFinancialDetails || null;
    request.documents = documents || request.documents; // Keep existing documents if not provided
    request.lastActivityAt = new Date();

    // Re-initialize workflow if request type changed
    if (request.requestType !== requestType) {
      const workflow = workflowService.initializeWorkflow(requestType);
      workflow[0].arrivedAt = new Date();
      request.workflow = workflow;
    }

    await request.save();
    await request.populate('createdBy currentHandler', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Request updated and resubmitted successfully',
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get flagged requests
// @route   GET /api/requests/flagged
// @access  Private
exports.getFlaggedRequests = async (req, res, next) => {
  try {
    const { ROLES_WITH_FLAGGED, ROLES } = require('../config/roles');
    const { roleFilter } = req.query; // Optional role filter for CEO

    // Check if user role has access to flagged requests
    if (!ROLES_WITH_FLAGGED.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to flagged requests'
      });
    }

    let query = {};

    // Always filter by flagged and pending status
    query.isFlagged = true;
    query.overallStatus = 'pending';

    // CEO sees all flagged requests across organization
    if (req.user.role === ROLES.CEO) {
      // If CEO selected a specific role filter, show only requests that are:
      // 1. Currently at that stage, OR
      // 2. Were escalated from that stage (in escalation history)
      if (roleFilter && roleFilter !== 'all') {
        query.$or = [
          { currentStage: roleFilter },
          { 'escalationHistory.from': roleFilter }
        ];
      }
      // If no filter or 'all', CEO sees all flagged requests across all stages
    } else {
      // Non-CEO roles see:
      // 1. Requests currently at their stage, OR
      // 2. Requests escalated FROM their stage (to maintain historical visibility)
      query.$or = [
        { currentStage: req.user.role },
        { 'escalationHistory.from': req.user.role }
      ];
    }

    const requests = await Request.find(query)
      .populate('createdBy currentHandler', 'name email role')
      .sort({ flaggedAt: -1 });

    // For CEO with role filter, also return role counts for all stages
    let roleCounts = {};
    if (req.user.role === ROLES.CEO) {
      const allRoles = ['Manager', 'HR', 'IT & Purchase', 'Finance', 'Accountant', 'General Manager'];
      for (const role of allRoles) {
        const count = await Request.countDocuments({
          isFlagged: true,
          overallStatus: 'pending',
          $or: [
            { currentStage: role },
            { 'escalationHistory.from': role }
          ]
        });
        roleCounts[role] = count;
      }
    }

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
      roleCounts: Object.keys(roleCounts).length > 0 ? roleCounts : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload document
// @route   POST /api/requests/upload-document
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const documentInfo = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      documentType: req.body.documentType || 'Other',
      uploadedAt: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      document: documentInfo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download/view document
// @route   GET /api/requests/document/:filename
// @access  Public (but file must exist and be requested by someone)
exports.getDocument = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const path = require('path');
    const fs = require('fs');
    
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
