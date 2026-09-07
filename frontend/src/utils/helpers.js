// Format date
export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date only
export const formatDateOnly = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
  const statusMap = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    reverted: 'badge-reverted',
    query_raised: 'badge-query'
  };
  return statusMap[status] || 'badge-pending';
};

// Get workflow status label
export const getWorkflowStatusLabel = (status) => {
  const statusMap = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    forwarded: 'Forwarded',
    query_sent: 'Query Sent'
  };
  return statusMap[status] || status;
};

// Calculate time remaining for revert
export const getRevertTimeRemaining = (revertDeadline) => {
  if (!revertDeadline) return null;
  
  const now = new Date();
  const deadline = new Date(revertDeadline);
  const diff = deadline - now;
  
  if (diff <= 0) return 'Expired';
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  return `${minutes}m ${seconds}s`;
};

// Check if user can perform action
export const canPerformAction = (userRole, action) => {
  const permissions = {
    Employee: {
      canCreateRequest: true,
      canRevertRequest: true,
      canForward: false,
      canReject: false,
      canApprove: false,
      canSendQuery: false
    },
    Manager: {
      canForward: true,
      canReject: true,
      canSendQuery: true
    },
    HR: {
      canForward: true,
      canReject: true,
      canSendQuery: true
    },
    'IT & Purchase': {
      canForward: true,
      canReject: true,
      canSendQuery: true
    },
    Finance: {
      canForward: true,
      canReject: true,
      canSendQuery: true
    },
    Accountant: {
      canForward: true,
      canReject: true,
      canSendQuery: true
    },
    'General Manager': {
      canForward: true,
      canReject: true,
      canSendQuery: true
    },
    CEO: {
      canApprove: true,
      canReject: true,
      canSendQuery: true
    }
  };

  return permissions[userRole]?.[action] || false;
};

// Get query recipients for role
export const getQueryRecipients = (senderRole) => {
  const recipients = {
    Employee: [],
    Manager: ['Employee'],
    HR: ['Manager', 'Employee'],
    'IT & Purchase': ['Manager', 'Employee'],
    Finance: ['Manager', 'Employee'],
    Accountant: ['Finance', 'Manager', 'Employee'],
    'General Manager': ['Employee', 'Manager', 'HR', 'IT & Purchase', 'Finance', 'Accountant'],
    CEO: ['Employee', 'Manager', 'HR', 'IT & Purchase', 'Finance', 'Accountant', 'General Manager']
  };

  return recipients[senderRole] || [];
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Get workflow icon
export const getWorkflowIcon = (status) => {
  const icons = {
    pending: '⏳',
    approved: '✓',
    rejected: '✗',
    forwarded: '→',
    query_sent: '?'
  };
  return icons[status] || '○';
};

// Check if role has flagged requests section
export const hasFlaggedRequestsAccess = (role) => {
  const rolesWithAccess = [
    'Manager',
    'HR',
    'IT & Purchase',
    'Finance',
    'Accountant',
    'General Manager',
    'CEO'
  ];
  return rolesWithAccess.includes(role);
};

export default {
  formatDate,
  formatDateOnly,
  getStatusBadgeClass,
  getWorkflowStatusLabel,
  getRevertTimeRemaining,
  canPerformAction,
  getQueryRecipients,
  validateEmail,
  truncate,
  getWorkflowIcon,
  hasFlaggedRequestsAccess
};
