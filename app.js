const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const bodyParser = require('body-parser');

// ==========================
// CẤU HÌNH DATABASE
// ==========================
global.db = require('./config/database');

// ==========================
// KHAI BÁO CÁC ROUTES
// ==========================
const DangNhapRoutes = require('./routes/DangNhapRouters');
const ThoiKhoaBieuRoutes = require('./routes/ThoiKhoaBieuRoutes');
const DuyetYeuCauSuaDiemRoutes = require('./routes/DuyetYeuCauSuaDiemRoutes'); // ✅ thêm mới

const app = express();

// ==========================
// CẤU HÌNH VIEW ENGINE
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
app.use('/api/thoikhoabieu', ThoiKhoaBieuRoutes);

// ✅ ROUTE DUYỆT YÊU CẦU SỬA ĐIỂM
app.use('/api/duyetyeucausuadiem', DuyetYeuCauSuaDiemRoutes);

// ==========================
// TRANG CHÍNH
// ==========================
app.get('/', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.render('index', { page: 'dangnhap', user: null });
  }
  res.render('index', { page: 'home', user });
});

// ==========================
// 404 PAGE
// ==========================
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Không tìm thấy trang.' });
});

// ==========================
// KHỞI ĐỘNG SERVER
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server chạy tại: http://localhost:${PORT}`)
);
