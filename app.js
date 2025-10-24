const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Controllers
const ThoiKhoaBieuController = require('./controllers/ThoiKhoaBieuController');
const DuyetYeuCauSuaDiemController = require('./controllers/DuyetYeuCauSuaDiemController');
const DangNhapController = require('./controllers/DangNhapController');

global.db = require('./config/database');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================
// SESSION
// ==========================
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false,
}));

// ==========================
// ROUTES AUTH
// ==========================
app.get('/DangNhap', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('pages/dangnhap', { errorMessage: '' });
});
app.post('/DangNhap', DangNhapController.login);
app.get('/DangXuat', DangNhapController.logout);

// ==========================
// ROUTES API
// ==========================
app.use('/api/thoikhoabieu', require('./routes/ThoiKhoaBieuRoutes'));
app.use('/api/duyetsuadiem', require('./routes/DuyetYeuCauSuaDiemRoutes'));

// ==========================
// MIDDLEWARE KIỂM TRA LOGIN
// ==========================
function ensureAuth(req, res, next) {
  if (!req.session.user) return next(); // nếu chưa login thì vẫn load index nhưng hiện trang login
  next();
}

// ==========================
// TRANG CHÍNH / SPA
// ==========================
app.get('/', ensureAuth, (req, res) => {
  const user = req.session.user;
  if (!user) {
    // chưa login → hiển thị login trong layout index
    return res.render('index', { page: 'dangnhap', user: null });
  }
  // đã login → hiển thị home và sidebar
  res.render('index', { page: 'home', user });
});

app.get('/pages/:page', ensureAuth, (req, res) => {
  const page = req.params.page;
  const user = req.session.user;

  // Nếu chưa login, luôn redirect về login
  if (!user) return res.redirect('/DangNhap');

  // Các page cần load dữ liệu từ controller
  if (page === 'thoikhoabieu') return ThoiKhoaBieuController.renderPage(req, res);
  if (page === 'duyetyeucausuadiem') return DuyetYeuCauSuaDiemController.renderPage(req, res);

  // Page tĩnh khác
  res.render(`pages/${page}`, { page, user });
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại: http://localhost:${PORT}`);
});
