const db = require('../config/database');

class ThoiKhoaBieu {

  static async getClasses() {
    const [rows] = await db.execute('SELECT MaLop FROM Lop ORDER BY MaLop');
    return rows.map(r => r.MaLop);
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
    const uniqueRows = [];
    const seen = new Set();
    rows.forEach(r => {
      if (!seen.has(r.KyHoc)) {
        uniqueRows.push({ KyHoc: r.KyHoc, NgayBatDau: r.NgayBatDau });
        seen.add(r.KyHoc);
      }
    });
    return uniqueRows;
  }

  static async getSubjects() {
    const [rows] = await db.execute('SELECT TenMonHoc FROM MonHoc ORDER BY TenMonHoc');
    return rows.map(r => r.TenMonHoc);
  }

  static async getClassSubjectTeacher() {
    const [rows] = await db.execute(`
      SELECT g.MaGiaoVien, g.TenGiaoVien, g.TenMonHoc, gbm.MaLop
      FROM GVBoMon gbm
      JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
    `);
    const result = {};
    rows.forEach(r => {
      if(!result[r.MaLop]) result[r.MaLop] = {};
      result[r.MaLop][r.TenMonHoc] = r.TenGiaoVien;
    });
    return result;
  }

    static async getGrid(MaLop, LoaiTKB, NamHoc, KyHoc) {
      const [rows] = await db.execute(`
        SELECT t.Thu, t.TietHoc, t.TenMonHoc, g.TenGiaoVien
        FROM ThoiKhoaBieu t
        JOIN GiaoVien g ON t.MaGiaoVien = g.MaGiaoVien
        WHERE MaLop=? AND LoaiTKB=? AND NamHoc=? AND KyHoc=?
        ORDER BY Thu, TietHoc
      `, [MaLop, LoaiTKB, NamHoc, KyHoc]);

      const grid = {};
      rows.forEach(r => {
        const thu = Number(r.Thu);
        const tiet = Number(r.TietHoc);
        if (!grid[thu]) grid[thu] = {};
        grid[thu][tiet] = { subject: r.TenMonHoc, teacher: r.TenGiaoVien };
      });
      return grid;
    }


static async updateMultiple(cells) {
  for (const cell of cells) {
    // Lấy đúng giáo viên của lớp đó & môn đó
    const [gvRows] = await db.execute(`
      SELECT g.MaGiaoVien 
      FROM GVBoMon gbm 
      JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
      WHERE gbm.MaLop = ? AND g.TenMonHoc = ?
    `, [cell.MaLop, cell.TenMonHoc]);

    const MaGiaoVien = gvRows[0]?.MaGiaoVien || null;

    if (!MaGiaoVien) continue; // bỏ qua nếu không tìm thấy GV phù hợp

    await db.execute(`
      DELETE FROM ThoiKhoaBieu 
      WHERE MaLop=? AND LoaiTKB=? AND NamHoc=? AND KyHoc=? AND Thu=? AND TietHoc=?
    `, [cell.MaLop, cell.LoaiTKB, cell.NamHoc, cell.KyHoc, cell.Thu, cell.TietHoc]);

    await db.execute(`
      INSERT INTO ThoiKhoaBieu
      (MaLop, LoaiTKB, NamHoc, KyHoc, Thu, TietHoc, TenMonHoc, MaGiaoVien)
      VALUES (?,?,?,?,?,?,?,?)
    `, [cell.MaLop, cell.LoaiTKB, cell.NamHoc, cell.KyHoc, cell.Thu, cell.TietHoc, cell.TenMonHoc, MaGiaoVien]);
  }
}

  static async resetWeek(MaLop, NamHoc, KyHoc, Tuan) {
    await db.execute('DELETE FROM ThoiKhoaBieu WHERE MaLop=? AND LoaiTKB=? AND NamHoc=? AND KyHoc=?', [MaLop, Tuan, NamHoc, KyHoc]);
  }

  static async getNamHocStart(NamHoc, KyHoc){
    const [rows] = await db.execute('SELECT NgayBatDau FROM HocKy WHERE NamHoc=? AND KyHoc=?', [NamHoc, KyHoc]);
    return rows[0]?.NgayBatDau || null;
  }
  // Lấy khối của lớp
static async getKhoiByClass(MaLop) {
  const [rows] = await db.execute('SELECT Khoi FROM Lop WHERE MaLop = ?', [MaLop]);
  return rows[0]?.Khoi || null;
}

// Lấy môn theo khối
static async getSubjectsByKhoi(Khoi) {
  const [rows] = await db.execute('SELECT TenMonHoc FROM MonHoc WHERE Khoi = ? ORDER BY TenMonHoc', [Khoi]);
  return rows.map(r => r.TenMonHoc);
}

}


module.exports = ThoiKhoaBieu;
