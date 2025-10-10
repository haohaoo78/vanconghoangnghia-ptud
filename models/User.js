const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Vui lòng nhập tên đăng nhập'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: 6,
    select: false,
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Email không hợp lệ',
    ],
  },
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
  },
  role: {
    type: String,
    enum: ['admin', 'so_gd', 'hieu_truong', 'gv_chu_nhiem', 'gv_bo_mon', 'hoc_sinh', 'phu_huynh'],
    default: 'hoc_sinh',
  },
  phoneNumber: String,
  address: String,
  avatar: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
  },
  relatedProfile: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'profileType',
  },
  profileType: {
    type: String,
    enum: ['Student', 'Teacher'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
