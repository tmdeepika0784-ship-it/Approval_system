import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAPI } from '../services/api';
import { getStatusBadgeClass, truncate } from '../utils/helpers';

const AllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    requestType: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.requestType) params.requestType = filters.requestType;

      const response = await requestAPI.getAll(params);
      setRequests(response.data.requests);
    } catch (err) {
      setError('Failed to load requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleRequestClick = (id) => {
    navigate(`/requests/${id}`);
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
        <h1 className="page-title">All Requests</h1>
        <p className="page-subtitle">View and manage all requests</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="card mb-3">
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label className="form-label">Filter by Status</label>
            <select
              name="status"
              className="form-control"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="reverted">Reverted</option>
              <option value="query_raised">Query Raised</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label className="form-label">Filter by Type</label>
            <select
              name="requestType"
              className="form-control"
              value={filters.requestType}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="HR Request">HR Request</option>
              <option value="IT & Purchase Request">IT & Purchase Request</option>
              <option value="Finance Request">Finance Request</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Requests ({requests.length})</h2>
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
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id} onClick={() => handleRequestClick(request._id)}>
                    <td>
                      <strong>{request.requestId}</strong>
                      {request.isFlagged && (
                        <span className="badge badge-flagged ml-1">Flagged</span>
                      )}
                    </td>
                    <td>{truncate(request.title, 40)}</td>
                    <td>{request.requestType}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(request.overallStatus)}`}>
                        {request.overallStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{request.currentStage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-message">No requests found</div>
            <p style={{ fontSize: '14px', color: '#718096' }}>
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRequests;
