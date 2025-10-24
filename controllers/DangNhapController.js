const TaiKhoan = require('../models/DangNhapModel');

class DangNhapController {
  // Hiển thị trang login
  renderLogin(req, res) {
    console.log("🟢 renderLogin called");
    res.render('pages/dangnhap', { title: 'Đăng nhập hệ thống', user: null });
  }

  // Xử lý đăng nhập
  async login(req, res) {
  try {
    const { username, password } = req.body;
    console.log("📥 Nhận yêu cầu đăng nhập:", username, password);

    if (!username || !password) {
      console.log("⚠️ Thiếu thông tin");
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }

    console.log("⏳ Chuẩn bị truy vấn DB...");
    const user = await TaiKhoan.login(username, password);
    console.log("✅ Truy vấn xong, kết quả:", user);

    if (!user) {
      return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
    }

    req.session.user = {
      username: user.TenTaiKhoan,
      role: user.LoaiTaiKhoan
    };

    console.log("✅ Đăng nhập thành công, trả phản hồi JSON");
    return res.json({ success: true, message: "Đăng nhập thành công" });

  } catch (err) {
    console.error("💥 Lỗi xử lý đăng nhập:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

  // Đăng xuất
  logout(req, res) {
    req.session.destroy(err => {
      if (err) {
        console.error("⚠️ Lỗi khi hủy session:", err);
        return res.status(500).json({ success: false, message: "Không thể đăng xuất" });
      }
      console.log("🚪 Đã đăng xuất");
      res.redirect('/DangNhap');
    });
  }
}

module.exports = new DangNhapController();
