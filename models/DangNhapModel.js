const db = require('../config/database');
const bcrypt = require('bcrypt');

class TaiKhoan {
  static db = db;

  // Hàm login
  static async login(username, password) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM TaiKhoan WHERE TenTaiKhoan = ?';
      this.db.query(sql, [username], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null); // Không tìm thấy tài khoản

        const user = results[0];
        bcrypt.compare(password, user.MatKhau, (err, isMatch) => {
          if (err) return reject(err);
          if (!isMatch) return resolve(null); // Sai mật khẩu

          // Loại bỏ mật khẩu trước khi trả về
          const { MatKhau, ...userData } = user;
          resolve(userData);
        });
      });
    });
  }
}

module.exports = TaiKhoan;
