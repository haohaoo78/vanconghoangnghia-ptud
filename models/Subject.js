const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    unique: true,
  },
  subjectName: {
    type: String,
    required: [true, 'Vui lòng nhập tên môn học'],
  },
  description: String,
  grades: [{
    type: Number,
    min: 10,
    max: 12,
  }],
  lessonsPerWeek: {
    type: Number,
    default: 1,
  },
  coefficient: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subject', subjectSchema);
