class DuyetYeuCauSuaDiemController {
  async renderPage(req, res) {
    try {
      // TODO: Lấy dữ liệu từ DB
      const requests = []; // ví dụ mảng rỗng

      res.render('pages/DuyetYeuCauSuaDiem', {
        page: 'duyetyeucausuadiem',
        requests
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi server khi render trang duyệt sửa điểm');
    }
  }

  // API lấy danh sách yêu cầu (dùng fetch từ SPA)
  async getRequests(req, res) {
    try {
      const requests = []; // TODO: fetch từ DB
      res.json({ status: 'ok', requests });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // API duyệt 1 yêu cầu
  async approveRequest(req, res) {
    try {
      const { requestId } = req.body;
      // TODO: update DB trạng thái đã duyệt
      res.json({ status: 'ok', message: `Đã duyệt yêu cầu ${requestId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}

module.exports = new DuyetYeuCauSuaDiemController();
