const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const bodyParser = require('body-parser');

// DB global
global.db = require('./config/database');


// Routes
const DangNhapRoutes = require('./routes/DangNhapRouters');

const app = express();

// ==========================
// VIEW ENGINE
// ==========================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==========================
// MIDDLEWARE
// ==========================
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false,
}));

// ==========================
// ROUTES
// ==========================
app.use('/', DangNhapRoutes); // /DangNhap, /DangXuat

// API khác (nếu có)
app.use('/api/thoikhoabieu', require('./routes/ThoiKhoaBieuRoutes'));
app.use('/api/duyetsuadiem', require('./routes/DuyetYeuCauSuaDiemRoutes'));

// ==========================
// MAIN PAGE
// ==========================
app.get('/', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.render('index', { page: 'dangnhap', user: null });
  }
  res.render('index', { page: 'home', user });
});

// ==========================
// 404
// ==========================
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Không tìm thấy trang.' });
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server chạy tại: http://localhost:${PORT}`));
