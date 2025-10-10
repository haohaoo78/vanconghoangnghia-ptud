const express = require('express');
const router = express.Router();
const {
  getAllEnrollments,
  createEnrollment,
  updateEnrollment,
  assignStudentToSchool,
  autoAssignStudents,
  confirmEnrollment,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'so_gd', 'hieu_truong'), getAllEnrollments)
  .post(
    authorize('admin', 'so_gd'),
    logActivity('Tạo hồ sơ tuyển sinh', 'Enrollment'),
    createEnrollment
  );

router
  .route('/:id')
  .put(
    authorize('admin', 'so_gd'),
    logActivity('Cập nhật hồ sơ tuyển sinh', 'Enrollment'),
    updateEnrollment
  );

router.post(
  '/assign',
  authorize('admin', 'so_gd'),
  logActivity('Phân bổ học sinh vào trường', 'Enrollment'),
  assignStudentToSchool
);

router.post(
  '/auto-assign',
  authorize('admin', 'so_gd'),
  logActivity('Tự động phân bổ học sinh', 'Enrollment'),
  autoAssignStudents
);

router.post(
  '/:id/confirm',
  authorize('admin', 'hieu_truong'),
  logActivity('Xác nhận nhập học', 'Enrollment'),
  confirmEnrollment
);

module.exports = router;
