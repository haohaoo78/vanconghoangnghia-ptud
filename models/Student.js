const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentCode: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên học sinh'],
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
  placeOfBirth: String,
  ethnicity: {
    type: String,
    default: 'Kinh',
  },
  religion: String,
  idCard: String,
  phoneNumber: String,
  email: String,
  address: String,
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  currentClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  academicYear: String,
  enrollmentScore: Number,
  priorityType: {
    type: String,
    enum: ['Không', 'Ưu tiên 1', 'Ưu tiên 2', 'Ưu tiên 3'],
    default: 'Không',
  },
  parentInfo: {
    fatherName: String,
    fatherPhone: String,
    fatherOccupation: String,
    motherName: String,
    motherPhone: String,
    motherOccupation: String,
    guardianName: String,
    guardianPhone: String,
    guardianRelation: String,
  },
  medicalInfo: {
    bloodType: String,
    allergies: [String],
    chronicDiseases: [String],
    notes: String,
  },
  status: {
    type: String,
    enum: ['Đang học', 'Bảo lưu', 'Thôi học', 'Chuyển trường'],
    default: 'Đang học',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Student', studentSchema);
