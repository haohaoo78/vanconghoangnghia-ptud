const ThoiKhoaBieu = require('../models/ThoiKhoaBieu');

class ThoiKhoaBieuController {
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

  async getLopTheoKhoi(req, res) {
    try {
      const { MaKhoi } = req.body;
      if (!MaKhoi) return res.json([]);
      const classes = await ThoiKhoaBieu.getClassesByKhoi(MaKhoi);
      res.json(classes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi truy vấn lớp theo khối' });
    }
  }

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

  async getSubjectsByClass(req, res) {
    try {
      const { MaLop, NamHoc, KyHoc } = req.body;
      const subjects = await ThoiKhoaBieu.getSubjectsWithTeacherByClass(MaLop, NamHoc, KyHoc);
      res.json(subjects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi lấy môn đã phân công giáo viên cho lớp' });
    }
  }

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

      const subjects = await ThoiKhoaBieu.getSubjectsWithTeacherByClass(MaLop, NamHoc, KyHoc);
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
