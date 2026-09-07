import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Request API
export const requestAPI = {
  // Create request
  create: (data) => axios.post(`${API_URL}/requests`, data),

  // Get all requests
  getAll: (params) => axios.get(`${API_URL}/requests`, { params }),

  // Get dashboard data
  getDashboard: () => axios.get(`${API_URL}/requests/dashboard`),

  // Get single request
  getById: (id) => axios.get(`${API_URL}/requests/${id}`),

  // Forward request
  forward: (id, data) => axios.post(`${API_URL}/requests/${id}/forward`, data),

  // Approve request
  approve: (id, data) => axios.post(`${API_URL}/requests/${id}/approve`, data),

  // Reject request
  reject: (id, data) => axios.post(`${API_URL}/requests/${id}/reject`, data),

  // Revert request
  revert: (id, data) => axios.post(`${API_URL}/requests/${id}/revert`, data),

  // Resubmit request
  resubmit: (id, data) => axios.put(`${API_URL}/requests/${id}/resubmit`, data),

  // Get flagged requests
  getFlagged: (params) => axios.get(`${API_URL}/requests/flagged`, { params })
};

// Query API
export const queryAPI = {
  // Send query
  send: (data) => axios.post(`${API_URL}/queries`, data),

  // Get queries
  getAll: (params) => axios.get(`${API_URL}/queries`, { params }),

  // Get single query
  getById: (id) => axios.get(`${API_URL}/queries/${id}`),

  // Respond to query
  respond: (id, data) => axios.post(`${API_URL}/queries/${id}/respond`, data),

  // Get queries for a request
  getByRequest: (requestId) => axios.get(`${API_URL}/queries/request/${requestId}`),

  // Get workflow-based recipients for a request
  getWorkflowRecipients: (requestId) => axios.get(`${API_URL}/queries/${requestId}/recipients`)
};

// User API
export const userAPI = {
  // Update profile
  updateProfile: (data) => axios.put(`${API_URL}/users/profile`, data),

  // Change password
  changePassword: (data) => axios.put(`${API_URL}/users/change-password`, data),

  // Request password change OTP
  requestPasswordChangeOtp: () => axios.post(`${API_URL}/users/request-password-change-otp`),

  // Verify OTP and change password
  verifyAndChangePassword: (data) => axios.post(`${API_URL}/users/verify-and-change-password`, data),

  // Get users by role
  getByRole: (role) => axios.get(`${API_URL}/users/by-role/${role}`)
};

// Auth API
export const authAPI = {
  // Login
  login: (data) => axios.post(`${API_URL}/auth/login`, data),

  // Register
  register: (data) => axios.post(`${API_URL}/auth/register`, data),

  // Verify Employee ID
  verifyEmployeeId: (data) => axios.post(`${API_URL}/auth/verify-employee-id`, data),

  // Get current user
  getMe: () => axios.get(`${API_URL}/auth/me`),

  // Forgot password
  forgotPassword: (data) => axios.post(`${API_URL}/auth/forgot-password`, data),

  // Reset password
  resetPassword: (token, data) => axios.post(`${API_URL}/auth/reset-password/${token}`, data)
};

export default {
  request: requestAPI,
  query: queryAPI,
  user: userAPI,
  auth: authAPI
};
