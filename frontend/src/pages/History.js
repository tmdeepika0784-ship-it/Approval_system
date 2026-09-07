import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestAPI } from '../services/api';
import { formatDate, getStatusBadgeClass, truncate, getWorkflowStatusLabel } from '../utils/helpers';

const History = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await requestAPI.getAll();
      // Get all requests created by this employee
      setRequests(response.data.requests);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Only employees can access history
  if (user?.role !== 'Employee') {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          This page is only accessible to employees.
        </div>
      </div>
    );
  }

  const handleViewDetails = async (requestId) => {
    try {
      const response = await requestAPI.getById(requestId);
      setSelectedRequest(response.data.request);
      setShowModal(true);
    } catch (err) {
      setError('Failed to load request details');
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Request History</h1>
        <p className="page-subtitle">View all your previous requests and their complete details</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Requests ({requests.length})</h2>
        </div>

        {requests.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Current Stage</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <strong>{request.requestId}</strong>
                      {request.isFlagged && <span className="badge badge-flagged ml-1">Flagged</span>}
                    </td>
                    <td>{truncate(request.title, 40)}</td>
                    <td>{request.requestType}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(request.overallStatus)}`}>
                        {request.overallStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{request.currentStage}</td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleViewDetails(request._id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-message">No requests found</div>
            <button className="btn btn-primary mt-2" onClick={() => navigate('/create-request')}>
              Create Your First Request
            </button>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}
          >
            <div className="modal-header">
              <h2 className="modal-title">Request History Details</h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#718096'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Basic Info */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>
                    {selectedRequest.requestId}
                  </h3>
                  <span className={`badge ${getStatusBadgeClass(selectedRequest.overallStatus)}`}>
                    {selectedRequest.overallStatus.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Title</div>
                    <div style={{ fontWeight: '500' }}>{selectedRequest.title}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Request Type</div>
                    <div style={{ fontWeight: '500' }}>{selectedRequest.requestType}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Created Date</div>
                    <div style={{ fontWeight: '500' }}>{formatDate(selectedRequest.createdAt)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Current Stage</div>
                    <div style={{ fontWeight: '500' }}>{selectedRequest.currentStage}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>Request Purpose</div>
                  <div style={{ padding: '12px', background: '#f7fafc', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                    {selectedRequest.description}
                  </div>
                </div>
              </div>

              {/* Attached Documents */}
              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#2d3748' }}>
                    Attached Documents ({selectedRequest.documents.length})
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                    {selectedRequest.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={`${process.env.REACT_APP_API_URL}/requests/document/${doc.fileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '12px',
                          background: '#f7fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          color: '#2d3748',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#3182ce', fontWeight: '600' }}>
                          {doc.documentType}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '500', wordBreak: 'break-word' }}>
                          {doc.originalName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>
                          {(doc.fileSize / 1024).toFixed(2)} KB
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflow Journey/Timeline */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#2d3748' }}>
                  Request Journey
                </h4>
                <div style={{ position: 'relative' }}>
                  {selectedRequest.workflow.map((stage, index) => {
                    const isCompleted = stage.status !== 'pending';
                    const isCurrent = stage.role === selectedRequest.currentStage;
                    
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          gap: '16px',
                          marginBottom: index < selectedRequest.workflow.length - 1 ? '16px' : '0',
                          position: 'relative'
                        }}
                      >
                        {/* Connector Line */}
                        {index < selectedRequest.workflow.length - 1 && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '15px',
                              top: '32px',
                              bottom: '-16px',
                              width: '2px',
                              background: isCompleted ? '#38a169' : '#e2e8f0'
                            }}
                          />
                        )}

                        {/* Stage Icon */}
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: isCompleted ? '#38a169' : isCurrent ? '#3182ce' : '#e2e8f0',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            fontSize: '14px',
                            flexShrink: 0,
                            position: 'relative',
                            zIndex: 1
                          }}
                        >
                          {isCompleted ? '✓' : index + 1}
                        </div>

                        {/* Stage Details */}
                        <div style={{ flex: 1, paddingBottom: '8px' }}>
                          <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '4px' }}>
                            {stage.role}
                            {isCurrent && <span style={{ color: '#3182ce', marginLeft: '8px' }}>(Current)</span>}
                          </div>
                          <div style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>
                            Status: {getWorkflowStatusLabel(stage.status)}
                          </div>
                          {stage.actionBy && (
                            <div style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>
                              Action By: {stage.actionBy.name}
                            </div>
                          )}
                          {stage.actionDate && (
                            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>
                              {formatDate(stage.actionDate)}
                            </div>
                          )}
                          {stage.comments && (
                            <div
                              style={{
                                marginTop: '8px',
                                padding: '8px',
                                background: '#f7fafc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                color: '#4a5568'
                              }}
                            >
                              <strong>Comments:</strong> {stage.comments}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approval/Rejection Details */}
              {(selectedRequest.overallStatus === 'approved' || selectedRequest.overallStatus === 'rejected') && (
                <div style={{ marginBottom: '24px' }}>
                  <div
                    className={`alert ${selectedRequest.overallStatus === 'approved' ? 'alert-success' : 'alert-error'}`}
                  >
                    <strong>
                      {selectedRequest.overallStatus === 'approved' ? 'Request Approved' : 'Request Rejected'}
                    </strong>
                    {selectedRequest.workflow
                      .filter(stage => stage.status === selectedRequest.overallStatus)
                      .map((stage, index) => (
                        <div key={index} style={{ marginTop: '8px', fontSize: '14px' }}>
                          <div>By: {stage.actionBy?.name || 'N/A'}</div>
                          <div>Date: {formatDate(stage.actionDate)}</div>
                          {stage.comments && <div>Reason: {stage.comments}</div>}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
