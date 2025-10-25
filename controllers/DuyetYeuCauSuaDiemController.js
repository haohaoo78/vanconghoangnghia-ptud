const DuyetYeuCauSuaDiem = require('../models/DuyetYeuCauSuaDiemModel');

class DuyetYeuCauSuaDiemController {
  async renderPage(req, res) {
    try {
      const khoiList = await DuyetYeuCauSuaDiem.getKhoiList();
      const firstKhoi = khoiList[0]?.MaKhoi || '';
      const classes = await DuyetYeuCauSuaDiem.getClassesByKhoi(firstKhoi);
      const subjects = await DuyetYeuCauSuaDiem.getSubjects();

      res.render('pages/duyetyeucausuadiem', {
        khoiList,
        classes,
        subjects,
        selectedKhoi: firstKhoi,
        selectedLop: '',
        selectedMon: '',
        requests: []
      });
    } catch (err) {
      console.error('Lỗi render:', err);
      res.status(500).send('Lỗi server khi render trang duyệt yêu cầu.');
    }
  }

  async getLopTheoKhoi(req, res) {
    try {
      const { MaKhoi } = req.body;
      const classes = await DuyetYeuCauSuaDiem.getClassesByKhoi(MaKhoi);
      res.json(classes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi lấy lớp theo khối' });
    }
  }

  async getRequests(req, res) {
    try {
      const { MaLop, MaMon } = req.body;
      if (!MaLop || !MaMon) return res.json({ requests: [] });

      const requests = await DuyetYeuCauSuaDiem.getRequests(MaLop, MaMon);
      res.json({ requests });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi lấy danh sách yêu cầu' });
    }
  }

  async updateStatus(req, res) {
    try {
      const { MaYeuCau, TrangThai } = req.body;
      if (!MaYeuCau || !TrangThai)
        return res.status(400).json({ error: 'Thiếu thông tin' });

      await DuyetYeuCauSuaDiem.updateStatus(MaYeuCau, TrangThai);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái' });
    }
  }
}

module.exports = new DuyetYeuCauSuaDiemController();
