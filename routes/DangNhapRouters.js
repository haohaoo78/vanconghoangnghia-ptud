const express = require('express');
const router = express.Router();
const DangNhapController = require('../controllers/DangNhapController');

router.get('/DangNhap', DangNhapController.renderLogin);
router.post('/DangNhap', DangNhapController.login);
router.get('/DangXuat', DangNhapController.logout);

module.exports = router;
