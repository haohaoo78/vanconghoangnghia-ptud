const Enrollment = require('../models/Enrollment');
const School = require('../models/School');
const Student = require('../models/Student');

exports.getAllEnrollments = async (req, res) => {
  try {
    const { academicYear, status, school } = req.query;

    let query = {};
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;
    if (school) query.assignedSchool = school;

    const enrollments = await Enrollment.find(query)
      .populate('desiredSchools.school', 'schoolName')
      .populate('assignedSchool', 'schoolName')
      .sort({ 'examScores.totalScore': -1 });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createEnrollment = async (req, res) => {
  try {
    const { math, literature, english } = req.body.examScores;
    req.body.examScores.totalScore = math + literature + english;

    const enrollment = await Enrollment.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tuyển sinh thành công',
      data: enrollment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateEnrollment = async (req, res) => {
  try {
    if (req.body.examScores) {
      const { math, literature, english } = req.body.examScores;
      req.body.examScores.totalScore = math + literature + english;
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ tuyển sinh',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật hồ sơ tuyển sinh thành công',
      data: enrollment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.assignStudentToSchool = async (req, res) => {
  try {
    const { enrollmentId, schoolId } = req.body;

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trường',
      });
    }

    if (school.currentStudents >= school.enrollmentQuota) {
      return res.status(400).json({
        success: false,
        message: 'Trường đã đủ chỉ tiêu tuyển sinh',
      });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ tuyển sinh',
      });
    }

    enrollment.assignedSchool = schoolId;
    enrollment.status = 'Đã phân bổ';
    enrollment.assignedDate = Date.now();
    await enrollment.save();

    school.currentStudents += 1;
    await school.save();

    res.json({
      success: true,
      message: 'Phân bổ học sinh vào trường thành công',
      data: enrollment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.autoAssignStudents = async (req, res) => {
  try {
    const { academicYear } = req.body;

    const enrollments = await Enrollment.find({
      academicYear,
      status: 'Đang chờ',
    }).sort({ 'examScores.totalScore': -1 });

    const schools = await School.find({ isActive: true });

    let assigned = 0;

    for (const enrollment of enrollments) {
      for (const desired of enrollment.desiredSchools.sort((a, b) => a.priority - b.priority)) {
        const school = schools.find(s =>
          s._id.toString() === desired.school.toString() &&
          s.currentStudents < s.enrollmentQuota
        );

        if (school) {
          enrollment.assignedSchool = school._id;
          enrollment.status = 'Đã phân bổ';
          enrollment.assignedDate = Date.now();
          await enrollment.save();

          school.currentStudents += 1;
          await school.save();

          assigned++;
          break;
        }
      }
    }

    res.json({
      success: true,
      message: `Đã phân bổ ${assigned} học sinh`,
      data: { assigned, total: enrollments.length },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.confirmEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ tuyển sinh',
      });
    }

    if (enrollment.status !== 'Đã phân bổ') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận hồ sơ đã được phân bổ',
      });
    }

    const studentData = {
      studentCode: `HS${Date.now()}`,
      fullName: enrollment.studentName,
      dateOfBirth: enrollment.dateOfBirth,
      gender: enrollment.gender,
      address: enrollment.address,
      phoneNumber: enrollment.phoneNumber,
      school: enrollment.assignedSchool,
      enrollmentScore: enrollment.examScores.totalScore,
      priorityType: enrollment.priorityType,
      status: 'Đang học',
    };

    const student = await Student.create(studentData);

    enrollment.status = 'Đã xác nhận';
    enrollment.confirmedDate = Date.now();
    await enrollment.save();

    res.json({
      success: true,
      message: 'Xác nhận nhập học thành công',
      data: { enrollment, student },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
