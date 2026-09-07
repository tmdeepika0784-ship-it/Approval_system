const express = require('express');
const router = express.Router();
const {
  sendQuery,
  getQueries,
  getQuery,
  respondToQuery,
  getQueriesByRequest,
  getWorkflowRecipients
} = require('../controllers/queryController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, sendQuery);
router.get('/', protect, getQueries);
router.get('/:requestId/recipients', protect, getWorkflowRecipients);
router.get('/request/:requestId', protect, getQueriesByRequest);
router.get('/:id', protect, getQuery);
router.post('/:id/respond', protect, upload.array('documents', 10), respondToQuery);

module.exports = router;
