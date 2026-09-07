const mongoose = require('mongoose');

const workflowStageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'forwarded', 'query_sent'],
    default: 'pending'
  },
  actionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actionDate: Date,
  comments: String,
  arrivedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const escalationHistorySchema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    default: 'SLA Breach'
  },
  escalatedAt: {
    type: Date,
    default: Date.now
  },
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: false });

const requestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String
  },
  requestType: {
    type: String,
    enum: ['HR Request', 'IT & Purchase Request', 'Finance Request'],
    required: [true, 'Request type is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentStage: {
    type: String,
    default: 'Manager'
  },
  currentHandler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  overallStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'reverted', 'query_raised'],
    default: 'pending'
  },
  workflow: [workflowStageSchema],
  isFlagged: {
    type: Boolean,
    default: false
  },
  flaggedAt: Date,
  reminderSentAt: Date,
  escalationHistory: [escalationHistorySchema],
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  canRevert: {
    type: Boolean,
    default: true
  },
  revertDeadline: Date,
  submittedAt: {
    type: Date,
    default: Date.now,
    description: 'Exact timestamp when request was submitted'
  },
  isReverted: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  documents: [{
    fileName: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    documentType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  requestReason: {
    type: String
  },
  requestReasonOther: {
    type: String
  },
  leaveType: {
    type: String
  },
  leaveTypeOther: {
    type: String
  },
  fromDate: {
    type: Date
  },
  toDate: {
    type: Date
  },
  numberOfDays: {
    type: Number
  },
  leaveReason: {
    type: String
  },
  documentRequired: {
    type: String
  },
  documentRequiredOther: {
    type: String
  },
  documentPeriod: {
    type: String
  },
  purpose: {
    type: String
  },
  requiredByDate: {
    type: Date
  },
  additionalInfo: {
    type: String
  },
  dateOfJoining: {
    type: Date
  },
  lastWorkingDate: {
    type: Date
  },
  certificatePurpose: {
    type: String
  },
  certRequiredByDate: {
    type: Date
  },
  certAdditionalInfo: {
    type: String
  },
  salaryDocumentType: {
    type: String
  },
  salaryDocumentTypeOther: {
    type: String
  },
  salaryMonthYear: {
    type: String
  },
  salaryPurpose: {
    type: String
  },
  salaryRequiredByDate: {
    type: Date
  },
  salaryAdditionalInfo: {
    type: String
  },
  expenseCategory: {
    type: String
  },
  expenseCategoryOther: {
    type: String
  },
  expenseDate: {
    type: Date
  },
  amount: {
    type: Number
  },
  vendorName: {
    type: String
  },
  expensePurpose: {
    type: String
  },
  paymentDueDate: {
    type: Date
  },
  expenseAdditionalInfo: {
    type: String
  },
  projectSystemName: {
    type: String
  },
  technicalSpecRequired: {
    type: String
  },
  technicalRequirements: {
    type: String
  },
  quantity: {
    type: Number
  },
  techSpecPurpose: {
    type: String
  },
  techSpecRequiredByDate: {
    type: Date
  },
  serviceName: {
    type: String
  },
  quotationVendorName: {
    type: String
  },
  quotationQuantity: {
    type: Number
  },
  estimatedCost: {
    type: Number
  },
  purchasePurpose: {
    type: String
  },
  quotationRequiredByDate: {
    type: Date
  },
  invoiceVendorName: {
    type: String
  },
  invoiceNumber: {
    type: String
  },
  invoiceDate: {
    type: Date
  },
  invoiceAmount: {
    type: Number
  },
  invoiceDueDate: {
    type: Date
  },
  invoicePurpose: {
    type: String
  },
  paymentRequestVendorName: {
    type: String
  },
  paymentRequestAmount: {
    type: Number
  },
  paymentRequestPurpose: {
    type: String
  },
  paymentRequestDueDate: {
    type: Date
  },
  paymentRequestDescription: {
    type: String
  },
  paymentMethod: {
    type: String
  },
  otherFinancialRequest: {
    type: String
  },
  otherFinancialAmount: {
    type: Number
  },
  otherFinancialReason: {
    type: String
  },
  otherFinancialRequiredByDate: {
    type: Date
  },
  otherFinancialDetails: {
    type: String
  },
  hardwareName: {
    type: String
  },
  hardwareNameOther: {
    type: String
  },
  hardwareTechnicalSpecs: {
    type: String
  },
  hardwareQuantity: {
    type: Number
  },
  hardwarePurpose: {
    type: String
  },
  hardwareRequiredByDate: {
    type: Date
  },
  softwareName: {
    type: String
  },
  licenseType: {
    type: String
  },
  numberOfLicenses: {
    type: Number
  },
  softwarePurpose: {
    type: String
  },
  softwareRequiredByDate: {
    type: Date
  },
  softwareAdditionalInfo: {
    type: String
  },
  equipmentName: {
    type: String
  },
  equipmentNameOther: {
    type: String
  },
  equipmentQuantity: {
    type: Number
  },
  equipmentSpecs: {
    type: String
  },
  equipmentPurpose: {
    type: String
  },
  equipmentRequiredByDate: {
    type: Date
  },
  equipmentAdditionalInfo: {
    type: String
  },
  serviceRequired: {
    type: String
  },
  serviceRequiredOther: {
    type: String
  },
  systemEquipmentName: {
    type: String
  },
  issueDescription: {
    type: String
  },
  servicePurpose: {
    type: String
  },
  serviceRequiredByDate: {
    type: Date
  },
  serviceAdditionalInfo: {
    type: String
  },
  procurementItem: {
    type: String
  },
  procurementVendorName: {
    type: String
  },
  procurementQuantity: {
    type: Number
  },
  procurementEstimatedCost: {
    type: Number
  },
  procurementPurpose: {
    type: String
  },
  procurementRequiredByDate: {
    type: Date
  },
  procurementAdditionalInfo: {
    type: String
  },
  otherITService: {
    type: String
  },
  otherITReason: {
    type: String
  },
  otherITRequiredByDate: {
    type: Date
  },
  otherITAdditionalDetails: {
    type: String
  }
}, {
  timestamps: true
});

// Generate unique request ID
requestSchema.pre('save', async function(next) {
  if (!this.requestId) {
    const count = await mongoose.model('Request').countDocuments();
    this.requestId = `REQ-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Set revert deadline (5 minutes from creation)
  if (this.isNew) {
    this.revertDeadline = new Date(Date.now() + 5 * 60 * 1000);
  }
  
  next();
});

// Index for efficient querying
requestSchema.index({ createdBy: 1, createdAt: -1 });
requestSchema.index({ currentHandler: 1, overallStatus: 1 });
requestSchema.index({ isFlagged: 1 });
requestSchema.index({ requestId: 1 });

module.exports = mongoose.model('Request', requestSchema);
