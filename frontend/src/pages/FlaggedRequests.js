import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestAPI } from '../services/api';
import { formatDate, getStatusBadgeClass, truncate, hasFlaggedRequestsAccess } from '../utils/helpers';

const FlaggedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [roleCounts, setRoleCounts] = useState({});

  const { user } = useAuth();
  const navigate = useNavigate();

  const hasAccess = hasFlaggedRequestsAccess(user?.role);
  const isCEO = user?.role === 'CEO';

  const roles = [
    'Manager',
    'HR',
    'IT & Purchase',
    'Finance',
    'Accountant',
    'General Manager'
  ];

  useEffect(() => {
    if (hasAccess) {
      fetchFlaggedRequests('all'); // Initial fetch for all roles
    }
  }, [hasAccess]);

  useEffect(() => {
    filterRequestsByRole();
  }, [selectedRole, allRequests]);

  const fetchFlaggedRequests = async (role = 'all') => {
    try {
      setLoading(true);
      setError('');
      const params = role !== 'all' ? { roleFilter: role } : {};
      const response = await requestAPI.getFlagged(params);
      
      // Verify response structure
      if (!response.data || !response.data.requests) {
        throw new Error('Invalid response format from server');
      }
      
      setAllRequests(response.data.requests);
      
      // If CEO and roleCounts provided, use them; otherwise calculate locally
      if (isCEO && response.data.roleCounts) {
        setRoleCounts(response.data.roleCounts);
      } else {
        calculateRoleCounts(response.data.requests);
      }
    } catch (err) {
      // Provide more specific error messages based on error type
      let errorMsg = 'Failed to load flagged requests';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 403) {
          errorMsg = 'You do not have permission to view flagged requests';
        } else if (status === 401) {
          errorMsg = 'Your session has expired. Please log in again.';
        } else if (status === 500) {
          errorMsg = 'Server error. Please try again later.';
        } else if (data?.message) {
          errorMsg = data.message;
        }
      } else if (err.request) {
        errorMsg = 'Network error. Please check your connection.';
      }
      
      setError(errorMsg);
      console.error('Error fetching flagged requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoleCounts = (reqs) => {
    const counts = {};
    roles.forEach(role => {
      counts[role] = reqs.filter(req => req.currentStage === role).length;
    });
    setRoleCounts(counts);
  };

  const filterRequestsByRole = () => {
    if (selectedRole === 'all') {
      setRequests(allRequests);
    } else {
      setRequests(allRequests.filter(req => req.currentStage === selectedRole));
    }
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    // For CEO, fetch data with role filter when changed
    if (isCEO) {
      fetchFlaggedRequests(role);
    }
  };

  const handleRequestClick = (id) => {
    navigate(`/requests/${id}`);
  };

  // Check access - show error if no access
  if (!hasAccess) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          You do not have access to flagged requests.
        </div>
      </div>
    );
  }

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
        <h1 className="page-title">Flagged Requests</h1>
        <p className="page-subtitle">Requests that have exceeded SLA thresholds</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Flagged Requests ({requests.length})</h2>
          {isCEO && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#4a5568' }}>
                Filter by Role:
              </label>
              <select
                className="form-control"
                value={selectedRole}
                onChange={handleRoleChange}
                style={{ width: '200px', padding: '8px 12px', fontSize: '14px' }}
              >
                <option value="all">All Roles ({allRequests.length})</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role} ({roleCounts[role] || 0})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!error && requests.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Current Stage</th>
                  <th>Created By</th>
                  <th>Flagged At</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id} onClick={() => handleRequestClick(request._id)}>
                    <td>
                      <strong>{request.requestId}</strong>
                      <span className="badge badge-flagged ml-1">Flagged</span>
                    </td>
                    <td>{truncate(request.title, 40)}</td>
                    <td>{request.requestType}</td>
                    <td>{request.currentStage}</td>
                    <td>{request.createdBy?.name || 'N/A'}</td>
                    <td>{formatDate(request.flaggedAt)}</td>
                    <td>{formatDate(request.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !error ? (
          <div className="empty-state">
            <div className="empty-state-message">No flagged requests</div>
            <p style={{ fontSize: '14px', color: '#718096' }}>
              All requests are within SLA thresholds
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FlaggedRequests;
