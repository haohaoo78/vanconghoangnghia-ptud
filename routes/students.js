const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  transferStudent,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

router.use(protect);

router
  .route('/')
  .get(getAllStudents)
  .post(
    authorize('admin', 'hieu_truong', 'gv_chu_nhiem'),
    logActivity('Tạo học sinh', 'Student'),
    createStudent
  );

router
  .route('/:id')
  .get(getStudent)
  .put(
    authorize('admin', 'hieu_truong', 'gv_chu_nhiem'),
    logActivity('Cập nhật học sinh', 'Student'),
    updateStudent
  )
  .delete(
    authorize('admin', 'hieu_truong'),
    logActivity('Xóa học sinh', 'Student'),
    deleteStudent
  );

router.post(
  '/transfer',
  authorize('admin', 'hieu_truong'),
  logActivity('Chuyển lớp học sinh', 'Student'),
  transferStudent
);

module.exports = router;
