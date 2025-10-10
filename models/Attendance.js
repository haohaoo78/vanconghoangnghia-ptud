const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Có mặt', 'Vắng có phép', 'Vắng không phép', 'Đi muộn'],
    default: 'Có mặt',
  },
  reason: String,
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  session: {
    type: String,
    enum: ['Sáng', 'Chiều', 'Cả ngày'],
    default: 'Cả ngày',
  },
  note: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
