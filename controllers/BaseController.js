// controllers/BaseController.js

class BaseController {
  constructor() {}

  // ===========================
  // Trả dữ liệu thành công
  // ===========================
  success(res, data = null, message = 'Thành công') {
    return res.json({
      success: true,
      message,
      data,
    });
  }

  // ===========================
  // Trả lỗi
  // ===========================
  error(res, message = 'Đã xảy ra lỗi', statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // ===========================
  // Kiểm tra dữ liệu bắt buộc
  // columns: mảng tên trường, data: object req.body
  // ===========================
  validateRequired(data, columns) {
    for (let col of columns) {
      if (!data[col] || data[col].toString().trim() === '') {
        return { valid: false, column: col };
      }
    }
    return { valid: true };
  }

  // ===========================
  // Gộp dữ liệu phân trang (nếu cần)
  // page: số trang, limit: số bản ghi/trang
  // ===========================
  paginate(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return { offset, limit };
  }
}

module.exports = BaseController;
