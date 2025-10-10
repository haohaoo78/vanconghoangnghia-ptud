const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề thông báo'],
  },
  content: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung thông báo'],
  },
  type: {
    type: String,
    enum: ['Thông báo chung', 'Học tập', 'Hoạt động', 'Khẩn cấp', 'Khác'],
    default: 'Thông báo chung',
  },
  priority: {
    type: String,
    enum: ['Thấp', 'Trung bình', 'Cao'],
    default: 'Trung bình',
  },
  targetAudience: {
    type: String,
    enum: ['Tất cả', 'Giáo viên', 'Học sinh', 'Phụ huynh', 'Cụ thể'],
    default: 'Tất cả',
  },
  targetSchools: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
  }],
  targetClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  }],
  targetStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  publishDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: Date,
  isPublished: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Announcement', announcementSchema);
