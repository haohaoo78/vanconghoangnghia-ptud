const TaiKhoan = require('../models/DangNhapModel');

class AuthController {
  async renderLogin(req, res) {
    res.render('pages/DangNhap', { errorMessage: '' });
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.render('pages/DangNhap', { errorMessage: 'Vui lòng nhập đầy đủ' });
      }

      const user = await TaiKhoan.login(username, password);
      if (!user) {
        return res.render('pages/DangNhap', { errorMessage: 'Tài khoản hoặc mật khẩu sai' });
      }

      // Lưu session
      req.session.user = user;

      // Redirect theo vai trò (ví dụ)
      res.redirect('/index');
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi server');
    }
  }

  logout(req, res) {
    req.session.destroy(err => {
      if (err) console.error(err);
      res.redirect('/DangNhap');
    });
  }
}

module.exports = new AuthController();
