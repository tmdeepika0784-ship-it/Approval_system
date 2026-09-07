// Define role hierarchies and permissions
const ROLES = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  HR: 'HR',
  IT_PURCHASE: 'IT & Purchase',
  FINANCE: 'Finance',
  ACCOUNTANT: 'Accountant',
  GENERAL_MANAGER: 'General Manager',
  CEO: 'CEO'
};

// Define workflow paths based on request type
const WORKFLOW_PATHS = {
  'HR Request': ['Manager', 'HR', 'General Manager', 'CEO'],
  'IT & Purchase Request': ['Manager', 'IT & Purchase', 'General Manager', 'CEO'],
  'Finance Request': ['Manager', 'Finance', 'Accountant', 'General Manager', 'CEO']
};

// Define permissions for each role
const PERMISSIONS = {
  [ROLES.EMPLOYEE]: {
    canCreateRequest: true,
    canViewRequest: true,
    canRevertRequest: true,
    canForward: false,
    canReject: false,
    canApprove: false,
    canSendQuery: false,
    canRespondToQuery: true
  },
  [ROLES.MANAGER]: {
    canCreateRequest: false,
    canViewRequest: true,
    canRevertRequest: false,
    canForward: true,
    canReject: true,
    canApprove: false,
    canSendQuery: true,
    canRespondToQuery: false
  },
  [ROLES.HR]: {
    canCreateRequest: false,
    canViewRequest: true,
    canRevertRequest: false,
    canForward: true,
    canReject: true,
    canApprove: false,
    canSendQuery: true,
    canRespondToQuery: false
  },
  [ROLES.IT_PURCHASE]: {
    canCreateRequest: false,
    canViewRequest: true,
    canRevertRequest: false,
    canForward: true,
    canReject: true,
    canApprove: false,
    canSendQuery: true,
    canRespondToQuery: false
  },
  [ROLES.FINANCE]: {
    canCreateRequest: false,
    canViewRequest: true,
    canRevertRequest: false,
    canForward: true,
    canReject: true,
    canApprove: false,
    canSendQuery: true,
    canRespondToQuery: false
  },
  [ROLES.ACCOUNTANT]: {
    canCreateRequest: false,
    canViewRequest: true,
    canRevertRequest: false,
    canForward: true,
    canReject: true,
    canApprove: false,
    canSendQuery: true,
    canRespondToQuery: false
  },
  [ROLES.GENERAL_MANAGER]: {
    canCreateRequest: false,
    canViewRequest: true,
    canRevertRequest: false,
    canForward: true,
    canReject: true,
    canApprove: false,
    canSendQuery: true,
    canRespondToQuery: false
  },
  [ROLES.CEO]: {
    canCreateRequest: false,
    canViewRequest: true,
    canRevertRequest: false,
    canForward: false,
    canReject: true,
    canApprove: true,
    canSendQuery: true,
    canRespondToQuery: false
  }
};

// Define query recipient permissions
const QUERY_RECIPIENTS = {
  [ROLES.EMPLOYEE]: [],
  [ROLES.MANAGER]: [ROLES.EMPLOYEE],
  [ROLES.HR]: [ROLES.MANAGER, ROLES.EMPLOYEE],
  [ROLES.IT_PURCHASE]: [ROLES.MANAGER, ROLES.EMPLOYEE],
  [ROLES.FINANCE]: [ROLES.MANAGER, ROLES.EMPLOYEE],
  [ROLES.ACCOUNTANT]: [ROLES.FINANCE, ROLES.MANAGER, ROLES.EMPLOYEE],
  [ROLES.GENERAL_MANAGER]: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR, ROLES.IT_PURCHASE, ROLES.FINANCE, ROLES.ACCOUNTANT],
  [ROLES.CEO]: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR, ROLES.IT_PURCHASE, ROLES.FINANCE, ROLES.ACCOUNTANT, ROLES.GENERAL_MANAGER]
};

// Roles that have flagged requests section
const ROLES_WITH_FLAGGED = [
  ROLES.MANAGER,
  ROLES.HR,
  ROLES.IT_PURCHASE,
  ROLES.FINANCE,
  ROLES.ACCOUNTANT,
  ROLES.GENERAL_MANAGER,
  ROLES.CEO
];

module.exports = {
  ROLES,
  WORKFLOW_PATHS,
  PERMISSIONS,
  QUERY_RECIPIENTS,
  ROLES_WITH_FLAGGED
};
