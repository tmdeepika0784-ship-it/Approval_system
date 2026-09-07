const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getDashboard,
  getRequest,
  forwardRequest,
  approveRequest,
  rejectRequest,
  revertRequest,
  resubmitRequest,
  getFlaggedRequests,
  uploadDocument,
  getDocument
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, createRequest);
router.get('/', protect, getAllRequests);
router.get('/dashboard', protect, getDashboard);
router.get('/flagged', protect, getFlaggedRequests);
router.post('/upload-document', protect, upload.single('document'), uploadDocument);
router.get('/document/:filename', getDocument);
router.get('/:id', protect, getRequest);
router.post('/:id/forward', protect, forwardRequest);
router.post('/:id/approve', protect, approveRequest);
router.post('/:id/reject', protect, rejectRequest);
router.post('/:id/revert', protect, revertRequest);
router.put('/:id/resubmit', protect, resubmitRequest);

module.exports = router;
