const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

router.use(protect);

router
  .route('/')
  .get(getAllAnnouncements)
  .post(
    authorize('admin', 'so_gd', 'hieu_truong', 'gv_chu_nhiem'),
    logActivity('Tạo thông báo', 'Announcement'),
    createAnnouncement
  );

router
  .route('/:id')
  .get(getAnnouncement)
  .put(
    authorize('admin', 'so_gd', 'hieu_truong', 'gv_chu_nhiem'),
    logActivity('Cập nhật thông báo', 'Announcement'),
    updateAnnouncement
  )
  .delete(
    authorize('admin', 'so_gd', 'hieu_truong', 'gv_chu_nhiem'),
    logActivity('Xóa thông báo', 'Announcement'),
    deleteAnnouncement
  );

module.exports = router;
