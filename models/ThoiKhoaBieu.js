const db = require('../config/database');

class ThoiKhoaBieu {
  static db = db;

  // === LẤY DANH SÁCH KHỐI ===
  static async getKhoiList() {
    const [rows] = await db.execute('SELECT MaKhoi, TenKhoi FROM Khoi ORDER BY MaKhoi');
    return rows;
  }

  // === LẤY DANH SÁCH LỚP THEO KHỐI ===
  static async getClassesByKhoi(MaKhoi) {
    const [rows] = await db.execute('SELECT MaLop, TenLop FROM Lop WHERE Khoi=? ORDER BY TenLop', [MaKhoi]);
    return rows;
  }

  // === LẤY DANH SÁCH NĂM HỌC ===
  static async getNamHocList() {
    const [rows] = await db.execute('SELECT DISTINCT NamHoc FROM HocKy ORDER BY NamHoc');
    return rows.map(r => r.NamHoc);
  }

  // === LẤY HỌC KỲ THEO NĂM HỌC ===
  static async getKyHocList(NamHoc) {
    const [rows] = await db.execute('SELECT KyHoc, NgayBatDau FROM HocKy WHERE NamHoc=? ORDER BY KyHoc', [NamHoc]);
    return rows;
  }

  // === LẤY MÔN HỌC THEO LỚP ===
  static async getSubjectsByClass(MaLop) {
    const [lopRows] = await db.execute('SELECT Khoi FROM Lop WHERE MaLop=?', [MaLop]);
    const Khoi = lopRows[0]?.Khoi;
    if (!Khoi) return [];
    const [rows] = await db.execute('SELECT TenMonHoc FROM MonHoc WHERE Khoi=? ORDER BY TenMonHoc', [Khoi]);
    return rows.map(r => r.TenMonHoc);
  }

  // === LẤY GIÁO VIÊN DẠY MÔN CHO LỚP ===
  static async getTeacher(MaLop, TenMonHoc) {
    const [rows] = await db.execute(`
      SELECT g.MaGiaoVien, g.TenGiaoVien
      FROM GVBoMon gbm
      JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
      WHERE gbm.MaLop=? AND g.TenMonHoc=?
      LIMIT 1
    `, [MaLop, TenMonHoc]);
    return rows[0] || { TenGiaoVien: '' };
  }

  // === LẤY DANH SÁCH GIÁO VIÊN DẠY MÔN THEO LỚP ===
  static async getClassSubjectTeacher() {
    const [rows] = await db.execute(`
      SELECT g.MaGiaoVien, g.TenGiaoVien, g.TenMonHoc, gbm.MaLop
      FROM GVBoMon gbm
      JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
    `);
    const result = {};
    rows.forEach(r => {
      if (!result[r.MaLop]) result[r.MaLop] = {};
      result[r.MaLop][r.TenMonHoc] = r.TenGiaoVien;
    });
    return result;
  }

  // === LẤY LƯỚI TKB ===
  static async getGrid(MaLop, LoaiTKB, NamHoc, KyHoc) {
    const [rows] = await db.execute(`
      SELECT t.Thu, t.TietHoc, t.TenMonHoc, g.TenGiaoVien
      FROM ThoiKhoaBieu t
      JOIN GiaoVien g ON t.MaGiaoVien = g.MaGiaoVien
      WHERE t.MaLop=? AND t.LoaiTKB=? AND t.NamHoc=? AND t.KyHoc=?
      ORDER BY Thu, TietHoc
    `, [MaLop, LoaiTKB, NamHoc, KyHoc]);

    const grid = {};
    rows.forEach(r => {
      if (!grid[r.Thu]) grid[r.Thu] = {};
      grid[r.Thu][r.TietHoc] = { subject: r.TenMonHoc, teacher: r.TenGiaoVien };
    });
    return grid;
  }

  static async updateMultiple(cells) {
    for (const cell of cells) {
      const [gvRows] = await db.execute(`
        SELECT g.MaGiaoVien 
        FROM GVBoMon gbm 
        JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
        WHERE gbm.MaLop = ? AND g.TenMonHoc = ?
      `, [cell.MaLop, cell.TenMonHoc]);
      const MaGiaoVien = gvRows[0]?.MaGiaoVien || null;
      if (!MaGiaoVien) continue;

      await db.execute(`
        DELETE FROM ThoiKhoaBieu 
        WHERE MaLop=? AND LoaiTKB=? AND NamHoc=? AND KyHoc=? AND Thu=? AND TietHoc=?
      `, [cell.MaLop, cell.LoaiTKB, cell.NamHoc, cell.KyHoc, cell.Thu, cell.TietHoc]);

      await db.execute(`
        INSERT INTO ThoiKhoaBieu (MaLop, LoaiTKB, NamHoc, KyHoc, Thu, TietHoc, TenMonHoc, MaGiaoVien)
        VALUES (?,?,?,?,?,?,?,?)
      `, [cell.MaLop, cell.LoaiTKB, cell.NamHoc, cell.KyHoc, cell.Thu, cell.TietHoc, cell.TenMonHoc, MaGiaoVien]);
    }
  }

  static async resetWeek(MaLop, NamHoc, KyHoc, Tuan) {
    await db.execute('DELETE FROM ThoiKhoaBieu WHERE MaLop=? AND LoaiTKB=? AND NamHoc=? AND KyHoc=?',
      [MaLop, Tuan, NamHoc, KyHoc]);
  }
}

module.exports = ThoiKhoaBieu;
