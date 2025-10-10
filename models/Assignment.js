const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề bài tập'],
  },
  description: String,
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  attachments: [{
    filename: String,
    url: String,
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    submittedAt: Date,
    content: String,
    attachments: [{
      filename: String,
      url: String,
    }],
    score: Number,
    feedback: String,
    status: {
      type: String,
      enum: ['Đã nộp', 'Nộp muộn', 'Chưa nộp'],
      default: 'Chưa nộp',
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Assignment', assignmentSchema);
