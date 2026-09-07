const express = require('express');
const router = express.Router();
const {
  updateProfile,
  changePassword,
  getUsersByRole,
  requestPasswordChangeOtp,
  verifyAndChangePassword
} = require('../controllers/userController');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkCreateUsers
} = require('../controllers/userManagementController');
const { protect, authorize } = require('../middleware/auth');

// User Profile Routes (MUST come before /:id routes)
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/request-password-change-otp', protect, requestPasswordChangeOtp);
router.post('/verify-and-change-password', protect, verifyAndChangePassword);
router.get('/by-role/:role', protect, getUsersByRole);

// User Management Routes (CEO only)
router.get('/all', protect, authorize('CEO'), getAllUsers);
router.post('/', protect, authorize('CEO'), createUser);
router.put('/:id', protect, authorize('CEO'), updateUser);
router.delete('/:id', protect, authorize('CEO'), deleteUser);
router.post('/bulk', protect, authorize('CEO'), bulkCreateUsers);

module.exports = router;
