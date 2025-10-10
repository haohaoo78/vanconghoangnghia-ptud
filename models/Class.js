const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: [true, 'Vui lòng nhập tên lớp'],
  },
  grade: {
    type: Number,
    required: true,
    min: 10,
    max: 12,
  },
  academicYear: {
    type: String,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  homeRoomTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  maxStudents: {
    type: Number,
    default: 45,
  },
  currentStudents: {
    type: Number,
    default: 0,
  },
  room: String,
  status: {
    type: String,
    enum: ['Đang hoạt động', 'Đã kết thúc'],
    default: 'Đang hoạt động',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Class', classSchema);
