const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherCode: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên giáo viên'],
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
  idCard: String,
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: String,
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  homeRoomClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  teachingClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  }],
  qualifications: [{
    degree: String,
    major: String,
    university: String,
    year: Number,
  }],
  teachingLevel: {
    type: String,
    enum: ['Giáo viên', 'Giáo viên chính', 'Giáo viên cao cấp'],
  },
  startDate: Date,
  status: {
    type: String,
    enum: ['Đang công tác', 'Nghỉ phép', 'Đã nghỉ việc'],
    default: 'Đang công tác',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Teacher', teacherSchema);
