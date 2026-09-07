import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { queryAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import ConfirmDialog from '../components/ConfirmDialog';

const Queries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('received');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [response, setResponse] = useState('');
  const [respondLoading, setRespondLoading] = useState(false);
  const [responseDocuments, setResponseDocuments] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'primary'
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchQueries();
  }, [activeTab]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const response = await queryAPI.getAll({ type: activeTab });
      setQueries(response.data.queries);
    } catch (err) {
      setError('Failed to load queries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryClick = (query) => {
    setSelectedQuery(query);
    setResponse('');
  };

  const handleRespond = async (e) => {
    e.preventDefault();

    if (!response.trim()) {
      setConfirmDialogConfig({
        title: 'Missing Response',
        message: 'Please enter a response',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'warning'
      });
      setShowConfirmDialog(true);
      return;
    }

    try {
      setRespondLoading(true);
      
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('response', response);
      
      // Add documents if any
      responseDocuments.forEach((doc, index) => {
        if (doc.file) {
          formData.append(`documents`, doc.file);
        }
      });

      await queryAPI.respond(selectedQuery._id, formData);
      
      setConfirmDialogConfig({
        title: 'Response Submitted',
        message: 'Response submitted successfully. The request has been returned to the sender for review.',
        onConfirm: () => {
          setShowConfirmDialog(false);
          setSelectedQuery(null);
          setResponse('');
          setResponseDocuments([]);
          fetchQueries();
        },
        type: 'primary'
      });
      setShowConfirmDialog(true);
    } catch (err) {
      setConfirmDialogConfig({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to submit response',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'danger'
      });
      setShowConfirmDialog(true);
    } finally {
      setRespondLoading(false);
    }
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map(file => ({
      file,
      fileName: file.name
    }));
    setResponseDocuments([...responseDocuments, ...newDocuments]);
  };

  const handleRemoveDocument = (index) => {
    setResponseDocuments(responseDocuments.filter((_, i) => i !== index));
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
        <h1 className="page-title">Queries</h1>
        <p className="page-subtitle">View and respond to queries</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Tabs */}
      <div className="card mb-3">
        <div className="flex gap-2">
          <button
            className={`btn ${activeTab === 'received' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('received')}
          >
            Received ({queries.filter(q => activeTab === 'received').length})
          </button>
          {user?.role !== 'Employee' && (
            <button
              className={`btn ${activeTab === 'sent' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('sent')}
            >
              Sent ({queries.filter(q => activeTab === 'sent').length})
            </button>
          )}
        </div>
      </div>

      {/* Queries List */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {activeTab === 'received' ? 'Received Queries' : 'Sent Queries'} ({queries.length})
          </h2>
        </div>

        {queries.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>{activeTab === 'received' ? 'From' : 'To'}</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((query) => (
                  <tr key={query._id}>
                    <td><strong>{query.request?.requestId}</strong></td>
                    <td>
                      {activeTab === 'received' 
                        ? query.sentBy?.name 
                        : query.sentTo?.name}
                      <br />
                      <span style={{ fontSize: '12px', color: '#718096' }}>
                        ({activeTab === 'received' 
                          ? query.sentBy?.role 
                          : query.sentTo?.role})
                      </span>
                    </td>
                    <td>{query.message.substring(0, 60)}...</td>
                    <td>
                      <span className={`badge ${query.status === 'responded' ? 'badge-approved' : 'badge-pending'}`}>
                        {query.status === 'pending' ? 'Pending' : 'Query Responded'}
                      </span>
                    </td>
                    <td>{formatDate(query.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleQueryClick(query)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-message">No queries found</div>
          </div>
        )}
      </div>

      {/* Query Details Modal */}
      {selectedQuery && (
        <div className="modal-overlay" onClick={() => setSelectedQuery(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Query Details</h2>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Request:</strong> {selectedQuery.request?.requestId} - {selectedQuery.request?.title}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>From:</strong> {selectedQuery.sentBy?.name} ({selectedQuery.sentBy?.role})
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>To:</strong> {selectedQuery.sentTo?.name} ({selectedQuery.sentTo?.role})
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Date:</strong> {formatDate(selectedQuery.createdAt)}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Status:</strong>{' '}
                <span className={`badge ${selectedQuery.status === 'responded' ? 'badge-approved' : 'badge-pending'}`}>
                  {selectedQuery.status === 'pending' ? 'Pending' : 'Query Responded'}
                </span>
              </div>
              {selectedQuery.request?.description && (
                <div style={{ marginBottom: '12px' }}>
                  <strong>Request Purpose:</strong>
                  <div style={{ marginTop: '8px', padding: '12px', background: '#f7fafc', borderRadius: '6px', fontSize: '14px', color: '#4a5568', whiteSpace: 'pre-wrap' }}>
                    {selectedQuery.request.description}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong>Message:</strong>
              <div style={{ marginTop: '8px', padding: '12px', background: '#f7fafc', borderRadius: '6px' }}>
                {selectedQuery.message}
              </div>
            </div>

            {selectedQuery.response && (
              <div style={{ marginBottom: '20px' }}>
                <strong>Response:</strong>
                <div style={{ marginTop: '8px', padding: '12px', background: '#d1fae5', borderRadius: '6px' }}>
                  {selectedQuery.response}
                </div>
                <div style={{ fontSize: '13px', color: '#718096', marginTop: '8px' }}>
                  Responded at: {formatDate(selectedQuery.respondedAt)}
                </div>
              </div>
            )}

            {/* Respond Form (only for received pending queries) */}
            {activeTab === 'received' && 
             selectedQuery.status === 'pending' && 
             selectedQuery.sentTo._id === user.id && (
              <form onSubmit={handleRespond}>
                <div className="form-group">
                  <label className="form-label required">Your Response</label>
                  <textarea
                    className="form-control"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows="4"
                    required
                    placeholder="Enter your response"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Attach Documents</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleDocumentChange}
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                  />
                  <div className="form-help">
                    Optional - You can attach supporting documents with your response
                  </div>

                  {responseDocuments.length > 0 && (
                    <div className="document-list" style={{ marginTop: '12px' }}>
                      {responseDocuments.map((doc, index) => (
                        <div key={index} className="document-item" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          backgroundColor: '#f7fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          marginBottom: '8px'
                        }}>
                          <span>{doc.fileName}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveDocument(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedQuery(null);
                      setResponse('');
                      setResponseDocuments([]);
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={respondLoading}
                  >
                    {respondLoading ? 'Submitting...' : 'Submit Response'}
                  </button>
                </div>
              </form>
            )}

            {(activeTab === 'sent' || selectedQuery.status === 'responded' || selectedQuery.sentTo._id !== user.id) && (
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedQuery(null)}
                >
                  Close
                </button>
              </div>
            )}
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
      />
    </div>
  );
};

export default Queries;
