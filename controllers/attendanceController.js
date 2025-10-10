const Attendance = require('../models/Attendance');

exports.createAttendance = async (req, res) => {
  try {
    req.body.teacher = req.user.relatedProfile;

    const attendance = await Attendance.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Điểm danh thành công',
      data: attendance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.bulkAttendance = async (req, res) => {
  try {
    const { classId, date, session, attendanceList } = req.body;

    const attendanceRecords = attendanceList.map(item => ({
      student: item.studentId,
      class: classId,
      date,
      session,
      status: item.status,
      reason: item.reason,
      note: item.note,
      teacher: req.user.relatedProfile,
    }));

    const result = await Attendance.insertMany(attendanceRecords);

    res.status(201).json({
      success: true,
      message: 'Điểm danh thành công',
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { classId, studentId, startDate, endDate } = req.query;

    let query = {};
    if (classId) query.class = classId;
    if (studentId) query.student = studentId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'studentCode fullName')
      .populate('class', 'className')
      .populate('subject', 'subjectName')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAttendanceStatistics = async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;

    const query = { student: studentId };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendance = await Attendance.find(query);

    const statistics = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'Có mặt').length,
      absenceWithPermission: attendance.filter(a => a.status === 'Vắng có phép').length,
      absenceWithoutPermission: attendance.filter(a => a.status === 'Vắng không phép').length,
      late: attendance.filter(a => a.status === 'Đi muộn').length,
    };

    statistics.attendanceRate = statistics.total > 0
      ? ((statistics.present / statistics.total) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
