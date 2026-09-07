const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Query message is required']
  },
  managerComments: {
    type: String,
    default: ''
  },
  response: {
    type: String
  },
  responseDocuments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'responded'],
    default: 'pending'
  },
  respondedAt: Date
}, {
  timestamps: true
});

// Index for efficient querying
querySchema.index({ request: 1, createdAt: -1 });
querySchema.index({ sentTo: 1, status: 1 });

module.exports = mongoose.model('Query', querySchema);
