const ThoiKhoaBieu = require('../models/ThoiKhoaBieu');

class ThoiKhoaBieuController {

  // Render giao diện
  async renderPage(req, res) {
    try {
      const classes = await ThoiKhoaBieu.getClasses();
      const subjects = await ThoiKhoaBieu.getSubjects();
      const classSubjectTeacher = await ThoiKhoaBieu.getClassSubjectTeacher();
      const namHocList = await ThoiKhoaBieu.getNamHocList();
      const selectedNamHoc = namHocList[0] || '';

      // Lấy học kỳ theo năm học
      const kyHocListObj = await ThoiKhoaBieu.getKyHocList(selectedNamHoc);
      const kyHocList = kyHocListObj.map(k => k.KyHoc);
      const selectedKyHoc = kyHocList[0] || '';
      const selectedNamHocStart = kyHocListObj[0]?.NgayBatDau || '2025-08-01';

      res.render('Thoikhoabieu', {
        classes,
        subjects,
        classSubjectTeacher,
        namHocList,
        kyHocList,
        timetable: {},
        selectedClass: '',
        selectedNamHoc,
        selectedKyHoc,
        selectedLoaiTKB: 'Chuan',
        selectedNamHocStart,
        statusMessage: ''
      });
    } catch(err) {
      console.error(err);
      res.status(500).send('Lỗi server');
    }
  }

  // API trả học kỳ theo năm học
  async getKyHocList(req,res) {
    try {
      const { NamHoc } = req.body;
      const list = await ThoiKhoaBieu.getKyHocList(NamHoc);
      res.json(list);
    } catch(err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi server' });
    }
  }

  // API load TKB theo lớp, năm học, học kỳ, loại TKB
  async getAll(req,res) {
    try {
      let { MaLop, NamHoc, KyHoc, LoaiTKB } = req.body;
      if (!MaLop || !NamHoc) return res.status(400).json({ error:'Vui lòng chọn lớp và năm học' });

      LoaiTKB = LoaiTKB || 'Chuan';

      // Lấy học kỳ hợp lệ của năm học
      const kyHocListObj = await ThoiKhoaBieu.getKyHocList(NamHoc);
      const kyHocList = kyHocListObj.map(k => k.KyHoc);
      if(!KyHoc || !kyHocList.includes(KyHoc)) KyHoc = kyHocList[0] || '';
      const selectedNamHocStart = kyHocListObj.find(k => k.KyHoc===KyHoc)?.NgayBatDau || '2025-08-01';

      // Lấy TKB
      let timetable = await ThoiKhoaBieu.getGrid(MaLop, LoaiTKB, NamHoc, KyHoc);
      if(LoaiTKB !== 'Chuan' && Object.keys(timetable).length === 0) {
        // Nếu tuần không có dữ liệu, lấy TKB chuẩn
        timetable = await ThoiKhoaBieu.getGrid(MaLop, 'Chuan', NamHoc, KyHoc);
      }

      const subjects = await ThoiKhoaBieu.getSubjects();
      const classSubjectTeacher = await ThoiKhoaBieu.getClassSubjectTeacher();

      res.json({ timetable, subjects, classSubjectTeacher, selectedNamHocStart, statusMessage:'Đã tải dữ liệu' });

    } catch(err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi server' });
    }
  }

  // API lấy giáo viên theo lớp + môn
async getTeacher(req,res) {
  try {
    const { MaLop, TenMonHoc } = req.body;
    const [rows] = await ThoiKhoaBieu.db.execute(`
      SELECT g.TenGiaoVien 
      FROM GVBoMon gbm
      JOIN GiaoVien g ON gbm.MaGVBM = g.MaGiaoVien
      WHERE gbm.MaLop = ? AND g.TenMonHoc = ?
      LIMIT 1
    `, [MaLop, TenMonHoc]);
    res.json({ TenGiaoVien: rows[0]?.TenGiaoVien || '' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi lấy giáo viên' });
  }
}

  // API lưu nhiều ô TKB cùng lúc
async saveAll(req,res) {
  try {
    const { timetable } = req.body;
    console.log('Dữ liệu nhận:', timetable); // thêm dòng này
    await ThoiKhoaBieu.updateMultiple(timetable);
    res.json({ message: 'Lưu thời khóa biểu thành công!' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi lưu TKB' });
  }
}
  // API reset tuần về TKB chuẩn
  async resetWeek(req,res) {
    try {
      const { MaLop, NamHoc, KyHoc, LoaiTKB } = req.body;
      if(!MaLop || !NamHoc || !KyHoc || !LoaiTKB) return res.status(400).json({ error:'Thiếu tham số' });

      await ThoiKhoaBieu.resetWeek(MaLop, NamHoc, KyHoc, LoaiTKB);
      res.json({ message:`Đã reset ${LoaiTKB} về TKB chuẩn` });
    } catch(err) {
      console.error(err);
      res.status(500).json({ error:'Lỗi server khi reset tuần' });
    }
  }
  async getSubjectsByClass(req, res) {
  try {
    const { MaLop } = req.body;
    const khoi = await ThoiKhoaBieu.getKhoiByClass(MaLop);
    if (!khoi) return res.json([]);
    const subjects = await ThoiKhoaBieu.getSubjectsByKhoi(khoi);
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách môn' });
  }
}
}


module.exports = new ThoiKhoaBieuController();
