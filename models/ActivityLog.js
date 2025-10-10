const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  resourceType: String,
  resourceId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
