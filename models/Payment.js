const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    enum: [1, 2],
  },
  month: Number,
  paymentType: {
    type: String,
    enum: ['Học phí', 'Đồng phục', 'Sách vở', 'Bảo hiểm', 'Khác'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paid: {
    type: Number,
    default: 0,
  },
  debt: {
    type: Number,
    default: 0,
  },
  dueDate: Date,
  paymentDate: Date,
  status: {
    type: String,
    enum: ['Chưa thanh toán', 'Đã thanh toán một phần', 'Đã thanh toán đầy đủ', 'Quá hạn'],
    default: 'Chưa thanh toán',
  },
  paymentMethod: {
    type: String,
    enum: ['Tiền mặt', 'Chuyển khoản', 'Thẻ'],
  },
  note: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

paymentSchema.pre('save', function(next) {
  this.debt = this.amount - this.paid;

  if (this.debt === 0) {
    this.status = 'Đã thanh toán đầy đủ';
  } else if (this.paid > 0) {
    this.status = 'Đã thanh toán một phần';
  } else if (this.dueDate && this.dueDate < new Date()) {
    this.status = 'Quá hạn';
  } else {
    this.status = 'Chưa thanh toán';
  }

  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
