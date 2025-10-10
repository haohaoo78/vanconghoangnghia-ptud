const Announcement = require('../models/Announcement');

exports.getAllAnnouncements = async (req, res) => {
  try {
    const { type, targetAudience } = req.query;

    let query = { isPublished: true };

    if (type) query.type = type;
    if (targetAudience) query.targetAudience = targetAudience;

    if (req.user.role === 'hoc_sinh' || req.user.role === 'phu_huynh') {
      query.$or = [
        { targetAudience: 'Tất cả' },
        { targetAudience: req.user.role === 'hoc_sinh' ? 'Học sinh' : 'Phụ huynh' },
        { targetSchools: req.user.school },
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'fullName')
      .sort({ priority: -1, publishDate: -1 });

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'fullName role')
      .populate('targetSchools', 'schoolName')
      .populate('targetClasses', 'className');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo',
      });
    }

    announcement.views += 1;
    await announcement.save();

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    req.body.author = req.user._id;

    const announcement = await Announcement.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tạo thông báo thành công',
      data: announcement,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo',
      });
    }

    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa thông báo này',
      });
    }

    Object.assign(announcement, req.body);
    await announcement.save();

    res.json({
      success: true,
      message: 'Cập nhật thông báo thành công',
      data: announcement,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo',
      });
    }

    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa thông báo này',
      });
    }

    await announcement.deleteOne();

    res.json({
      success: true,
      message: 'Xóa thông báo thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
