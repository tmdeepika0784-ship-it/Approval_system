import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestAPI } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import axios from 'axios';

// Document types based on request type
const REQUEST_REASONS = {
  'HR Request': [
    'Leave Application',
    'Employee Documents',
    'Experience Certificate',
    'Salary-related Documents',
    'Other'
  ],
  'IT & Purchase Request': [
    'Hardware Purchase',
    'Software & License Request',
    'IT Equipment & Accessories',
    'Technology Service Request',
    'IT Procurement Request',
    'Other IT Request'
  ],
  'Finance Request': [
    'Expense Bill',
    'Invoice Submission',
    'Quotation Request',
    'Payment Request',
    'Other Financial Request'
  ]
};

// Map request reason to required document label
const REASON_TO_DOCUMENT_LABEL = {
  'Leave Application': 'Upload Leave Application Document',
  'Employee Documents': 'Upload Employee Document',
  'Experience Certificate': 'Upload Relevant Supporting Document',
  'Salary-related Documents': 'Upload Salary-related Document',
  'Hardware Purchase': 'Upload Hardware Purchase Document',
  'Software & License Request': 'Upload Software & License Document',
  'IT Equipment & Accessories': 'Upload IT Equipment & Accessories Document',
  'Technology Service Request': 'Upload Technology Service Document',
  'IT Procurement Request': 'Upload IT Procurement Document',
  'Other IT Request': 'Upload IT Request Document',
  'Expense Bill': 'Upload Expense Bill',
  'Invoice Submission': 'Upload Invoice',
  'Payment Request': 'Upload Payment Document'
};

const CreateRequest = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requestType: 'HR Request',
    requestReason: '',
    requestReasonOther: '',
    leaveType: '',
    leaveTypeOther: '',
    fromDate: '',
    toDate: '',
    leaveReason: '',
    documentRequired: '',
    documentRequiredOther: '',
    documentPeriod: '',
    purpose: '',
    requiredByDate: '',
    additionalInfo: '',
    dateOfJoining: '',
    lastWorkingDate: '',
    certificatePurpose: '',
    certRequiredByDate: '',
    certAdditionalInfo: '',
    salaryDocumentType: '',
    salaryDocumentTypeOther: '',
    salaryMonthYear: '',
    salaryPurpose: '',
    salaryRequiredByDate: '',
    salaryAdditionalInfo: '',
    expenseCategory: '',
    expenseCategoryOther: '',
    expenseDate: '',
    amount: '',
    vendorName: '',
    expensePurpose: '',
    paymentDueDate: '',
    expenseAdditionalInfo: '',
    projectSystemName: '',
    technicalSpecRequired: '',
    technicalRequirements: '',
    quantity: '',
    techSpecPurpose: '',
    techSpecRequiredByDate: '',
    serviceName: '',
    quotationVendorName: '',
    quotationQuantity: '',
    estimatedCost: '',
    purchasePurpose: '',
    quotationRequiredByDate: '',
    invoiceVendorName: '',
    invoiceNumber: '',
    invoiceDate: '',
    invoiceAmount: '',
    invoiceDueDate: '',
    invoicePurpose: '',
    paymentRequestVendorName: '',
    paymentRequestAmount: '',
    paymentRequestPurpose: '',
    paymentRequestDueDate: '',
    paymentRequestDescription: '',
    paymentMethod: '',
    otherFinancialRequest: '',
    otherFinancialAmount: '',
    otherFinancialReason: '',
    otherFinancialRequiredByDate: '',
    otherFinancialDetails: '',
    hardwareName: '',
    hardwareNameOther: '',
    hardwareTechnicalSpecs: '',
    hardwareQuantity: '',
    hardwarePurpose: '',
    hardwareRequiredByDate: '',
    softwareName: '',
    licenseType: '',
    numberOfLicenses: '',
    softwarePurpose: '',
    softwareRequiredByDate: '',
    softwareAdditionalInfo: '',
    equipmentName: '',
    equipmentNameOther: '',
    equipmentQuantity: '',
    equipmentSpecs: '',
    equipmentPurpose: '',
    equipmentRequiredByDate: '',
    equipmentAdditionalInfo: '',
    serviceRequired: '',
    serviceRequiredOther: '',
    systemEquipmentName: '',
    issueDescription: '',
    servicePurpose: '',
    serviceRequiredByDate: '',
    serviceAdditionalInfo: '',
    procurementItem: '',
    procurementVendorName: '',
    procurementQuantity: '',
    procurementEstimatedCost: '',
    procurementPurpose: '',
    procurementRequiredByDate: '',
    procurementAdditionalInfo: '',
    otherITService: '',
    otherITReason: '',
    otherITRequiredByDate: '',
    otherITAdditionalDetails: ''
  });
  const [documents, setDocuments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({
    title: '',
    message: '',
    onConfirm: null,
    type: 'primary'
  });
  const [documentToRemove, setDocumentToRemove] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Get file icon based on file extension
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: 'PDF',
      doc: 'DOC',
      docx: 'DOC',
      xls: 'XLS',
      xlsx: 'XLS',
      jpg: 'JPG',
      jpeg: 'JPG',
      png: 'PNG',
      txt: 'TXT'
    };
    return iconMap[ext] || 'FILE';
  };

  // Check if user is employee
  if (user?.role !== 'Employee') {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          Only employees can create requests.
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset requestReason when requestType changes
      ...(name === 'requestType' && { requestReason: '', requestReasonOther: '' })
    }));
    setError('');
  };

  // Calculate number of days between from and to dates
  const calculateNumberOfDays = () => {
    if (!formData.fromDate || !formData.toDate) return 0;
    const from = new Date(formData.fromDate);
    const to = new Date(formData.toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both dates
    return diffDays;
  };

  const handleFileUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      setError('Only document files (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT) are allowed');
      return;
    }

    // Add to uploading state
    setUploadingFiles(prev => [...prev, documentType]);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('document', file);
      uploadFormData.append('documentType', documentType);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/requests/upload-document`,
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Add uploaded document to documents array
      setDocuments(prev => [...prev, response.data.document]);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      // Remove from uploading state
      setUploadingFiles(prev => prev.filter(type => type !== documentType));
      // Reset file input
      e.target.value = '';
    }
  };

  const handleRemoveDocument = (fileName) => {
    setDocumentToRemove(fileName);
    setConfirmDialogConfig({
      title: 'Remove Document',
      message: 'Are you sure you want to remove this document?',
      onConfirm: () => {
        setDocuments(prev => prev.filter(doc => doc.fileName !== fileName));
        setDocumentToRemove(null);
        setShowConfirmDialog(false);
        setError('');
      },
      type: 'primary'
    });
    setShowConfirmDialog(true);
  };

  const validateForm = () => {
    // Check if request reason is selected
    if (!formData.requestReason) {
      setError('Request Reason is required');
      return false;
    }

    // Special validation for Leave Application
    if (formData.requestReason === 'Leave Application') {
      if (!formData.leaveType) {
        setError('Leave Type is required');
        return false;
      }
      if (formData.leaveType === 'Other') {
        if (!formData.leaveTypeOther || !formData.leaveTypeOther.trim()) {
          setError('Please specify the leave type');
          return false;
        }
      }
      if (!formData.fromDate) {
        setError('From Date is required');
        return false;
      }
      if (!formData.toDate) {
        setError('To Date is required');
        return false;
      }
      if (!formData.leaveReason || !formData.leaveReason.trim()) {
        setError('Reason for Leave is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for leave application');
        return false;
      }
    } else if (formData.requestReason === 'Employee Documents') {
      // Special validation for Employee Documents
      if (!formData.documentRequired) {
        setError('Document Required is required');
        return false;
      }
      if (formData.documentRequired === 'Other') {
        if (!formData.documentRequiredOther || !formData.documentRequiredOther.trim()) {
          setError('Please specify the document required');
          return false;
        }
      }
      if (!formData.purpose || !formData.purpose.trim()) {
        setError('Purpose is required');
        return false;
      }
      if (!formData.requiredByDate) {
        setError('Required By Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for employee documents request');
        return false;
      }
    } else if (formData.requestReason === 'Experience Certificate') {
      // Special validation for Experience Certificate
      if (!formData.dateOfJoining) {
        setError('Date of Joining is required');
        return false;
      }
      if (!formData.lastWorkingDate) {
        setError('Last Working Date is required');
        return false;
      }
      if (!formData.certificatePurpose || !formData.certificatePurpose.trim()) {
        setError('Purpose for Requesting the Certificate is required');
        return false;
      }
      if (!formData.certRequiredByDate) {
        setError('Required By Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for experience certificate request');
        return false;
      }
    } else if (formData.requestReason === 'Salary-related Documents') {
      // Special validation for Salary-related Documents
      if (!formData.salaryDocumentType) {
        setError('Which Salary Document Do You Need? is required');
        return false;
      }
      if (formData.salaryDocumentType === 'Other') {
        if (!formData.salaryDocumentTypeOther || !formData.salaryDocumentTypeOther.trim()) {
          setError('Please specify the salary document');
          return false;
        }
      }
      if (!formData.salaryMonthYear || !formData.salaryMonthYear.trim()) {
        setError('Salary Month / Year is required');
        return false;
      }
      if (!formData.salaryPurpose || !formData.salaryPurpose.trim()) {
        setError('Purpose for Requesting the Document is required');
        return false;
      }
      if (!formData.salaryRequiredByDate) {
        setError('Required By Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for salary-related documents request');
        return false;
      }
    } else if (formData.requestReason === 'Expense Bill') {
      // Special validation for Expense Bill
      if (!formData.expenseCategory) {
        setError('Expense Category is required');
        return false;
      }
      if (formData.expenseCategory === 'Other') {
        if (!formData.expenseCategoryOther || !formData.expenseCategoryOther.trim()) {
          setError('Please specify the expense category');
          return false;
        }
      }
      if (!formData.expenseDate) {
        setError('Expense Date is required');
        return false;
      }
      if (!formData.amount || formData.amount <= 0) {
        setError('Valid Amount is required');
        return false;
      }
      if (!formData.vendorName || !formData.vendorName.trim()) {
        setError('Vendor / Payee Name is required');
        return false;
      }
      if (!formData.expensePurpose || !formData.expensePurpose.trim()) {
        setError('Purpose of Expense is required');
        return false;
      }
      if (!formData.paymentDueDate) {
        setError('Payment Due Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for expense bill request');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required');
        return false;
      }
    } else if (formData.requestReason === 'Quotation Request') {
      // Special validation for Quotation Request
      if (!formData.quotationVendorName || !formData.quotationVendorName.trim()) {
        setError('Vendor Name is required');
        return false;
      }
      if (!formData.serviceName || !formData.serviceName.trim()) {
        setError('Service Name is required');
        return false;
      }
      if (!formData.quotationQuantity || formData.quotationQuantity <= 0) {
        setError('Valid Quantity is required');
        return false;
      }
      if (!formData.estimatedCost || formData.estimatedCost <= 0) {
        setError('Valid Quoted Amount is required');
        return false;
      }
      if (!formData.purchasePurpose || !formData.purchasePurpose.trim()) {
        setError('Purpose of Purchase is required');
        return false;
      }
      if (!formData.quotationRequiredByDate) {
        setError('Required By Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for quotation request');
        return false;
      }
    } else if (formData.requestReason === 'Invoice Submission') {
      // Special validation for Invoice Submission
      if (!formData.invoiceVendorName || !formData.invoiceVendorName.trim()) {
        setError('Vendor Name is required');
        return false;
      }
      if (!formData.invoiceNumber || !formData.invoiceNumber.trim()) {
        setError('Invoice Number is required');
        return false;
      }
      if (!formData.invoiceDate) {
        setError('Invoice Date is required');
        return false;
      }
      if (!formData.invoiceAmount || formData.invoiceAmount <= 0) {
        setError('Valid Invoice Amount is required');
        return false;
      }
      if (!formData.invoiceDueDate) {
        setError('Payment Due Date is required');
        return false;
      }
      if (!formData.invoicePurpose || !formData.invoicePurpose.trim()) {
        setError('Purpose is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for invoice submission');
        return false;
      }
    } else if (formData.requestReason === 'Payment Request') {
      // Special validation for Payment Request
      if (!formData.paymentRequestVendorName || !formData.paymentRequestVendorName.trim()) {
        setError('Vendor Name is required');
        return false;
      }
      if (!formData.paymentRequestAmount || formData.paymentRequestAmount <= 0) {
        setError('Valid Payment Amount is required');
        return false;
      }
      if (!formData.paymentRequestPurpose || !formData.paymentRequestPurpose.trim()) {
        setError('Payment Purpose is required');
        return false;
      }
      if (!formData.paymentRequestDueDate) {
        setError('Payment Due Date is required');
        return false;
      }
      if (!formData.paymentRequestDescription || !formData.paymentRequestDescription.trim()) {
        setError('Payment Description is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for payment request');
        return false;
      }
    } else if (formData.requestReason === 'Other Financial Request') {
      // Special validation for Other Financial Request
      if (!formData.otherFinancialRequest || !formData.otherFinancialRequest.trim()) {
        setError('What is the Financial Request? is required');
        return false;
      }
      if (!formData.otherFinancialReason || !formData.otherFinancialReason.trim()) {
        setError('Reason / Justification is required');
        return false;
      }
      if (!formData.otherFinancialRequiredByDate) {
        setError('Required By Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for other financial request');
        return false;
      }
    } else if (formData.requestReason === 'Other Financial Request') {
      // If "Other" is selected, check custom reason
      if (!formData.requestReasonOther || !formData.requestReasonOther.trim()) {
        setError('Please specify your custom reason');
        return false;
      }
      // Check that at least one document is uploaded for "Other"
      if (documents.length === 0) {
        setError('At least one supporting document is required when selecting "Other"');
        return false;
      }
    } else if (formData.requestReason === 'Hardware Purchase') {
      // Special validation for Hardware Purchase
      if (!formData.hardwareName || !formData.hardwareName.trim()) {
        setError('Hardware Name is required');
        return false;
      }
      if (formData.hardwareName === 'Other' && (!formData.hardwareNameOther || !formData.hardwareNameOther.trim())) {
        setError('Please specify the hardware name');
        return false;
      }
      if (!formData.hardwareTechnicalSpecs || !formData.hardwareTechnicalSpecs.trim()) {
        setError('Technical Specifications is required');
        return false;
      }
      if (!formData.hardwareQuantity || formData.hardwareQuantity <= 0) {
        setError('Valid Quantity is required');
        return false;
      }
      if (!formData.hardwarePurpose || !formData.hardwarePurpose.trim()) {
        setError('Purpose is required');
        return false;
      }
      if (!formData.hardwareRequiredByDate) {
        setError('Required By Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for hardware purchase request');
        return false;
      }
    } else if (formData.requestReason === 'Software & License Request') {
      // Special validation for Software & License Request
      if (!formData.softwareName || !formData.softwareName.trim()) {
        setError('Software Name / License Required is required');
        return false;
      }
      if (!formData.licenseType || !formData.licenseType.trim()) {
        setError('License Type is required');
        return false;
      }
      if (!formData.numberOfLicenses || formData.numberOfLicenses <= 0) {
        setError('Valid Number of Licenses is required');
        return false;
      }
      if (!formData.softwarePurpose || !formData.softwarePurpose.trim()) {
        setError('Purpose is required');
        return false;
      }
      if (!formData.softwareRequiredByDate) {
        setError('Required By Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for software & license request');
        return false;
      }
    } else if (formData.requestReason === 'IT Equipment & Accessories') {
      // Special validation for IT Equipment & Accessories
      if (!formData.equipmentName || !formData.equipmentName.trim()) {
        setError('Equipment / Accessory Name is required');
        return false;
      }
      if (formData.equipmentName === 'Other' && (!formData.equipmentNameOther || !formData.equipmentNameOther.trim())) {
        setError('Please specify the equipment/accessory name');
        return false;
      }
      if (!formData.equipmentQuantity || formData.equipmentQuantity <= 0) {
        setError('Valid Quantity is required');
        return false;
      }
      if (!formData.equipmentPurpose || !formData.equipmentPurpose.trim()) {
        setError('Purpose / Business Need is required');
        return false;
      }
      if (!formData.equipmentRequiredByDate) {
        setError('Required By Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for IT equipment & accessories request');
        return false;
      }
    } else if (formData.requestReason === 'Technology Service Request') {
      // Special validation for Technology Service Request
      if (!formData.serviceRequired || !formData.serviceRequired.trim()) {
        setError('Service Required is required');
        return false;
      }
      if (formData.serviceRequired === 'Other' && (!formData.serviceRequiredOther || !formData.serviceRequiredOther.trim())) {
        setError('Please specify the service required');
        return false;
      }
      if (!formData.systemEquipmentName || !formData.systemEquipmentName.trim()) {
        setError('System / Equipment Name is required');
        return false;
      }
      if (!formData.issueDescription || !formData.issueDescription.trim()) {
        setError('Issue / Requirement Description is required');
        return false;
      }
      if (!formData.servicePurpose || !formData.servicePurpose.trim()) {
        setError('Purpose / Business Need is required');
        return false;
      }
      if (!formData.serviceRequiredByDate) {
        setError('Required By Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for technology service request');
        return false;
      }
    } else if (formData.requestReason === 'IT Procurement Request') {
      // Special validation for IT Procurement Request
      if (!formData.procurementItem || !formData.procurementItem.trim()) {
        setError('Item / Service Required is required');
        return false;
      }
      if (!formData.procurementQuantity || formData.procurementQuantity <= 0) {
        setError('Valid Quantity is required');
        return false;
      }
      if (!formData.procurementEstimatedCost || formData.procurementEstimatedCost <= 0) {
        setError('Valid Estimated Cost is required');
        return false;
      }
      if (!formData.procurementPurpose || !formData.procurementPurpose.trim()) {
        setError('Purpose / Business Need is required');
        return false;
      }
      if (!formData.procurementRequiredByDate) {
        setError('Required By Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for IT procurement request');
        return false;
      }
    } else if (formData.requestReason === 'Other IT Request') {
      // Special validation for Other IT Request
      if (!formData.otherITService || !formData.otherITService.trim()) {
        setError('What IT Service? is required');
        return false;
      }
      if (!formData.otherITReason || !formData.otherITReason.trim()) {
        setError('Reason is required');
        return false;
      }
      if (!formData.otherITRequiredByDate) {
        setError('Required By Date is required');
        return false;
      }
      // Check that at least one document is uploaded
      if (documents.length === 0) {
        setError('At least one document is required for other IT request');
        return false;
      }
    } else {
      // For predefined reasons, check that the required document is uploaded
      const requiredDocType = formData.requestReason;
      const hasRequiredDoc = documents.some(doc => doc.documentType === requiredDocType);
      if (!hasRequiredDoc) {
        setError(`${REASON_TO_DOCUMENT_LABEL[requiredDocType]} is required`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        title: formData.title,
        description: formData.description,
        requestType: formData.requestType,
        requestReason: formData.requestReason,
        requestReasonOther: formData.requestReason === 'Other' ? formData.requestReasonOther : null,
        documents: documents
      };

      // Add leave application fields if Leave Application is selected
      if (formData.requestReason === 'Leave Application') {
        requestData.leaveType = formData.leaveType;
        requestData.leaveTypeOther = formData.leaveType === 'Other' ? formData.leaveTypeOther : null;
        requestData.fromDate = formData.fromDate;
        requestData.toDate = formData.toDate;
        requestData.numberOfDays = calculateNumberOfDays();
        requestData.leaveReason = formData.leaveReason;
      }

      // Add employee documents fields if Employee Documents is selected
      if (formData.requestReason === 'Employee Documents') {
        requestData.documentRequired = formData.documentRequired;
        requestData.documentRequiredOther = formData.documentRequired === 'Other' ? formData.documentRequiredOther : null;
        requestData.documentPeriod = formData.documentPeriod;
        requestData.purpose = formData.purpose;
        requestData.requiredByDate = formData.requiredByDate;
        requestData.additionalInfo = formData.additionalInfo;
      }

      // Add experience certificate fields if Experience Certificate is selected
      if (formData.requestReason === 'Experience Certificate') {
        requestData.dateOfJoining = formData.dateOfJoining;
        requestData.lastWorkingDate = formData.lastWorkingDate;
        requestData.certificatePurpose = formData.certificatePurpose;
        requestData.certRequiredByDate = formData.certRequiredByDate;
        requestData.certAdditionalInfo = formData.certAdditionalInfo;
      }

      // Add salary-related documents fields if Salary-related Documents is selected
      if (formData.requestReason === 'Salary-related Documents') {
        requestData.salaryDocumentType = formData.salaryDocumentType;
        requestData.salaryDocumentTypeOther = formData.salaryDocumentType === 'Other' ? formData.salaryDocumentTypeOther : null;
        requestData.salaryMonthYear = formData.salaryMonthYear;
        requestData.salaryPurpose = formData.salaryPurpose;
        requestData.salaryRequiredByDate = formData.salaryRequiredByDate;
        requestData.salaryAdditionalInfo = formData.salaryAdditionalInfo;
      }

      // Add expense bill fields if Expense Bill is selected
      if (formData.requestReason === 'Expense Bill') {
        requestData.expenseCategory = formData.expenseCategory;
        requestData.expenseCategoryOther = formData.expenseCategory === 'Other' ? formData.expenseCategoryOther : null;
        requestData.expenseDate = formData.expenseDate;
        requestData.amount = formData.amount;
        requestData.vendorName = formData.vendorName;
        requestData.expensePurpose = formData.expensePurpose;
        requestData.paymentDueDate = formData.paymentDueDate;
        requestData.expenseAdditionalInfo = formData.expenseAdditionalInfo;
      }

      // Add quotation fields if Quotation Request is selected
      if (formData.requestReason === 'Quotation Request') {
        requestData.quotationVendorName = formData.quotationVendorName;
        requestData.serviceName = formData.serviceName;
        requestData.quotationQuantity = formData.quotationQuantity;
        requestData.estimatedCost = formData.estimatedCost;
        requestData.purchasePurpose = formData.purchasePurpose;
        requestData.quotationRequiredByDate = formData.quotationRequiredByDate;
      }

      // Add invoice submission fields if Invoice Submission is selected
      if (formData.requestReason === 'Invoice Submission') {
        requestData.invoiceVendorName = formData.invoiceVendorName;
        requestData.invoiceNumber = formData.invoiceNumber;
        requestData.invoiceDate = formData.invoiceDate;
        requestData.invoiceAmount = formData.invoiceAmount;
        requestData.invoiceDueDate = formData.invoiceDueDate;
        requestData.invoicePurpose = formData.invoicePurpose;
      }

      // Add payment request fields if Payment Request is selected
      if (formData.requestReason === 'Payment Request') {
        requestData.paymentRequestVendorName = formData.paymentRequestVendorName;
        requestData.paymentRequestAmount = formData.paymentRequestAmount;
        requestData.paymentRequestPurpose = formData.paymentRequestPurpose;
        requestData.paymentRequestDueDate = formData.paymentRequestDueDate;
        requestData.paymentRequestDescription = formData.paymentRequestDescription;
        requestData.paymentMethod = formData.paymentMethod;
      }

      // Add other financial request fields if Other Financial Request is selected
      if (formData.requestReason === 'Other Financial Request') {
        requestData.otherFinancialRequest = formData.otherFinancialRequest;
        requestData.otherFinancialAmount = formData.otherFinancialAmount;
        requestData.otherFinancialReason = formData.otherFinancialReason;
        requestData.otherFinancialRequiredByDate = formData.otherFinancialRequiredByDate;
        requestData.otherFinancialDetails = formData.otherFinancialDetails;
      }

      // Add hardware purchase fields if Hardware Purchase is selected
      if (formData.requestReason === 'Hardware Purchase') {
        requestData.hardwareName = formData.hardwareName;
        requestData.hardwareNameOther = formData.hardwareName === 'Other' ? formData.hardwareNameOther : null;
        requestData.hardwareTechnicalSpecs = formData.hardwareTechnicalSpecs;
        requestData.hardwareQuantity = formData.hardwareQuantity;
        requestData.hardwarePurpose = formData.hardwarePurpose;
        requestData.hardwareRequiredByDate = formData.hardwareRequiredByDate;
      }

      // Add software & license request fields if Software & License Request is selected
      if (formData.requestReason === 'Software & License Request') {
        requestData.softwareName = formData.softwareName;
        requestData.licenseType = formData.licenseType;
        requestData.numberOfLicenses = formData.numberOfLicenses;
        requestData.softwarePurpose = formData.softwarePurpose;
        requestData.softwareRequiredByDate = formData.softwareRequiredByDate;
        requestData.softwareAdditionalInfo = formData.softwareAdditionalInfo;
      }

      // Add IT equipment & accessories fields if IT Equipment & Accessories is selected
      if (formData.requestReason === 'IT Equipment & Accessories') {
        requestData.equipmentName = formData.equipmentName;
        requestData.equipmentNameOther = formData.equipmentName === 'Other' ? formData.equipmentNameOther : null;
        requestData.equipmentQuantity = formData.equipmentQuantity;
        requestData.equipmentSpecs = formData.equipmentSpecs;
        requestData.equipmentPurpose = formData.equipmentPurpose;
        requestData.equipmentRequiredByDate = formData.equipmentRequiredByDate;
        requestData.equipmentAdditionalInfo = formData.equipmentAdditionalInfo;
      }

      // Add technology service request fields if Technology Service Request is selected
      if (formData.requestReason === 'Technology Service Request') {
        requestData.serviceRequired = formData.serviceRequired;
        requestData.serviceRequiredOther = formData.serviceRequired === 'Other' ? formData.serviceRequiredOther : null;
        requestData.systemEquipmentName = formData.systemEquipmentName;
        requestData.issueDescription = formData.issueDescription;
        requestData.servicePurpose = formData.servicePurpose;
        requestData.serviceRequiredByDate = formData.serviceRequiredByDate;
        requestData.serviceAdditionalInfo = formData.serviceAdditionalInfo;
      }

      // Add IT procurement request fields if IT Procurement Request is selected
      if (formData.requestReason === 'IT Procurement Request') {
        requestData.procurementItem = formData.procurementItem;
        requestData.procurementVendorName = formData.procurementVendorName;
        requestData.procurementQuantity = formData.procurementQuantity;
        requestData.procurementEstimatedCost = formData.procurementEstimatedCost;
        requestData.procurementPurpose = formData.procurementPurpose;
        requestData.procurementRequiredByDate = formData.procurementRequiredByDate;
        requestData.procurementAdditionalInfo = formData.procurementAdditionalInfo;
      }

      // Add other IT request fields if Other IT Request is selected
      if (formData.requestReason === 'Other IT Request') {
        requestData.otherITService = formData.otherITService;
        requestData.otherITReason = formData.otherITReason;
        requestData.otherITRequiredByDate = formData.otherITRequiredByDate;
        requestData.otherITAdditionalDetails = formData.otherITAdditionalDetails;
      }

      const response = await requestAPI.create(requestData);
      navigate(`/requests/${response.data.request._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const availableReasons = REQUEST_REASONS[formData.requestType] || [];
  const isOtherSelected = formData.requestReason === 'Other';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Create New Request</h1>
        <p className="page-subtitle">Submit a new request for approval</p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">Request Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Brief description of your request"
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Request Type</label>
            <select
              name="requestType"
              className="form-control"
              value={formData.requestType}
              onChange={handleChange}
              required
            >
              <option value="HR Request">HR Request</option>
              <option value="IT & Purchase Request">IT & Purchase Request</option>
              <option value="Finance Request">Finance Request</option>
            </select>
            <div className="form-help">
              Select the department that should handle your request
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Request Reason</label>
            <select
              name="requestReason"
              className="form-control"
              value={formData.requestReason}
              onChange={handleChange}
              required
            >
              <option value="">Select a reason...</option>
              {availableReasons.map(reason => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <div className="form-help">
              Select the specific reason for your request
            </div>
          </div>

          {/* Custom Reason for "Other" */}
          {isOtherSelected && (
            <div className="form-group">
              <label className="form-label required">Specify Your Reason</label>
              <input
                type="text"
                name="requestReasonOther"
                className="form-control"
                value={formData.requestReasonOther}
                onChange={handleChange}
                required
                placeholder="Please describe your custom reason"
              />
              <div className="form-help">
                Clearly describe the custom reason for your request
              </div>
            </div>
          )}

          {/* Leave Application Fields - Shown when "Leave Application" is selected */}
          {formData.requestReason === 'Leave Application' && (
            <>
              <div className="form-group">
                <label className="form-label required">Leave Type</label>
                <select
                  name="leaveType"
                  className="form-control"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select leave type...</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Paternity Leave">Paternity Leave</option>
                  <option value="Compensatory Leave">Compensatory Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Show text input when "Other" is selected */}
              {formData.leaveType === 'Other' && (
                <div className="form-group">
                  <label className="form-label required">Specify Leave Type</label>
                  <input
                    type="text"
                    name="leaveTypeOther"
                    className="form-control"
                    value={formData.leaveTypeOther}
                    onChange={handleChange}
                    required
                    placeholder="Enter the specific reason for leave"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label required">From Date</label>
                <input
                  type="date"
                  name="fromDate"
                  className="form-control"
                  value={formData.fromDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">To Date</label>
                <input
                  type="date"
                  name="toDate"
                  className="form-control"
                  value={formData.toDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Number of Days</label>
                <input
                  type="number"
                  className="form-control"
                  value={calculateNumberOfDays()}
                  disabled
                  placeholder="Auto-calculated"
                />
                <div className="form-help">
                  Automatically calculated based on From and To dates
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Reason for Leave</label>
                <textarea
                  name="leaveReason"
                  className="form-control"
                  value={formData.leaveReason}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Please explain the reason for your leave request"
                />
              </div>
            </>
          )}

          {/* Employee Documents Fields - Shown when "Employee Documents" is selected */}
          {formData.requestReason === 'Employee Documents' && (
            <>
              <div className="form-group">
                <label className="form-label required">Document Required</label>
                <select
                  name="documentRequired"
                  className="form-control"
                  value={formData.documentRequired}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select document type...</option>
                  <option value="Salary Slip">Salary Slip</option>
                  <option value="Experience Certificate">Experience Certificate</option>
                  <option value="Employment Certificate">Employment Certificate</option>
                  <option value="Offer/Appointment Letter">Offer/Appointment Letter</option>
                  <option value="ID/Employment Proof">ID/Employment Proof</option>
                  <option value="Tax/Income Document">Tax/Income Document</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Show text input when "Other" is selected */}
              {formData.documentRequired === 'Other' && (
                <div className="form-group">
                  <label className="form-label required">Specify Document Required</label>
                  <input
                    type="text"
                    name="documentRequiredOther"
                    className="form-control"
                    value={formData.documentRequiredOther}
                    onChange={handleChange}
                    required
                    placeholder="Enter the exact document you need"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Document Period</label>
                <input
                  type="text"
                  name="documentPeriod"
                  className="form-control"
                  value={formData.documentPeriod}
                  onChange={handleChange}
                  placeholder="e.g., January 2024, Q1 2024, or FY 2023-24"
                />
                <div className="form-help">
                  Month/Year or specific period, if applicable
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Purpose</label>
                <input
                  type="text"
                  name="purpose"
                  className="form-control"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  placeholder="Why do you need this document?"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Required By Date</label>
                <input
                  type="date"
                  name="requiredByDate"
                  className="form-control"
                  value={formData.requiredByDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Information</label>
                <textarea
                  name="additionalInfo"
                  className="form-control"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional details or special requests (optional)"
                />
              </div>
            </>
          )}

          {/* Experience Certificate Fields - Shown when "Experience Certificate" is selected */}
          {formData.requestReason === 'Experience Certificate' && (
            <>
              <div className="form-group">
                <label className="form-label required">Date of Joining</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  className="form-control"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Last Working Date</label>
                <input
                  type="date"
                  name="lastWorkingDate"
                  className="form-control"
                  value={formData.lastWorkingDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Purpose for Requesting the Certificate</label>
                <input
                  type="text"
                  name="certificatePurpose"
                  className="form-control"
                  value={formData.certificatePurpose}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Visa Application, New Job, Further Studies"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Required By Date</label>
                <input
                  type="date"
                  name="certRequiredByDate"
                  className="form-control"
                  value={formData.certRequiredByDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Information</label>
                <textarea
                  name="certAdditionalInfo"
                  className="form-control"
                  value={formData.certAdditionalInfo}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional details or special requests (optional)"
                />
              </div>
            </>
          )}

          {/* Salary-related Documents Fields - Shown when "Salary-related Documents" is selected */}
          {formData.requestReason === 'Salary-related Documents' && (
            <>
              <div className="form-group">
                <label className="form-label required">Which Salary Document Do You Need?</label>
                <select
                  name="salaryDocumentType"
                  className="form-control"
                  value={formData.salaryDocumentType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select salary document...</option>
                  <option value="Salary Slip">Salary Slip</option>
                  <option value="Form 16">Form 16</option>
                  <option value="Salary Certificate">Salary Certificate</option>
                  <option value="Annual Salary Statement">Annual Salary Statement</option>
                  <option value="Payroll Report">Payroll Report</option>
                  <option value="Bank Salary Credit Statement">Bank Salary Credit Statement</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Show text input when "Other" is selected */}
              {formData.salaryDocumentType === 'Other' && (
                <div className="form-group">
                  <label className="form-label required">Specify Salary Document</label>
                  <input
                    type="text"
                    name="salaryDocumentTypeOther"
                    className="form-control"
                    value={formData.salaryDocumentTypeOther}
                    onChange={handleChange}
                    required
                    placeholder="Enter the exact salary document you need"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label required">Salary Month / Year</label>
                <input
                  type="text"
                  name="salaryMonthYear"
                  className="form-control"
                  value={formData.salaryMonthYear}
                  onChange={handleChange}
                  required
                  placeholder="e.g., January 2024, Q1 2024, FY 2023-24"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Purpose for Requesting the Document</label>
                <input
                  type="text"
                  name="salaryPurpose"
                  className="form-control"
                  value={formData.salaryPurpose}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Bank Loan, Visa Application, Rental Agreement"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Required By Date</label>
                <input
                  type="date"
                  name="salaryRequiredByDate"
                  className="form-control"
                  value={formData.salaryRequiredByDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Information</label>
                <textarea
                  name="salaryAdditionalInfo"
                  className="form-control"
                  value={formData.salaryAdditionalInfo}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional details or special requests (optional)"
                />
              </div>
            </>
          )}

          {/* Expense Bill Fields - Shown when "Expense Bill" is selected */}
          {formData.requestReason === 'Expense Bill' && (
            <>
              <div className="form-group">
                <label className="form-label required">Expense Category</label>
                <select
                  name="expenseCategory"
                  className="form-control"
                  value={formData.expenseCategory}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select expense category...</option>
                  <option value="Travel">Travel</option>
                  <option value="Food">Food</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Show text input when "Other" is selected */}
              {formData.expenseCategory === 'Other' && (
                <div className="form-group">
                  <label className="form-label required">Specify Expense Category</label>
                  <input
                    type="text"
                    name="expenseCategoryOther"
                    className="form-control"
                    value={formData.expenseCategoryOther}
                    onChange={handleChange}
                    required
                    placeholder="Enter the exact expense category"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label required">Expense Date</label>
                <input
                  type="date"
                  name="expenseDate"
                  className="form-control"
                  value={formData.expenseDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Amount</label>
                <input
                  type="number"
                  name="amount"
                  className="form-control"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="Enter amount in rupees"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Vendor / Payee Name</label>
                <input
                  type="text"
                  name="vendorName"
                  className="form-control"
                  value={formData.vendorName}
                  onChange={handleChange}
                  required
                  placeholder="Enter vendor or payee name"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Purpose of Expense</label>
                <textarea
                  name="expensePurpose"
                  className="form-control"
                  value={formData.expensePurpose}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the purpose of this expense"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Payment Due Date</label>
                <input
                  type="date"
                  name="paymentDueDate"
                  className="form-control"
                  value={formData.paymentDueDate}
                  onChange={handleChange}
                  required
                />
                <div className="form-help">
                  When the payment needs to be processed
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Information</label>
                <textarea
                  name="expenseAdditionalInfo"
                  className="form-control"
                  value={formData.expenseAdditionalInfo}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional details or special requests (optional)"
                />
              </div>
            </>
          )}

          {/* Quotation Request Fields - Shown when "Quotation Request" is selected */}
          {formData.requestReason === 'Quotation Request' && (
            <>
              <div className="form-group">
                <label className="form-label required">Service Name</label>
                <input
                  type="text"
                  name="serviceName"
                  className="form-control"
                  value={formData.serviceName}
                  onChange={handleChange}
                  required
                  placeholder="Enter service name"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Vendor Name</label>
                <input
                  type="text"
                  name="quotationVendorName"
                  className="form-control"
                  value={formData.quotationVendorName}
                  onChange={handleChange}
                  required
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Quantity</label>
                <input
                  type="number"
                  name="quotationQuantity"
                  className="form-control"
                  value={formData.quotationQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Estimated Cost</label>
                <input
                  type="number"
                  name="estimatedCost"
                  className="form-control"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="Enter estimated cost"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Purpose of Purchase</label>
                <textarea
                  name="purchasePurpose"
                  className="form-control"
                  value={formData.purchasePurpose}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the purpose of this purchase"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Required By Date</label>
                <input
                  type="date"
                  name="quotationRequiredByDate"
                  className="form-control"
                  value={formData.quotationRequiredByDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* Invoice Submission Fields - Shown when "Invoice Submission" is selected */}
          {formData.requestReason === 'Invoice Submission' && (
            <>
              <div className="form-group">
                <label className="form-label required">Vendor Name</label>
                <input
                  type="text"
                  name="invoiceVendorName"
                  className="form-control"
                  value={formData.invoiceVendorName}
                  onChange={handleChange}
                  required
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  className="form-control"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter invoice number"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Invoice Date</label>
                <input
                  type="date"
                  name="invoiceDate"
                  className="form-control"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Invoice Amount</label>
                <input
                  type="number"
                  name="invoiceAmount"
                  className="form-control"
                  value={formData.invoiceAmount}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="Enter invoice amount"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Payment Due Date</label>
                <input
                  type="date"
                  name="invoiceDueDate"
                  className="form-control"
                  value={formData.invoiceDueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Purpose</label>
                <textarea
                  name="invoicePurpose"
                  className="form-control"
                  value={formData.invoicePurpose}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the purpose of this invoice"
                />
              </div>
            </>
          )}

          {/* Payment Request Fields - Shown when "Payment Request" is selected */}
          {formData.requestReason === 'Payment Request' && (
            <>
              <div className="form-group">
                <label className="form-label required">Vendor Name</label>
                <input
                  type="text"
                  name="paymentRequestVendorName"
                  className="form-control"
                  value={formData.paymentRequestVendorName}
                  onChange={handleChange}
                  required
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Payment Amount</label>
                <input
                  type="number"
                  name="paymentRequestAmount"
                  className="form-control"
                  value={formData.paymentRequestAmount}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="Enter payment amount"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Payment Purpose</label>
                <textarea
                  name="paymentRequestPurpose"
                  className="form-control"
                  value={formData.paymentRequestPurpose}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the purpose of this payment"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Payment Due Date</label>
                <input
                  type="date"
                  name="paymentRequestDueDate"
                  className="form-control"
                  value={formData.paymentRequestDueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Payment Description</label>
                <textarea
                  name="paymentRequestDescription"
                  className="form-control"
                  value={formData.paymentRequestDescription}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Provide detailed description of the payment"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <input
                  type="text"
                  name="paymentMethod"
                  className="form-control"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  placeholder="e.g., Bank Transfer, Check, Cash"
                />
                <div className="form-help">
                  If applicable
                </div>
              </div>
            </>
          )}

          {/* Other Financial Request Fields - Shown when "Other Financial Request" is selected */}
          {formData.requestReason === 'Other Financial Request' && (
            <>
              <div className="form-group">
                <label className="form-label required">What is the Financial Request?</label>
                <textarea
                  name="otherFinancialRequest"
                  className="form-control"
                  value={formData.otherFinancialRequest}
                  onChange={handleChange}
                  required
                  rows="2"
                  placeholder="Describe the financial request"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  name="otherFinancialAmount"
                  className="form-control"
                  value={formData.otherFinancialAmount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Enter amount if applicable"
                />
                <div className="form-help">
                  Optional / If applicable
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Reason / Justification</label>
                <textarea
                  name="otherFinancialReason"
                  className="form-control"
                  value={formData.otherFinancialReason}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Explain the reason or justification"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Required By Date</label>
                <input
                  type="date"
                  name="otherFinancialRequiredByDate"
                  className="form-control"
                  value={formData.otherFinancialRequiredByDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Details</label>
                <textarea
                  name="otherFinancialDetails"
                  className="form-control"
                  value={formData.otherFinancialDetails}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional details (optional)"
                />
              </div>
            </>
          )}

          {/* Hardware Purchase Fields - Shown when "Hardware Purchase" is selected */}
          {formData.requestReason === 'Hardware Purchase' && (
            <>
              <div className="form-group">
                <label className="form-label required">Hardware Name</label>
                <select
                  name="hardwareName"
                  className="form-control"
                  value={formData.hardwareName}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Hardware</option>
                  <option value="Desktop Computer">Desktop Computer</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Keyboard">Keyboard</option>
                  <option value="Mouse">Mouse</option>
                  <option value="Printer">Printer</option>
                  <option value="Scanner">Scanner</option>
                  <option value="Router">Router</option>
                  <option value="Switch">Switch</option>
                  <option value="Server">Server</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.hardwareName === 'Other' && (
                <div className="form-group">
                  <label className="form-label required">Specify Hardware</label>
                  <input
                    type="text"
                    name="hardwareNameOther"
                    className="form-control"
                    value={formData.hardwareNameOther}
                    onChange={handleChange}
                    required
                    placeholder="Enter hardware name"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label required">Technical Specifications</label>
                <textarea
                  name="hardwareTechnicalSpecs"
                  className="form-control"
                  value={formData.hardwareTechnicalSpecs}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the technical specifications"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Quantity</label>
                <input
                  type="number"
                  name="hardwareQuantity"
                  className="form-control"
                  value={formData.hardwareQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Purpose</label>
                <textarea
                  name="hardwarePurpose"
                  className="form-control"
                  value={formData.hardwarePurpose}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the purpose of this hardware purchase"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Required By Date</label>
                <input
                  type="date"
                  name="hardwareRequiredByDate"
                  className="form-control"
                  value={formData.hardwareRequiredByDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* Software & License Request Fields - Shown when "Software & License Request" is selected */}
          {formData.requestReason === 'Software & License Request' && (
            <>
              <div className="form-group">
                <label className="form-label required">Software Name / License Required</label>
                <input
                  type="text"
                  name="softwareName"
                  className="form-control"
                  value={formData.softwareName}
                  onChange={handleChange}
                  required
                  placeholder="Enter software name or license required"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">License Type</label>
                <input
                  type="text"
                  name="licenseType"
                  className="form-control"
                  value={formData.licenseType}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Perpetual, Subscription, Concurrent"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Number of Licenses</label>
                <input
                  type="number"
                  name="numberOfLicenses"
                  className="form-control"
                  value={formData.numberOfLicenses}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  placeholder="Enter number of licenses"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Purpose</label>
                <textarea
                  name="softwarePurpose"
                  className="form-control"
                  value={formData.softwarePurpose}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the purpose of this software/license request"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Required By Date</label>
                <input
                  type="date"
                  name="softwareRequiredByDate"
                  className="form-control"
                  value={formData.softwareRequiredByDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Information</label>
                <textarea
                  name="softwareAdditionalInfo"
                  className="form-control"
                  value={formData.softwareAdditionalInfo}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional information (optional)"
                />
              </div>
            </>
          )}

          {/* IT Equipment & Accessories Fields - Shown when "IT Equipment & Accessories" is selected */}
          {formData.requestReason === 'IT Equipment & Accessories' && (
            <>
              <div className="form-group">
                <label className="form-label required">Equipment Name</label>
                <select
                  name="equipmentName"
                  className="form-control"
                  value={formData.equipmentName}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Equipment / Accessory</option>
                  <option value="Keyboard">Keyboard</option>
                  <option value="Mouse">Mouse</option>
                  <option value="Headset">Headset</option>
                  <option value="Webcam">Webcam</option>
                  <option value="Adapter">Adapter</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.equipmentName === 'Other' && (
                <div className="form-group">
                  <label className="form-label required">Specify Equipment / Accessory</label>
                  <input
                    type="text"
                    name="equipmentNameOther"
                    className="form-control"
                    value={formData.equipmentNameOther}
                    onChange={handleChange}
                    required
                    placeholder="Enter equipment or accessory name"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label required">Quantity</label>
                <input
                  type="number"
                  name="equipmentQuantity"
                  className="form-control"
                  value={formData.equipmentQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Specifications</label>
                <textarea
                  name="equipmentSpecs"
                  className="form-control"
                  value={formData.equipmentSpecs}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter required specifications (optional)"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Purpose</label>
                <textarea
                  name="equipmentPurpose"
                  className="form-control"
                  value={formData.equipmentPurpose}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the purpose or business need"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Required By Date</label>
                <input
                  type="date"
                  name="equipmentRequiredByDate"
                  className="form-control"
                  value={formData.equipmentRequiredByDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Information</label>
                <textarea
                  name="equipmentAdditionalInfo"
                  className="form-control"
                  value={formData.equipmentAdditionalInfo}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional information (optional)"
                />
              </div>
            </>
          )}

          {/* Technology Service Request Fields - Shown when "Technology Service Request" is selected */}
          {formData.requestReason === 'Technology Service Request' && (
            <>
              <div className="form-group">
                <label className="form-label required">Service Required</label>
                <select
                  name="serviceRequired"
                  className="form-control"
                  value={formData.serviceRequired}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Service Required</option>
                  <option value="Installation">Installation</option>
                  <option value="Configuration">Configuration</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.serviceRequired === 'Other' && (
                <div className="form-group">
                  <label className="form-label required">Specify Service Required</label>
                  <input
                    type="text"
                    name="serviceRequiredOther"
                    className="form-control"
                    value={formData.serviceRequiredOther}
                    onChange={handleChange}
                    required
                    placeholder="Enter service required"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label required">System Name</label>
                <input
                  type="text"
                  name="systemEquipmentName"
                  className="form-control"
                  value={formData.systemEquipmentName}
                  onChange={handleChange}
                  required
                  placeholder="Enter system or equipment name"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Issue Description</label>
                <textarea
                  name="issueDescription"
                  className="form-control"
                  value={formData.issueDescription}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the issue or requirement in detail"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Required By Date</label>
                <input
                  type="date"
                  name="serviceRequiredByDate"
                  className="form-control"
                  value={formData.serviceRequiredByDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Information</label>
                <textarea
                  name="serviceAdditionalInfo"
                  className="form-control"
                  value={formData.serviceAdditionalInfo}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional information (optional)"
                />
              </div>
            </>
          )}

          {/* IT Procurement Request Fields - Shown when "IT Procurement Request" is selected */}
          {formData.requestReason === 'IT Procurement Request' && (
            <>
              <div className="form-group">
                <label className="form-label required">Item Required</label>
                <input
                  type="text"
                  name="procurementItem"
                  className="form-control"
                  value={formData.procurementItem}
                  onChange={handleChange}
                  required
                  placeholder="Enter item or service required"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vendor Name</label>
                <input
                  type="text"
                  name="procurementVendorName"
                  className="form-control"
                  value={formData.procurementVendorName}
                  onChange={handleChange}
                  placeholder="Enter vendor name if known"
                />
                <div className="form-help">
                  If known
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Quantity</label>
                <input
                  type="number"
                  name="procurementQuantity"
                  className="form-control"
                  value={formData.procurementQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Estimated Cost</label>
                <input
                  type="number"
                  name="procurementEstimatedCost"
                  className="form-control"
                  value={formData.procurementEstimatedCost}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="Enter estimated cost"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Purpose</label>
                <textarea
                  name="procurementPurpose"
                  className="form-control"
                  value={formData.procurementPurpose}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the purpose or business need"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Required By Date</label>
                <input
                  type="date"
                  name="procurementRequiredByDate"
                  className="form-control"
                  value={formData.procurementRequiredByDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Information</label>
                <textarea
                  name="procurementAdditionalInfo"
                  className="form-control"
                  value={formData.procurementAdditionalInfo}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional information (optional)"
                />
              </div>
            </>
          )}

          {/* Other IT Request Fields - Shown when "Other IT Request" is selected */}
          {formData.requestReason === 'Other IT Request' && (
            <>
              <div className="form-group">
                <label className="form-label required">What IT Service?</label>
                <input
                  type="text"
                  name="otherITService"
                  className="form-control"
                  value={formData.otherITService}
                  onChange={handleChange}
                  required
                  placeholder="Describe the IT service required"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Reason</label>
                <textarea
                  name="otherITReason"
                  className="form-control"
                  value={formData.otherITReason}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Explain the reason for this request"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Required By Date</label>
                <input
                  type="date"
                  name="otherITRequiredByDate"
                  className="form-control"
                  value={formData.otherITRequiredByDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Details</label>
                <textarea
                  name="otherITAdditionalDetails"
                  className="form-control"
                  value={formData.otherITAdditionalDetails}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional details (optional)"
                />
              </div>
            </>
          )}

          {/* Request Purpose - Hidden for Leave Application, Employee Documents, Experience Certificate, Salary-related Documents, Expense Bill, Quotation Request, Invoice Submission, Payment Request, Other Financial Request, Hardware Purchase, Software & License Request, IT Equipment & Accessories, Technology Service Request, IT Procurement Request, and Other IT Request */}
          {formData.requestReason !== 'Leave Application' && formData.requestReason !== 'Employee Documents' && formData.requestReason !== 'Experience Certificate' && formData.requestReason !== 'Salary-related Documents' && formData.requestReason !== 'Expense Bill' && formData.requestReason !== 'Quotation Request' && formData.requestReason !== 'Invoice Submission' && formData.requestReason !== 'Payment Request' && formData.requestReason !== 'Other Financial Request' && formData.requestReason !== 'Hardware Purchase' && formData.requestReason !== 'Software & License Request' && formData.requestReason !== 'IT Equipment & Accessories' && formData.requestReason !== 'Technology Service Request' && formData.requestReason !== 'IT Procurement Request' && formData.requestReason !== 'Other IT Request' && (
            <div className="form-group">
              <label className="form-label required">Request Purpose</label>
              <textarea
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="What is the purpose of this request and why is it needed?"
              />
              <div className="form-help">
                Clearly state the purpose of your request and why it's needed
              </div>
            </div>
          )}

          {/* Document Upload Section */}
          <div className="form-group">
            <label className="form-label required">Attach Required Documents</label>
            {isOtherSelected ? (
              <>
                <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '14px', color: '#2d3748' }}>Supporting Document</strong>
                      <div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>
                        Upload any document that supports your reason
                      </div>
                      {documents.length > 0 && (
                        <div style={{ fontSize: '13px', color: '#38a169', marginTop: '8px' }}>
                          ✓ {documents.length} document(s) uploaded
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <label
                        className="btn btn-sm btn-secondary"
                        style={{ cursor: 'pointer', margin: 0 }}
                      >
                        {uploadingFiles.length > 0 ? 'Uploading...' : 'Choose File'}
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(e, 'Supporting Document')}
                          disabled={uploadingFiles.length > 0 || loading}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {documents.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f0fdf4', borderRadius: '6px' }}>
                    <strong style={{ fontSize: '13px', color: '#047857', display: 'block', marginBottom: '8px' }}>Uploaded Documents:</strong>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {documents.map((doc, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          {/* File Icon */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#f0fdf4', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: '#047857', flexShrink: 0 }}>
                            {getFileIcon(doc.originalName)}
                          </div>
                          
                          {/* File Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <a
                              href={`${process.env.REACT_APP_API_URL}/requests/document/${doc.fileName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '13px', color: '#3182ce', textDecoration: 'none', cursor: 'pointer', display: 'block', wordBreak: 'break-word' }}
                              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                              {doc.originalName}
                            </a>
                            <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                              {(doc.fileSize / 1024).toFixed(2)} KB
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            type="button"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '18px',
                              color: '#cbd5e0',
                              padding: '4px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: '1',
                              transition: 'color 0.2s',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#e53e3e'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e0'}
                            onClick={() => handleRemoveDocument(doc.fileName)}
                            disabled={loading}
                            title="Remove document"
                          >
                            ⊗
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : formData.requestReason ? (
              <>
                <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '14px', color: '#2d3748' }}>{formData.requestReason}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {!documents.some(d => d.documentType === formData.requestReason) && (
                        <label
                          className="btn btn-sm btn-secondary"
                          style={{ cursor: 'pointer', margin: 0 }}
                        >
                          {uploadingFiles.includes(formData.requestReason) ? 'Uploading...' : 'Choose File'}
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(e, formData.requestReason)}
                            disabled={uploadingFiles.includes(formData.requestReason) || loading}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
                {documents.some(d => d.documentType === formData.requestReason) && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f0fdf4', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      {/* File Icon */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#f0fdf4', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: '#047857', flexShrink: 0 }}>
                        {getFileIcon(documents.find(d => d.documentType === formData.requestReason).originalName)}
                      </div>
                      
                      {/* File Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <a
                          href={`${process.env.REACT_APP_API_URL}/requests/document/${documents.find(d => d.documentType === formData.requestReason).fileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '13px', color: '#3182ce', textDecoration: 'none', cursor: 'pointer', display: 'block', wordBreak: 'break-word' }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {documents.find(d => d.documentType === formData.requestReason).originalName}
                        </a>
                        <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                          {(documents.find(d => d.documentType === formData.requestReason).fileSize / 1024).toFixed(2)} KB
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          color: '#cbd5e0',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: '1',
                          transition: 'color 0.2s',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#e53e3e'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e0'}
                        onClick={() => handleRemoveDocument(documents.find(d => d.documentType === formData.requestReason).fileName)}
                        disabled={loading}
                        title="Remove document"
                      >
                        ⊗
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="alert alert-info" style={{ marginBottom: '16px' }}>
                <strong>Please select a Request Reason</strong> to see the required document upload section.
              </div>
            )}

            <div className="form-help" style={{ marginTop: '12px' }}>
              Allowed file types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT (Max 10MB per file)
            </div>
          </div>

          <div className="alert alert-info">
            <strong>Note:</strong> After submission, you will have 5 minutes to edit or cancel your request before it is automatically sent to the manager for review.
          </div>

          <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || uploadingFiles.length > 0}
            >
              {loading ? 'Submitting...' : uploadingFiles.length > 0 ? 'Uploading...' : 'Submit Request'}
            </button>
          </div>
        </form>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={confirmDialogConfig.onConfirm}
          title={confirmDialogConfig.title}
          message={confirmDialogConfig.message}
          type={confirmDialogConfig.type}
        />
      </div>
    </div>
  );
};

export default CreateRequest;
