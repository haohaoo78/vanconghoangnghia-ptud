// controllers/ThoiKhoaBieuController.js
const ThoiKhoaBieu = require('../models/ThoiKhoaBieu');

class ThoiKhoaBieuController {
  // === Render trang chính ===
  async renderPage(req, res) {
    try {
      const khoiList = await ThoiKhoaBieu.getKhoiList();
      const firstKhoi = khoiList[0]?.MaKhoi || '';
      const classes = await ThoiKhoaBieu.getClassesByKhoi(firstKhoi);
      const firstClass = classes[0]?.MaLop || '';

      const namHocList = await ThoiKhoaBieu.getNamHocList();
      const selectedNamHoc = namHocList[0] || '';
      const kyHocListObj = await ThoiKhoaBieu.getKyHocList(selectedNamHoc);
      const kyHocList = kyHocListObj.map(k => k.KyHoc);
      const selectedKyHoc = kyHocList[0] || '';
      const selectedNamHocStart = kyHocListObj[0]?.NgayBatDau || '2025-08-01';

      res.render('Thoikhoabieu', {
        khoiList,
        classes,
        subjects: [],
        classSubjectTeacher: [],
        namHocList,
        kyHocList,
        timetable: {},
        selectedKhoi: firstKhoi,
        selectedClass: firstClass,
        selectedNamHoc,
        selectedKyHoc,
        selectedLoaiTKB: 'Chuan',
        selectedNamHocStart,
        statusMessage: ''
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi server khi render trang');
    }
  }

  // === API: Lấy lớp theo khối ===
  async getLopTheoKhoi(req, res) {
    try {
      const { MaKhoi } = req.body;
      if (!MaKhoi) return res.json([]);

      const [rows] = await ThoiKhoaBieu.db.execute(
        'SELECT MaLop, TenLop FROM Lop WHERE Khoi = ? ORDER BY TenLop',
        [MaKhoi]
      );

      res.json(rows);
    } catch (err) {
      console.error('Lỗi lấy lớp theo khối:', err);
      res.status(500).json({ error: 'Lỗi truy vấn lớp theo khối' });
    }
  }

  // === API: Lấy học kỳ theo năm học ===
  async getKyHocList(req, res) {
    try {
      const { NamHoc } = req.body;
      const list = await ThoiKhoaBieu.getKyHocList(NamHoc);
      res.json(list);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi lấy học kỳ' });
    }
  }

  // === API: Lấy môn + giáo viên theo lớp ===
  async getSubjectsByClass(req, res) {
    try {
      const { MaLop } = req.body;
      if (!MaLop) return res.json([]);

      const subjects = await ThoiKhoaBieu.getSubjectsByClass(MaLop);

      // Nếu chưa có giáo viên, gán mặc định thông báo
      const subjectsWithTeacher = subjects.map(s => ({
        TenMonHoc: s.TenMonHoc,
        TenGiaoVien: s.TenGiaoVien || 'Môn này chưa phân công bộ môn'
      }));

      res.json(subjectsWithTeacher);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi lấy môn theo lớp' });
    }
  }

  // === API: Lấy giáo viên dạy môn cho lớp ===
  async getTeacher(req, res) {
    try {
      const { MaLop, TenMonHoc } = req.body;
      const gv = await ThoiKhoaBieu.getTeacher(MaLop, TenMonHoc);
      res.json(gv);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi lấy giáo viên' });
    }
  }

  // === API: Load TKB (khi bấm nút Hiển thị) ===
  async getAll(req, res) {
    try {
      let { MaLop, NamHoc, KyHoc, LoaiTKB } = req.body;
      if (!MaLop || !NamHoc)
        return res.status(400).json({ error: 'Thiếu lớp hoặc năm học' });

      LoaiTKB = LoaiTKB || 'Chuan';
      const kyHocListObj = await ThoiKhoaBieu.getKyHocList(NamHoc);
      const kyHocList = kyHocListObj.map(k => k.KyHoc);
      if (!KyHoc || !kyHocList.includes(KyHoc)) KyHoc = kyHocList[0] || '';
      const selectedNamHocStart =
        kyHocListObj.find(k => k.KyHoc === KyHoc)?.NgayBatDau || '2025-08-01';

      // ✅ Lấy danh sách môn theo lớp
      const subjectsRaw = await ThoiKhoaBieu.getSubjectsByClass(MaLop);
      const subjects = subjectsRaw.map(s => ({
        TenMonHoc: s.TenMonHoc,
        TenGiaoVien: s.TenGiaoVien || 'Môn này chưa phân công bộ môn'
      }));

      // ✅ Lấy thời khóa biểu
      const timetable = await ThoiKhoaBieu.getGrid(MaLop, LoaiTKB, NamHoc, KyHoc);

      res.json({
        timetable,
        subjects,
        selectedNamHocStart,
        statusMessage: 'Đã tải dữ liệu'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi tải TKB' });
    }
  }

  // === API: Lưu TKB ===
  async saveAll(req, res) {
    try {
      const { timetable } = req.body;
      await ThoiKhoaBieu.updateMultiple(timetable);
      res.json({ message: 'Lưu thời khóa biểu thành công!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi lưu TKB' });
    }
  }

  // === API: Reset tuần ===
  async resetWeek(req, res) {
    try {
      const { MaLop, NamHoc, KyHoc, LoaiTKB } = req.body;
      await ThoiKhoaBieu.resetWeek(MaLop, NamHoc, KyHoc, LoaiTKB);
      res.json({ message: `Đã reset ${LoaiTKB} về TKB chuẩn` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi reset tuần' });
    }
  }
}

module.exports = new ThoiKhoaBieuController();
