const db = require('../config/database');

class DuyetYeuCauSuaDiemModel {
  // Danh sách khối
  async getKhoiList() {
    const [rows] = await db.execute('SELECT DISTINCT Khoi AS MaKhoi FROM MonHoc ORDER BY Khoi');
    return rows;
  }

  // Danh sách lớp theo khối
  async getClassesByKhoi(MaKhoi) {
    const [rows] = await db.execute(
      'SELECT MaLop, TenLop FROM Lop WHERE Khoi = ? ORDER BY TenLop',
      [MaKhoi]
    );
    return rows;
  }

  // Danh sách môn học
  async getSubjects() {
    const [rows] = await db.execute('SELECT TenMonHoc FROM MonHoc ORDER BY TenMonHoc');
    return rows;
  }

  // Lấy danh sách yêu cầu sửa điểm
  async getRequests(MaLop, TenMonHoc) {
    const [rows] = await db.execute(
      `SELECT yc.MaYeuCau, hs.HoTen, yc.TenMonHoc, yc.LoaiDiem, yc.DiemCu, yc.DiemMoi, yc.LyDo, yc.TrangThai
       FROM YeuCauSuaDiem yc
       JOIN HocSinh hs ON yc.MaHocSinh = hs.MaHocSinh
       WHERE hs.MaLop = ? AND yc.TenMonHoc = ?
       ORDER BY yc.MaYeuCau DESC`,
      [MaLop, TenMonHoc]
    );
    return rows;
  }

  // Cập nhật trạng thái
  async updateStatus(MaYeuCau, TrangThai) {
    await db.execute('UPDATE YeuCauSuaDiem SET TrangThai = ? WHERE MaYeuCau = ?', [TrangThai, MaYeuCau]);
  }
}

module.exports = new DuyetYeuCauSuaDiemModel();
