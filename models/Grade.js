const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
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
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  semester: {
    type: Number,
    enum: [1, 2],
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  scores: {
    regularScores: [{
      score: Number,
      date: Date,
      note: String,
    }],
    midtermScore: Number,
    finalScore: Number,
    averageScore: Number,
  },
  conduct: {
    type: String,
    enum: ['Tốt', 'Khá', 'Trung bình', 'Yếu'],
  },
  academicPerformance: {
    type: String,
    enum: ['Giỏi', 'Khá', 'Trung bình', 'Yếu', 'Kém'],
  },
  status: {
    type: String,
    enum: ['Đang nhập', 'Đã duyệt', 'Đã khóa'],
    default: 'Đang nhập',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

gradeSchema.pre('save', function(next) {
  if (this.scores.regularScores.length > 0 || this.scores.midtermScore || this.scores.finalScore) {
    const regularSum = this.scores.regularScores.reduce((sum, s) => sum + s.score, 0);
    const regularAvg = regularSum / this.scores.regularScores.length || 0;
    const midterm = this.scores.midtermScore || 0;
    const final = this.scores.finalScore || 0;

    this.scores.averageScore = (regularAvg + midterm * 2 + final * 3) / 6;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
