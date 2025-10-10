require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const morgan = require('morgan');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const path = require('path');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.userId ? { _id: req.session.userId } : null;
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error'),
  };
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/announcements', require('./routes/announcements'));

app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('layout', {
    title: 'Trang chủ',
    body: '<div class="pt-3"><h1>Chào mừng đến với hệ thống quản lý THPT</h1><p>Vui lòng chọn chức năng từ menu bên trái.</p></div>',
  });
});

app.get('/login', (req, res) => {
  res.render('layout', {
    title: 'Đăng nhập',
    body: require('ejs').render(
      require('fs').readFileSync('./views/auth/login.ejs', 'utf-8'),
      { error: req.flash('error') }
    ),
    user: null,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
  console.log(`Môi trường: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Lỗi: ${err.message}`);
  process.exit(1);
});
