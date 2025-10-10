const Grade = require('../models/Grade');
const Student = require('../models/Student');

exports.getAllGrades = async (req, res) => {
  try {
    const { student, class: classId, subject, semester, academicYear } = req.query;

    let query = {};
    if (student) query.student = student;
    if (classId) query.class = classId;
    if (subject) query.subject = subject;
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;

    const grades = await Grade.find(query)
      .populate('student', 'studentCode fullName')
      .populate('class', 'className grade')
      .populate('subject', 'subjectName')
      .populate('teacher', 'fullName')
      .sort({ student: 1, subject: 1 });

    res.json({
      success: true,
      count: grades.length,
      data: grades,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student')
      .populate('class')
      .populate('subject')
      .populate('teacher');

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy điểm',
      });
    }

    res.json({
      success: true,
      data: grade,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createGrade = async (req, res) => {
  try {
    req.body.teacher = req.user.relatedProfile;

    const grade = await Grade.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Thêm điểm thành công',
      data: grade,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy điểm',
      });
    }

    if (grade.status === 'Đã khóa') {
      return res.status(400).json({
        success: false,
        message: 'Không thể sửa điểm đã khóa',
      });
    }

    if (grade.status === 'Đã duyệt' && req.user.role !== 'hieu_truong') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền sửa điểm đã duyệt',
      });
    }

    Object.assign(grade, req.body);
    await grade.save();

    res.json({
      success: true,
      message: 'Cập nhật điểm thành công',
      data: grade,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.approveGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy điểm',
      });
    }

    grade.status = 'Đã duyệt';
    grade.approvedBy = req.user._id;
    grade.approvedAt = Date.now();
    await grade.save();

    res.json({
      success: true,
      message: 'Duyệt điểm thành công',
      data: grade,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.lockGrade = async (req, res) => {
  try {
    const { classId, semester, academicYear } = req.body;

    await Grade.updateMany(
      { class: classId, semester, academicYear, status: 'Đã duyệt' },
      { status: 'Đã khóa' }
    );

    res.json({
      success: true,
      message: 'Khóa điểm thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester, academicYear } = req.query;

    const query = { student: studentId };
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;

    const grades = await Grade.find(query)
      .populate('subject', 'subjectName coefficient')
      .populate('teacher', 'fullName')
      .sort({ subject: 1 });

    const totalScore = grades.reduce((sum, g) => {
      return sum + (g.scores.averageScore || 0) * (g.subject.coefficient || 1);
    }, 0);

    const totalCoefficient = grades.reduce((sum, g) => {
      return sum + (g.subject.coefficient || 1);
    }, 0);

    const gpa = totalCoefficient > 0 ? totalScore / totalCoefficient : 0;

    res.json({
      success: true,
      data: {
        grades,
        gpa: gpa.toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
