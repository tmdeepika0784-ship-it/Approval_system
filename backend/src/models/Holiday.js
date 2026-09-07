const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient date queries
holidaySchema.index({ date: 1 });

module.exports = mongoose.model('Holiday', holidaySchema);
