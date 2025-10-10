const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  createPayment,
  updatePayment,
  getStudentPaymentSummary,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

router.use(protect);

router
  .route('/')
  .get(getAllPayments)
  .post(
    authorize('admin', 'hieu_truong'),
    logActivity('Tạo khoản thu', 'Payment'),
    createPayment
  );

router.put(
  '/:id',
  authorize('admin', 'hieu_truong'),
  logActivity('Cập nhật thanh toán', 'Payment'),
  updatePayment
);

router.get('/student/:studentId/summary', getStudentPaymentSummary);

module.exports = router;
