const express = require('express');
const router = express.Router();
const DangNhapController = require('../controllers/DangNhapController');

// Trang đăng nhập
router.get('/DangNhap', DangNhapController.renderLogin);

// Xử lý đăng nhập
router.post('/DangNhap', DangNhapController.login);

// Đăng xuất
router.get('/DangXuat', DangNhapController.logout);

module.exports = router;
