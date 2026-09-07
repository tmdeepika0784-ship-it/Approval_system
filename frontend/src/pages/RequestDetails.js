import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestAPI, queryAPI } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  formatDate,
  getStatusBadgeClass,
  getWorkflowStatusLabel,
  canPerformAction
} from '../utils/helpers';
import axios from 'axios';

// Document types based on request type (same as CreateRequest)
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
    'Quotation',
    'Research Document',
    'Other'
  ],
  'Finance Request': [
    'Expense Bill',
    'Invoice',
    'Quotation',
    'Payment Document',
    'Other'
  ]
};

// Map request reason to required document label (same as CreateRequest)
const REASON_TO_DOCUMENT_LABEL = {
  'Leave Application': 'Upload Leave Application Document',
  'Employee Documents': 'Upload Employee Document',
  'Experience Certificate': 'Upload Relevant Supporting Document',
  'Salary-related Documents': 'Upload Salary-related Document',
  'Technical Specification': 'Upload Technical Specification',
  'Project Proposal': 'Upload Project Proposal',
  'Quotation': 'Upload Quotation',
  'Research Document': 'Upload Research Document',
  'Expense Bill': 'Upload Expense Bill',
  'Invoice': 'Upload Invoice',
  'Payment Document': 'Upload Payment Document'
};

const RequestDetails = () => {
  const [request, setRequest] = useState(null);
  const [sla, setSla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({
    title: '',
    message: '',
    onConfirm: null,
    type: 'primary',
    showSingleButton: false
  });
  const [revertAction, setRevertAction] = useState(''); // 'edit' or 'cancel'
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    requestType: '',
    requestReason: '',
    requestReasonOther: '',
    documents: []
  });
  const [editDocuments, setEditDocuments] = useState([]);
  const [editUploadingFiles, setEditUploadingFiles] = useState([]);
  const [queryData, setQueryData] = useState({ recipientId: '', message: '' });
  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [revertTimeRemaining, setRevertTimeRemaining] = useState(null);
  const [requestQueries, setRequestQueries] = useState([]);

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequest();
    fetchRequestQueries();
  }, [id]);

  useEffect(() => {
    if (request && request.canRevert && request.revertDeadline) {
      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining();
        setRevertTimeRemaining(remaining);
        
        if (remaining === 'Expired') {
          clearInterval(interval);
          fetchRequest(); // Refresh to update canRevert status
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [request]);

  const calculateTimeRemaining = () => {
    if (!request.revertDeadline) return null;
    
    const now = new Date();
    const deadline = new Date(request.revertDeadline);
    const diff = deadline - now;
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await requestAPI.getById(id);
      setRequest(response.data.request);
      setSla(response.data.sla);
    } catch (err) {
      setError('Failed to load request details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestQueries = async () => {
    try {
      const response = await queryAPI.getByRequest(id);
      setRequestQueries(response.data.queries || []);
    } catch (err) {
      console.error('Failed to load queries:', err);
      setRequestQueries([]);
    }
  };

  const loadRecipients = async () => {
    // Get workflow-based recipients dynamically
    try {
      const response = await queryAPI.getWorkflowRecipients(id);
      setAvailableRecipients(response.data.recipients || []);
    } catch (err) {
      console.error('Failed to load recipients:', err);
      setAvailableRecipients([]);
    }
  };

  // Get file icon based on file extension (same as CreateRequest)
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

  // Handle file upload for edit form (same as CreateRequest)
  const handleEditFileUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setEditError('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      setEditError('Only document files (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT) are allowed');
      return;
    }

    // Add to uploading state
    setEditUploadingFiles(prev => [...prev, documentType]);
    setEditError('');

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

      // Add uploaded document to editDocuments array
      setEditDocuments(prev => [...prev, response.data.document]);
      setEditError('');
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      // Remove from uploading state
      setEditUploadingFiles(prev => prev.filter(type => type !== documentType));
      // Reset file input
      e.target.value = '';
    }
  };

  // Handle remove document from edit form
  const handleEditRemoveDocument = (fileName) => {
    setEditDocuments(prev => prev.filter(doc => doc.fileName !== fileName));
    setEditError('');
  };

  const handleForward = async () => {
    if (!comments.trim()) {
      setConfirmDialogConfig({
        title: 'Missing Comments',
        message: 'Please enter comments before forwarding',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'warning',
        showSingleButton: false
      });
      setShowConfirmDialog(true);
      return;
    }

    setConfirmDialogConfig({
      title: 'Forward Request',
      message: 'Are you sure you want to forward this request?',
      onConfirm: async () => {
        setShowConfirmDialog(false);
        try {
          setActionLoading(true);
          await requestAPI.forward(id, { comments });
          setComments('');
          fetchRequest();
          setConfirmDialogConfig({
            title: 'Success',
            message: 'Request forwarded successfully',
            onConfirm: () => setShowConfirmDialog(false),
            type: 'primary',
            showSingleButton: true
          });
          setShowConfirmDialog(true);
        } catch (err) {
          setConfirmDialogConfig({
            title: 'Error',
            message: err.response?.data?.message || 'Failed to forward request',
            onConfirm: () => setShowConfirmDialog(false),
            type: 'danger',
            showSingleButton: true
          });
          setShowConfirmDialog(true);
        } finally {
          setActionLoading(false);
        }
      },
      type: 'primary',
      showSingleButton: false
    });
    setShowConfirmDialog(true);
  };

  const handleApprove = async () => {
    setConfirmDialogConfig({
      title: 'Approve Request',
      message: 'Are you sure you want to approve this request?',
      onConfirm: async () => {
        setShowConfirmDialog(false);
        try {
          setActionLoading(true);
          await requestAPI.approve(id, { comments: '' });
          setComments('');
          fetchRequest();
        } catch (err) {
          setConfirmDialogConfig({
            title: 'Error',
            message: err.response?.data?.message || 'Failed to approve request',
            onConfirm: () => setShowConfirmDialog(false),
            type: 'danger',
            showSingleButton: true
          });
          setShowConfirmDialog(true);
        } finally {
          setActionLoading(false);
        }
      },
      type: 'primary',
      showSingleButton: false
    });
    setShowConfirmDialog(true);
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      setConfirmDialogConfig({
        title: 'Missing Comments',
        message: 'Please enter comments before rejecting',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'warning',
        showSingleButton: false
      });
      setShowConfirmDialog(true);
      return;
    }

    setConfirmDialogConfig({
      title: 'Reject Request',
      message: 'Are you sure you want to reject this request?',
      onConfirm: async () => {
        setShowConfirmDialog(false);
        try {
          setActionLoading(true);
          await requestAPI.reject(id, { comments });
          setComments('');
          fetchRequest();
        } catch (err) {
          setConfirmDialogConfig({
            title: 'Error',
            message: err.response?.data?.message || 'Failed to reject request',
            onConfirm: () => setShowConfirmDialog(false),
            type: 'danger',
            showSingleButton: true
          });
          setShowConfirmDialog(true);
        } finally {
          setActionLoading(false);
        }
      },
      type: 'danger',
      showSingleButton: false
    });
    setShowConfirmDialog(true);
  };

  const handleRevert = async () => {
    setShowRevertModal(true);
  };

  const handleRevertAction = async (action) => {
    setRevertAction(action);
    setEditError(''); // Clear previous edit errors
    
    if (action === 'edit') {
      // Ensure we have the latest request data before loading into edit form
      if (!request) {
        setEditError('Failed to load request data');
        return;
      }
      
      // Load current request data for editing - include all CreateRequest fields
      // Fetch the latest request to ensure we have all saved data
      try {
        const response = await requestAPI.getById(id);
        const latestRequest = response.data.request;
        
        const currentDocs = Array.isArray(latestRequest.documents) ? latestRequest.documents : [];
        
        // Ensure requestReason is loaded from the database - don't initialize as empty
        const savedReason = latestRequest.requestReason || '';
        const savedReasonOther = latestRequest.requestReasonOther || '';
        
        setEditFormData({
          title: latestRequest.title || '',
          description: latestRequest.description || '',
          requestType: latestRequest.requestType || 'HR Request',
          requestReason: savedReason,
          requestReasonOther: savedReasonOther,
          documents: currentDocs
        });
        setEditDocuments(currentDocs);
        setEditUploadingFiles([]);
      } catch (err) {
        console.error('Failed to fetch request for edit:', err);
        setEditError('Failed to load request data for editing');
      }
    } else if (action === 'cancel') {
      setConfirmDialogConfig({
        title: 'Cancel Request',
        message: 'Are you sure you want to cancel this request? This action cannot be undone.',
        onConfirm: async () => {
          setShowConfirmDialog(false);
          try {
            setActionLoading(true);
            await requestAPI.revert(id, { action: 'cancel' });
            setShowRevertModal(false);
            fetchRequest();
            setConfirmDialogConfig({
              title: 'Request Cancelled',
              message: 'Request cancelled successfully',
              onConfirm: () => setShowConfirmDialog(false),
              type: 'primary',
              showSingleButton: true
            });
            setShowConfirmDialog(true);
          } catch (err) {
            setConfirmDialogConfig({
              title: 'Error',
              message: err.response?.data?.message || 'Failed to cancel request',
              onConfirm: () => setShowConfirmDialog(false),
              type: 'danger',
              showSingleButton: true
            });
            setShowConfirmDialog(true);
          } finally {
            setActionLoading(false);
          }
        },
        type: 'danger',
        showSingleButton: false
      });
      setShowConfirmDialog(true);
    }
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    
    setConfirmDialogConfig({
      title: 'Resubmit Request',
      message: 'Are you sure you want to resubmit this request with the updated information?',
      onConfirm: async () => {
        setShowConfirmDialog(false);
        try {
          setActionLoading(true);
          // Send editFormData with editDocuments included
          await requestAPI.resubmit(id, {
            title: editFormData.title,
            description: editFormData.description,
            requestType: editFormData.requestType,
            requestReason: editFormData.requestReason,
            requestReasonOther: editFormData.requestReasonOther,
            documents: editDocuments
          });
          setShowRevertModal(false);
          setRevertAction('');
          fetchRequest();
          setConfirmDialogConfig({
            title: 'Success',
            message: 'Request updated and resubmitted successfully',
            onConfirm: () => setShowConfirmDialog(false),
            type: 'primary',
            showSingleButton: true
          });
          setShowConfirmDialog(true);
        } catch (err) {
          setConfirmDialogConfig({
            title: 'Error',
            message: err.response?.data?.message || 'Failed to resubmit request',
            onConfirm: () => setShowConfirmDialog(false),
            type: 'danger',
            showSingleButton: true
          });
          setShowConfirmDialog(true);
        } finally {
          setActionLoading(false);
        }
      },
      type: 'primary',
      showSingleButton: false
    });
    setShowConfirmDialog(true);
  };

  const handleSendQuery = async (e) => {
    e.preventDefault();

    if (!queryData.recipientId || !queryData.message.trim()) {
      setConfirmDialogConfig({
        title: 'Missing Information',
        message: 'Please select a recipient and enter a message',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'warning',
        showSingleButton: false
      });
      setShowConfirmDialog(true);
      return;
    }

    try {
      setActionLoading(true);
      await queryAPI.send({
        requestId: id,
        recipientId: queryData.recipientId,
        message: queryData.message,
        managerComments: comments
      });
      setQueryData({ recipientId: '', message: '' });
      setShowQueryModal(false);
      setConfirmDialogConfig({
        title: 'Success',
        message: 'Query sent successfully',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'primary',
        showSingleButton: true
      });
      setShowConfirmDialog(true);
      fetchRequest();
      fetchRequestQueries(); // Refresh queries list
    } catch (err) {
      setConfirmDialogConfig({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to send query',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'danger',
        showSingleButton: true
      });
      setShowConfirmDialog(true);
    } finally {
      setActionLoading(false);
    }
  };

  const openQueryModal = () => {
    loadRecipients();
    setShowQueryModal(true);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error || 'Request not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/requests')}>
          Back to Requests
        </button>
      </div>
    );
  }

  const isCurrentHandler = request.currentHandler?._id === user.id;
  const isCreator = request.createdBy._id === user.id;
  const canRevert = isCreator && request.canRevert && !request.isReverted && request.overallStatus === 'pending';

  return (
    <div className="page-container">
      <div className="flex-between mb-3">
        <div>
          <h1 className="page-title">{request.requestId}</h1>
          <p className="page-subtitle">Request Details</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/requests')}>
          Back to Requests
        </button>
      </div>

      {/* Request Info */}
      <div className="card">
        <div className="flex-between mb-3">
          <h2 className="card-title">{request.title}</h2>
          <div className="flex gap-1">
            <span className={`badge ${getStatusBadgeClass(request.overallStatus)}`}>
              {request.overallStatus.replace('_', ' ')}
            </span>
            {request.isFlagged && <span className="badge badge-flagged">Flagged</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Request Type</div>
            <div style={{ fontWeight: '500' }}>{request.requestType}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Current Stage</div>
            <div style={{ fontWeight: '500' }}>{request.currentStage}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Created By</div>
            <div style={{ fontWeight: '500' }}>{request.createdBy.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Created At</div>
            <div style={{ fontWeight: '500' }}>{formatDate(request.createdAt)}</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>Request Purpose</div>
          <div style={{ padding: '12px', background: '#f7fafc', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
            {request.description}
          </div>
        </div>

        {/* Attached Documents */}
        {request.documents && request.documents.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '12px' }}>Attached Documents</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {request.documents.map((doc, index) => (
                <a
                  key={index}
                  href={`${process.env.REACT_APP_API_URL}/requests/document/${doc.fileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '12px 16px',
                    background: '#f7fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    color: '#2d3748',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#edf2f7';
                    e.currentTarget.style.borderColor = '#cbd5e0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f7fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#2d3748', marginBottom: '2px' }}>
                      {doc.originalName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>
                      {doc.documentType} • {(doc.fileSize / 1024).toFixed(2)} KB • {formatDate(doc.uploadedAt)}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#3182ce', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    Open →
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* SLA Info */}
        {request.overallStatus === 'pending' && sla && sla.workingHours !== undefined && user?.role !== 'Employee' && (
          <div className="alert alert-info mt-3">
            <strong>SLA Status:</strong> {parseFloat(sla.workingHours).toFixed(2)} working hours elapsed. 
            {sla.timeUntilFlag && parseFloat(sla.timeUntilFlag) > 0 && ` ${parseFloat(sla.timeUntilFlag).toFixed(1)} hours until flagging.`}
            {sla.reminderSent && ' Reminder sent.'}
          </div>
        )}

        {/* Revert Timer */}
        {canRevert && revertTimeRemaining && revertTimeRemaining !== 'Expired' && (
          <div className="alert alert-warning mt-3">
            <strong>Revert Available:</strong> You can revert this request for {revertTimeRemaining}
          </div>
        )}
      </div>

      {/* Workflow Timeline */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Workflow Progress</h2>
        </div>

        <div className="workflow-timeline">
          <div className="workflow-steps-container">
            {request && request.workflow && request.workflow.map((stage, index) => {
              const isCurrent = stage.role === request.currentStage;
              const isCompleted = stage.status !== 'pending';
              
              // Determine icon based on status
              let icon;
              if (isCurrent) {
                icon = '●';
              } else if (stage.status === 'rejected') {
                icon = '✕';
              } else if (isCompleted) {
                icon = '✓';
              } else {
                icon = index + 1;
              }
              
              return (
                <div key={index} className={`workflow-step ${isCompleted ? 'completed' : ''}`}>
                  <div className={`workflow-icon ${isCurrent ? 'current' : stage.status === 'rejected' ? 'rejected' : isCompleted ? 'completed' : 'pending'}`}>
                    {icon}
                  </div>
                  <div className="workflow-content">
                    <div className="workflow-role">
                      {stage.role}
                    </div>
                    <div className="workflow-status">
                      {getWorkflowStatusLabel(stage.status)}
                      {isCurrent && ' (Current)'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Queries Section */}
      {requestQueries.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Queries ({requestQueries.length})</h2>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Response</th>
                </tr>
              </thead>
              <tbody>
                {requestQueries.map((query) => (
                  <tr key={query._id}>
                    <td>
                      {query.sentBy?.name}
                      <br />
                      <span style={{ fontSize: '12px', color: '#718096' }}>
                        ({query.sentBy?.role})
                      </span>
                    </td>
                    <td>
                      {query.sentTo?.name}
                      <br />
                      <span style={{ fontSize: '12px', color: '#718096' }}>
                        ({query.sentTo?.role})
                      </span>
                    </td>
                    <td>
                      <div style={{ maxWidth: '300px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {query.message}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${query.status === 'responded' ? 'badge-approved' : 'badge-pending'}`}>
                        {query.status === 'pending' ? 'Pending' : 'Query Responded'}
                      </span>
                    </td>
                    <td>{formatDate(query.createdAt)}</td>
                    <td>
                      {query.response ? (
                        <div>
                          <div style={{ maxWidth: '300px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '8px', background: '#d1fae5', borderRadius: '4px', marginBottom: '4px' }}>
                            {query.response}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>No response yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manager Action Buttons */}
      {isCurrentHandler && request.overallStatus === 'pending' && user?.role !== 'Employee' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Action Required</h2>
          </div>
          
          {/* Comments Section */}
          <div className="form-group">
            <label className="form-label required">Comments</label>
            <textarea
              className="form-control"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows="4"
              placeholder="Enter your comments for this action"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {canPerformAction(user?.role, 'canForward') && (
              <button
                className="btn btn-primary"
                onClick={handleForward}
                disabled={actionLoading || !comments.trim()}
              >
                Forward
              </button>
            )}
            {canPerformAction(user?.role, 'canApprove') && (
              <button
                className="btn btn-success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                Approve
              </button>
            )}
            {canPerformAction(user?.role, 'canReject') && (
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={actionLoading || !comments.trim()}
              >
                Reject
              </button>
            )}
            {canPerformAction(user?.role, 'canSendQuery') && (
              <button
                className="btn btn-secondary"
                onClick={openQueryModal}
                disabled={actionLoading}
              >
                Send Query
              </button>
            )}
          </div>
        </div>
      )}

      {/* Revert Action for Employee */}
      {canRevert && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Revert/Edit Request</h2>
          </div>
          <div className="alert alert-warning mb-3">
            You can edit or cancel this request within 5 minutes of submission. Time remaining: {revertTimeRemaining || 'Calculating...'}
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => handleRevertAction('edit')}
              disabled={actionLoading || revertTimeRemaining === 'Expired'}
            >
              Edit Request
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleRevertAction('cancel')}
              disabled={actionLoading || revertTimeRemaining === 'Expired'}
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

      {/* Edit/Cancel Modal */}
      {revertAction === 'edit' && (
        <div className="modal-overlay" onClick={() => setRevertAction('')}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Request</h2>
            </div>

            {editError && <div className="alert alert-error" style={{ margin: '16px' }}>{editError}</div>}

            <form onSubmit={handleResubmit} style={{ padding: '16px' }}>
              <div className="form-group">
                <label className="form-label required">Request Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                  placeholder="Brief description of your request"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Request Type</label>
                <select
                  className="form-control"
                  value={editFormData.requestType}
                  onChange={(e) => setEditFormData({ ...editFormData, requestType: e.target.value, requestReason: '', requestReasonOther: '' })}
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
                  className="form-control"
                  value={editFormData.requestReason || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, requestReason: e.target.value, requestReasonOther: '' })}
                  required
                >
                  {!editFormData.requestReason && <option value="">Select a reason...</option>}
                  {(REQUEST_REASONS[editFormData.requestType] || []).map(reason => (
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
              {editFormData.requestReason === 'Other' && (
                <div className="form-group">
                  <label className="form-label required">Specify Your Reason</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.requestReasonOther}
                    onChange={(e) => setEditFormData({ ...editFormData, requestReasonOther: e.target.value })}
                    required
                    placeholder="Please describe your custom reason"
                  />
                  <div className="form-help">
                    Clearly describe the custom reason for your request
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label required">Request Purpose</label>
                <textarea
                  className="form-control"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  required
                  rows="6"
                  placeholder="What is the purpose of this request and why is it needed?"
                />
                <div className="form-help">
                  Clearly state the purpose of your request and why it's needed
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="form-group">
                <label className="form-label required">Attach Required Documents</label>
                {editFormData.requestReason === 'Other' ? (
                  <>
                    <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '14px', color: '#2d3748' }}>Supporting Document</strong>
                          <div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>
                            Upload any document that supports your reason
                          </div>
                          {editDocuments.length > 0 && (
                            <div style={{ fontSize: '13px', color: '#38a169', marginTop: '8px' }}>
                              ✓ {editDocuments.length} document(s) uploaded
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <label
                            className="btn btn-sm btn-secondary"
                            style={{ cursor: 'pointer', margin: 0 }}
                          >
                            {editUploadingFiles.length > 0 ? 'Uploading...' : 'Choose File'}
                            <input
                              type="file"
                              style={{ display: 'none' }}
                              onChange={(e) => handleEditFileUpload(e, 'Supporting Document')}
                              disabled={editUploadingFiles.length > 0 || actionLoading}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    {editDocuments.length > 0 && (
                      <div style={{ marginTop: '12px', padding: '12px', background: '#f0fdf4', borderRadius: '6px' }}>
                        <strong style={{ fontSize: '13px', color: '#047857', display: 'block', marginBottom: '8px' }}>Uploaded Documents:</strong>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {editDocuments.map((doc, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#f0fdf4', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: '#047857', flexShrink: 0 }}>
                                {getFileIcon(doc.originalName)}
                              </div>
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
                                onClick={() => handleEditRemoveDocument(doc.fileName)}
                                disabled={actionLoading}
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
                ) : editFormData.requestReason && editFormData.requestReason !== 'Other' ? (
                  <>
                    <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '14px', color: '#2d3748' }}>{editFormData.requestReason}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {!editDocuments.some(d => d.documentType === editFormData.requestReason) && (
                            <label
                              className="btn btn-sm btn-secondary"
                              style={{ cursor: 'pointer', margin: 0 }}
                            >
                              {editUploadingFiles.includes(editFormData.requestReason) ? 'Uploading...' : 'Choose File'}
                              <input
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(e) => handleEditFileUpload(e, editFormData.requestReason)}
                                disabled={editUploadingFiles.includes(editFormData.requestReason) || actionLoading}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                    {editDocuments.some(d => d.documentType === editFormData.requestReason) && (
                      <div style={{ marginTop: '12px', padding: '12px', background: '#f0fdf4', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#f0fdf4', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: '#047857', flexShrink: 0 }}>
                            {getFileIcon(editDocuments.find(d => d.documentType === editFormData.requestReason).originalName)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <a
                              href={`${process.env.REACT_APP_API_URL}/requests/document/${editDocuments.find(d => d.documentType === editFormData.requestReason).fileName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '13px', color: '#3182ce', textDecoration: 'none', cursor: 'pointer', display: 'block', wordBreak: 'break-word' }}
                              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                              {editDocuments.find(d => d.documentType === editFormData.requestReason).originalName}
                            </a>
                            <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                              {(editDocuments.find(d => d.documentType === editFormData.requestReason).fileSize / 1024).toFixed(2)} KB
                            </div>
                          </div>
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
                            onClick={() => handleEditRemoveDocument(editDocuments.find(d => d.documentType === editFormData.requestReason).fileName)}
                            disabled={actionLoading}
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

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRevertAction('')}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading || editUploadingFiles.length > 0}
                >
                  {actionLoading ? 'Resubmitting...' : editUploadingFiles.length > 0 ? 'Uploading...' : 'Resubmit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Query Modal */}
      {showQueryModal && (
        <div className="modal-overlay" onClick={() => setShowQueryModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Send Query</h2>
            </div>

            <form onSubmit={handleSendQuery}>
              <div className="form-group">
                <label className="form-label required">Send To</label>
                <select
                  className="form-control"
                  value={queryData.recipientId}
                  onChange={(e) => setQueryData({ ...queryData, recipientId: e.target.value })}
                  required
                >
                  <option value="">Select recipient</option>
                  {availableRecipients.map((recipient) => (
                    <option key={recipient._id} value={recipient._id}>
                      {recipient.name} ({recipient.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Message</label>
                <textarea
                  className="form-control"
                  value={queryData.message}
                  onChange={(e) => setQueryData({ ...queryData, message: e.target.value })}
                  rows="4"
                  required
                  placeholder="Enter your query message"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowQueryModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  Send Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDialogConfig.onConfirm}
        title={confirmDialogConfig.title}
        message={confirmDialogConfig.message}
        type={confirmDialogConfig.type}
        showSingleButton={confirmDialogConfig.showSingleButton}
      />
    </div>
  );
};

export default RequestDetails;
