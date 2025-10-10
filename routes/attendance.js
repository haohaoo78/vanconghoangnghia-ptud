const express = require('express');
const router = express.Router();
const {
  createAttendance,
  bulkAttendance,
  getAttendance,
  getAttendanceStatistics,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

router.use(protect);

router
  .route('/')
  .get(getAttendance)
  .post(
    authorize('gv_chu_nhiem', 'gv_bo_mon'),
    logActivity('Điểm danh', 'Attendance'),
    createAttendance
  );

router.post(
  '/bulk',
  authorize('gv_chu_nhiem', 'gv_bo_mon'),
  logActivity('Điểm danh hàng loạt', 'Attendance'),
  bulkAttendance
);

router.get('/statistics', getAttendanceStatistics);

module.exports = router;
