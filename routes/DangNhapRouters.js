// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const DangNhapController = require('../controllers/DangNhapController');

// Trang login
router.get('/DangNhap', DangNhapController.renderLogin);

// Xử lý đăng nhập
router.post('/DangNhap', DangNhapController.login);

// Logout
router.get('/DangXuat', DangNhapController.logout);

// Ví dụ trang index sau login
router.get('/index', (req, res) => {
  if (!req.session.user) return res.redirect('/DangNhap');

  // Kiểm tra role để hiển thị dashboard phù hợp
  const role = req.session.user.LoaiTaiKhoan;
  res.render('Index', { user: req.session.user, role });
});

module.exports = router;
