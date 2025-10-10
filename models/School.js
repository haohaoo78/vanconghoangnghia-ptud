const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  schoolCode: {
    type: String,
    required: true,
    unique: true,
  },
  schoolName: {
    type: String,
    required: [true, 'Vui lòng nhập tên trường'],
  },
  address: {
    type: String,
    required: true,
  },
  district: String,
  city: String,
  phoneNumber: String,
  email: String,
  principal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  enrollmentQuota: {
    type: Number,
    default: 0,
  },
  currentStudents: {
    type: Number,
    default: 0,
  },
  foundedYear: Number,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('School', schoolSchema);
