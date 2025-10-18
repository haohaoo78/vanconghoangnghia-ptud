const db = require('../config/database');

class ThoiKhoaBieu {
  static db = db;

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

  static async getTeacher(MaLop, TenMonHoc) {
    const [rows] = await db.execute(
      `SELECT g.MaGiaoVien, g.TenGiaoVien
       FROM GVBoMon gbm
       JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
       WHERE gbm.MaLop=? AND g.TenMonHoc=?
       LIMIT 1`,
      [MaLop, TenMonHoc]
    );
    return rows[0] || { TenGiaoVien: '' };
  }

  static async getSubjectsWithTeacherByClass(MaLop, NamHoc, KyHoc) {
    if (!MaLop || !NamHoc || !KyHoc) return [];

    const [rows] = await db.execute(
      `SELECT DISTINCT m.TenMonHoc, g.TenGiaoVien
       FROM GVBoMon gbm
       JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
       JOIN MonHoc m ON m.TenMonHoc = g.TenMonHoc
       WHERE gbm.MaLop=? AND gbm.NamHoc=? AND gbm.HocKy=?
       ORDER BY m.TenMonHoc`,
      [MaLop, NamHoc, KyHoc]
    );
    return rows;
  }

static async getGrid(MaLop, LoaiTKB, NamHoc, KyHoc) {
  // Lấy TKB thực tế
  let [rows] = await db.execute(`
    SELECT t.Thu, t.TietHoc, t.TenMonHoc, g.TenGiaoVien, t.LoaiTKB
    FROM ThoiKhoaBieu t
    JOIN GiaoVien g ON t.MaGiaoVien = g.MaGiaoVien
    WHERE t.MaLop=? AND t.NamHoc=? AND t.KyHoc=? AND t.LoaiTKB=?
    ORDER BY Thu, TietHoc
  `, [MaLop, NamHoc, KyHoc, LoaiTKB]);

  // Nếu không có dữ liệu tuần, lấy TKB chuẩn
  if(rows.length === 0 && LoaiTKB !== 'Chuan') {
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


static async updateMultiple(cells, startDate) {
  for (const cell of cells) {
    const { MaLop, LoaiTKB, NamHoc, KyHoc, Thu, TietHoc, TenMonHoc } = cell;

    // Xác định Ngày
    let Ngay = null;
    const baseDate = new Date(startDate);
    let thuNumber = Thu === 'CN' ? 7 : parseInt(Thu); // CN = 7
    let weekOffset = 0;
    if (LoaiTKB.startsWith('Tuan')) {
      weekOffset = (parseInt(LoaiTKB.replace('Tuan', '')) - 1) * 7;
    }
    const offset = (thuNumber - 2) + weekOffset; // Thứ 2 = ngày 0
    const ngayObj = new Date(baseDate);
    ngayObj.setDate(baseDate.getDate() + offset);
    Ngay = ngayObj.toISOString().slice(0, 10); // yyyy-mm-dd

    // Lấy MaGiaoVien
    const [gvRows] = await db.execute(`
      SELECT g.MaGiaoVien
      FROM GVBoMon gbm
      JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
      WHERE gbm.MaLop=? AND g.TenMonHoc=?
      LIMIT 1
    `, [MaLop, TenMonHoc]);
    const MaGiaoVien = gvRows[0]?.MaGiaoVien;
    if (!MaGiaoVien) continue;

    // DELETE cell cũ (khóa chính: MaLop, LoaiTKB, Thu, TietHoc, TenMonHoc, Ngay)
    await db.execute(`
      DELETE FROM ThoiKhoaBieu
      WHERE MaLop=? AND LoaiTKB=? AND Thu=? AND TietHoc=? AND TenMonHoc=? AND Ngay=?
    `, [MaLop, LoaiTKB, Thu, TietHoc, TenMonHoc, Ngay]);

    // INSERT cell mới
    await db.execute(`
      INSERT INTO ThoiKhoaBieu 
        (LoaiTKB, MaLop, TenMonHoc, TietHoc, KyHoc, Thu, Ngay, MaGiaoVien, NamHoc)
      VALUES (?,?,?,?,?,?,?,?,?)
    `, [LoaiTKB, MaLop, TenMonHoc, TietHoc, KyHoc, Thu, Ngay, MaGiaoVien, NamHoc]);
  }
}


// Reset tuần cụ thể
static async resetWeek(MaLop, NamHoc, KyHoc, LoaiTKB) {
  if(LoaiTKB==='Chuan') return; // Không xóa TKB chuẩn
  await db.execute(`
    DELETE FROM ThoiKhoaBieu 
    WHERE MaLop=? AND NamHoc=? AND KyHoc=? AND LoaiTKB=?
  `, [MaLop, NamHoc, KyHoc, LoaiTKB]);
}

}

module.exports = ThoiKhoaBieu;
