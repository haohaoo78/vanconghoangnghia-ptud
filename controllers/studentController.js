const Student = require('../models/Student');
const Class = require('../models/Class');

exports.getAllStudents = async (req, res) => {
  try {
    const { school, class: classId, grade, status, search } = req.query;

    let query = {};

    if (req.user.role !== 'admin' && req.user.role !== 'so_gd') {
      query.school = req.user.school;
    } else if (school) {
      query.school = school;
    }

    if (classId) query.currentClass = classId;
    if (grade) query['currentClass.grade'] = grade;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { studentCode: new RegExp(search, 'i') },
      ];
    }

    const students = await Student.find(query)
      .populate('school', 'schoolName')
      .populate('currentClass', 'className grade')
      .sort({ studentCode: 1 });

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('school')
      .populate('currentClass');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học sinh',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createStudent = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hieu_truong') {
      req.body.school = req.user.school;
    }

    const student = await Student.create(req.body);

    if (req.body.currentClass) {
      await Class.findByIdAndUpdate(req.body.currentClass, {
        $push: { students: student._id },
        $inc: { currentStudents: 1 },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thêm học sinh thành công',
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học sinh',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin học sinh thành công',
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học sinh',
      });
    }

    if (student.currentClass) {
      await Class.findByIdAndUpdate(student.currentClass, {
        $pull: { students: student._id },
        $inc: { currentStudents: -1 },
      });
    }

    await student.deleteOne();

    res.json({
      success: true,
      message: 'Xóa học sinh thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.transferStudent = async (req, res) => {
  try {
    const { studentId, newClassId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học sinh',
      });
    }

    if (student.currentClass) {
      await Class.findByIdAndUpdate(student.currentClass, {
        $pull: { students: student._id },
        $inc: { currentStudents: -1 },
      });
    }

    await Class.findByIdAndUpdate(newClassId, {
      $push: { students: student._id },
      $inc: { currentStudents: 1 },
    });

    student.currentClass = newClassId;
    await student.save();

    res.json({
      success: true,
      message: 'Chuyển lớp thành công',
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
