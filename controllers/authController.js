// controllers/UserController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const TaiKhoan = require('../models/').TaiKhoan;

const generateToken = (username) => {
  return jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  });
};

class UserController {
  // ====================
  // Đăng ký tài khoản
  // ====================
  async register(req, res) {
    try {
      const { TenTaiKhoan, MatKhau, LoaiTaiKhoan } = req.body;

      // Kiểm tra tồn tại
      const existing = await TaiKhoan.getOne('TenTaiKhoan', TenTaiKhoan);
      if (existing) return res.status(400).json({ success: false, message: 'Tên tài khoản đã tồn tại' });

      // Hash password
      const hashedPassword = await bcrypt.hash(MatKhau, 10);

      // Thêm mới
      await TaiKhoan.insert({ TenTaiKhoan, MatKhau: hashedPassword, LoaiTaiKhoan });

      const token = generateToken(TenTaiKhoan);
      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công',
        data: { TenTaiKhoan, LoaiTaiKhoan, token },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ====================
  // Đăng nhập
  // ====================
  async login(req, res) {
    try {
      const { TenTaiKhoan, MatKhau } = req.body;
      if (!TenTaiKhoan || !MatKhau) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tài khoản và mật khẩu' });
      }

      const user = await TaiKhoan.getOne('TenTaiKhoan', TenTaiKhoan);
      if (!user) return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });

      const match = await bcrypt.compare(MatKhau, user.MatKhau);
      if (!match) return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });

      const token = generateToken(TenTaiKhoan);
      req.session.token = token;
      req.session.username = TenTaiKhoan;

      res.json({ success: true, message: 'Đăng nhập thành công', data: { TenTaiKhoan, LoaiTaiKhoan: user.LoaiTaiKhoan, token } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ====================
  // Đăng xuất
  // ====================
  logout(req, res) {
    req.session.destroy();
    res.json({ success: true, message: 'Đăng xuất thành công' });
  }

  // ====================
  // Lấy thông tin người dùng hiện tại
  // ====================
  async getMe(req, res) {
    try {
      if (!req.session || !req.session.username) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
      }
      const user = await TaiKhoan.getOne('TenTaiKhoan', req.session.username);
      if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });

      res.json({ success: true, data: { TenTaiKhoan: user.TenTaiKhoan, LoaiTaiKhoan: user.LoaiTaiKhoan } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ====================
  // Đổi mật khẩu
  // ====================
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!req.session || !req.session.username) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
      }

      const user = await TaiKhoan.getOne('TenTaiKhoan', req.session.username);
      if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });

      const match = await bcrypt.compare(currentPassword, user.MatKhau);
      if (!match) return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await TaiKhoan.update('TenTaiKhoan', req.session.username, { MatKhau: hashedPassword });

      res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();
