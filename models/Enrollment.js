const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Nam', 'Nữ'],
    required: true,
  },
  address: String,
  phoneNumber: String,
  parentPhone: String,
  examScores: {
    math: Number,
    literature: Number,
    english: Number,
    totalScore: Number,
  },
  priorityType: {
    type: String,
    enum: ['Không', 'Ưu tiên 1', 'Ưu tiên 2', 'Ưu tiên 3'],
    default: 'Không',
  },
  desiredSchools: [{
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    priority: Number,
  }],
  assignedSchool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
  },
  status: {
    type: String,
    enum: ['Đang chờ', 'Đã phân bổ', 'Đã xác nhận', 'Đã hủy'],
    default: 'Đang chờ',
  },
  academicYear: {
    type: String,
    required: true,
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  assignedDate: Date,
  confirmedDate: Date,
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
