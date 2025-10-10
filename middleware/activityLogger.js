const ActivityLog = require('../models/ActivityLog');

exports.logActivity = (action, resourceType = null) => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        await ActivityLog.create({
          user: req.user._id,
          action,
          resourceType,
          resourceId: req.params.id || null,
          details: {
            method: req.method,
            path: req.path,
            body: req.method !== 'GET' ? req.body : undefined,
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      }
    } catch (error) {
      console.error('Lỗi ghi log hoạt động:', error);
    }
    next();
  };
};
