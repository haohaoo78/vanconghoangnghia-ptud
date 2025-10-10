const express = require('express');
const router = express.Router();
const {
  getAllGrades,
  getGrade,
  createGrade,
  updateGrade,
  approveGrade,
  lockGrade,
  getStudentGrades,
} = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

router.use(protect);

router
  .route('/')
  .get(getAllGrades)
  .post(
    authorize('gv_bo_mon', 'gv_chu_nhiem'),
    logActivity('Nhập điểm', 'Grade'),
    createGrade
  );

router
  .route('/:id')
  .get(getGrade)
  .put(
    authorize('gv_bo_mon', 'gv_chu_nhiem', 'hieu_truong'),
    logActivity('Cập nhật điểm', 'Grade'),
    updateGrade
  );

router.put(
  '/:id/approve',
  authorize('hieu_truong', 'gv_chu_nhiem'),
  logActivity('Duyệt điểm', 'Grade'),
  approveGrade
);

router.post(
  '/lock',
  authorize('hieu_truong'),
  logActivity('Khóa điểm', 'Grade'),
  lockGrade
);

router.get('/student/:studentId', getStudentGrades);

module.exports = router;
