import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestAPI } from '../services/api';
import { getStatusBadgeClass, truncate } from '../utils/helpers';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await requestAPI.getDashboard();
      setDashboard(response.data.dashboard);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card pending">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{dashboard?.stats?.totalPending || 0}</div>
        </div>

        {user?.role === 'Employee' ? (
          <>
            <div className="stat-card approved">
              <div className="stat-label">Approved</div>
              <div className="stat-value">{dashboard?.stats?.totalApproved || 0}</div>
            </div>

            <div className="stat-card rejected">
              <div className="stat-label">Rejected</div>
              <div className="stat-value">{dashboard?.stats?.totalRejected || 0}</div>
            </div>
          </>
        ) : user?.role === 'CEO' ? (
          <>
            <div className="stat-card approved">
              <div className="stat-label">Approved</div>
              <div className="stat-value">{dashboard?.stats?.totalApproved || 0}</div>
            </div>

            <div className="stat-card rejected">
              <div className="stat-label">Rejected</div>
              <div className="stat-value">{dashboard?.stats?.totalRejected || 0}</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card approved">
              <div className="stat-label">Forwarded</div>
              <div className="stat-value">{dashboard?.stats?.totalForwarded || 0}</div>
            </div>

            <div className="stat-card rejected">
              <div className="stat-label">Rejected</div>
              <div className="stat-value">{dashboard?.stats?.totalRejected || 0}</div>
            </div>
          </>
        )}

        {/* Total Requests - shown for all roles */}
        <div className="stat-card info">
          <div className="stat-label">Total Requests</div>
          <div className="stat-value">{dashboard?.stats?.totalRequests || 0}</div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Recent Requests</h2>
          {user?.role === 'Employee' && (
            <button className="btn btn-primary" onClick={() => navigate('/create-request')}>
              Create New Request
            </button>
          )}
        </div>

        {dashboard?.recentRequests?.length > 0 ? (
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
                {dashboard.recentRequests.map((request) => (
                  <tr key={request._id} onClick={() => handleRequestClick(request._id)}>
                    <td>
                      <strong>{request.requestId}</strong>
                      {request.isFlagged && <span className="badge badge-flagged ml-1">Flagged</span>}
                    </td>
                    <td>{truncate(request.title, 40)}</td>
                    <td>{request.requestType}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(request.overallStatus)}`}>
                        {request.overallStatus}
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
            <div className="empty-state-message">No recent requests</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
