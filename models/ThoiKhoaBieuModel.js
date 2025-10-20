const db = require('../config/database');

class ThoiKhoaBieu {
  static db = db;

  // ====================
  // Danh sách khối, lớp, năm học, kỳ học
  // ====================
  static async getKhoiList() {
    const [rows] = await db.execute('SELECT MaKhoi, TenKhoi FROM Khoi ORDER BY MaKhoi');
    return rows;
  }

  static async getClassesByKhoi(MaKhoi) {
    const [rows] = await db.execute(
      'SELECT MaLop, TenLop FROM Lop WHERE Khoi=? ORDER BY TenLop',
      [MaKhoi]
    );
    return rows;
  }

  static async getNamHocList() {
    const [rows] = await db.execute('SELECT DISTINCT NamHoc FROM HocKy ORDER BY NamHoc');
    return rows.map(r => r.NamHoc);
  }

  static async getKyHocList(NamHoc) {
    const [rows] = await db.execute(
      'SELECT KyHoc, NgayBatDau FROM HocKy WHERE NamHoc=? ORDER BY KyHoc',
      [NamHoc]
    );
    return rows;
  }

  // ====================
  // Giáo viên & môn
  // ====================
  static async getTeacher(MaLop, TenMonHoc) {
    const [rows] = await db.execute(`
      SELECT g.MaGiaoVien, g.TenGiaoVien
      FROM GVBoMon gbm
      JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
      WHERE gbm.MaLop=? AND g.TenMonHoc=? LIMIT 1
    `, [MaLop, TenMonHoc]);
    return rows[0] || { TenGiaoVien: '' };
  }

  static async getSubjectsWithTeacherByClass(MaLop, NamHoc, KyHoc) {
    if (!MaLop || !NamHoc || !KyHoc) return [];
    const [rows] = await db.execute(`
      SELECT DISTINCT m.TenMonHoc, g.TenGiaoVien
      FROM GVBoMon gbm
      JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
      JOIN MonHoc m ON m.TenMonHoc = g.TenMonHoc
      WHERE gbm.MaLop=? AND gbm.NamHoc=? AND gbm.HocKy=?
      ORDER BY m.TenMonHoc
    `, [MaLop, NamHoc, KyHoc]);
    return rows;
  }

  // ====================
  // Grid TKB
  // ====================
  static async getGrid(MaLop, LoaiTKB, NamHoc, KyHoc) {
    let [rows] = await db.execute(`
      SELECT t.Thu, t.TietHoc, t.TenMonHoc, g.TenGiaoVien
      FROM ThoiKhoaBieu t
      JOIN GiaoVien g ON t.MaGiaoVien = g.MaGiaoVien
      WHERE t.MaLop=? AND t.NamHoc=? AND t.KyHoc=? AND t.LoaiTKB=?
      ORDER BY Thu, TietHoc
    `, [MaLop, NamHoc, KyHoc, LoaiTKB]);

    if (rows.length === 0 && LoaiTKB !== 'Chuan') {
      [rows] = await db.execute(`
        SELECT t.Thu, t.TietHoc, t.TenMonHoc, g.TenGiaoVien
        FROM ThoiKhoaBieu t
        JOIN GiaoVien g ON t.MaGiaoVien = g.MaGiaoVien
        WHERE t.MaLop=? AND t.NamHoc=? AND t.KyHoc=? AND t.LoaiTKB='Chuan'
        ORDER BY Thu, TietHoc
      `, [MaLop, NamHoc, KyHoc]);
    }

    const grid = {};
    rows.forEach(r => {
      if (!grid[r.Thu]) grid[r.Thu] = {};
      grid[r.Thu][r.TietHoc] = { subject: r.TenMonHoc, teacher: r.TenGiaoVien };
    });
    return grid;
  }

  // ====================
  // Thao tác cell
  // ====================
  static async deleteCell(MaLop, NamHoc, KyHoc, LoaiTKB, Thu, TietHoc) {
    const [result] = await db.execute(`
      DELETE FROM ThoiKhoaBieu
      WHERE MaLop=? AND NamHoc=? AND KyHoc=? AND LoaiTKB=? AND Thu=? AND TietHoc=?
    `, [MaLop, NamHoc, KyHoc, LoaiTKB, Thu, TietHoc]);
    return result;
  }

  static async updateMultiple(cells, startDate) {
    const baseDate = new Date(startDate);
    if (isNaN(baseDate.getTime())) throw new Error('Ngày bắt đầu học kỳ không hợp lệ');

    // Tìm Thứ 2 đầu tiên
    const firstMonday = new Date(baseDate);
    const day = firstMonday.getDay(); // 0=CN, 1=T2
    const offset = day === 1 ? 0 : day === 0 ? 1 : 8 - day;
    firstMonday.setDate(firstMonday.getDate() + offset);

    const validCells = cells.filter(c => c.TenMonHoc && c.TenMonHoc.trim() !== '');
    for (const cell of validCells) {
      const { MaLop, LoaiTKB, NamHoc, KyHoc, Thu, TietHoc, TenMonHoc } = cell;
      const weekNumber = LoaiTKB.startsWith('Tuan') ? parseInt(LoaiTKB.replace('Tuan', '')) : 1;

      const thuOffset = Thu === 'CN' ? 6 : parseInt(Thu) - 2;
      const ngayObj = new Date(firstMonday);
      ngayObj.setDate(firstMonday.getDate() + (weekNumber - 1) * 7 + thuOffset);

      const Ngay = new Date(ngayObj.getTime() - ngayObj.getTimezoneOffset() * 60000)
        .toISOString().split('T')[0];

      const [gvRows] = await db.execute(`
        SELECT g.MaGiaoVien
        FROM GVBoMon gbm
        JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
        WHERE gbm.MaLop=? AND g.TenMonHoc=? LIMIT 1
      `, [MaLop, TenMonHoc]);
      const MaGiaoVien = gvRows[0]?.MaGiaoVien;
      if (!MaGiaoVien) continue;

      await db.execute(`
        DELETE FROM ThoiKhoaBieu
        WHERE MaLop=? AND LoaiTKB=? AND Thu=? AND TietHoc=? AND KyHoc=? AND NamHoc=?
      `, [MaLop, LoaiTKB, Thu, TietHoc, KyHoc, NamHoc]);

      await db.execute(`
        INSERT INTO ThoiKhoaBieu
          (LoaiTKB, MaLop, TenMonHoc, TietHoc, KyHoc, Thu, Ngay, MaGiaoVien, NamHoc)
        VALUES (?,?,?,?,?,?,?,?,?)
      `, [LoaiTKB, MaLop, TenMonHoc, TietHoc, KyHoc, Thu, Ngay, MaGiaoVien, NamHoc]);
    }
  }

  static async resetWeek(MaLop, NamHoc, KyHoc, LoaiTKB) {
    if (LoaiTKB === 'Chuan') return;
    await db.execute(`
      DELETE FROM ThoiKhoaBieu WHERE MaLop=? AND NamHoc=? AND KyHoc=? AND LoaiTKB=?
    `, [MaLop, NamHoc, KyHoc, LoaiTKB]);
  }

  // ====================
  // Kiểm tra số tiết
  // ====================
static async countSubjectWeek(MaLop, NamHoc, KyHoc, LoaiTKB, TenMonHoc, weekStartDate) {
  if (!weekStartDate) weekStartDate = new Date('2025-08-01');

  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // CN

  // Chuyển sang format YYYY-MM-DD để so sánh trong SQL
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  const [rows] = await db.execute(`
    SELECT COUNT(*) AS SoTiet
    FROM ThoiKhoaBieu
    WHERE MaLop=? AND NamHoc=? AND KyHoc=? AND LoaiTKB=? AND TenMonHoc=? 
      AND Ngay BETWEEN ? AND ?
  `, [MaLop, NamHoc, KyHoc, LoaiTKB, TenMonHoc, startStr, endStr]);

  return rows[0]?.SoTiet || 0;
}

  static async getSubjectLimitByKhoi(TenMonHoc, Khoi) {
    const [rows] = await db.execute(`
      SELECT SoTiet
      FROM MonHoc
      WHERE TenMonHoc=? AND Khoi=? AND TrangThai='Đang dạy'
      LIMIT 1
    `, [TenMonHoc.trim(), Khoi.trim()]);
    return rows[0]?.SoTiet || 0;
  }
}

module.exports = ThoiKhoaBieu;
