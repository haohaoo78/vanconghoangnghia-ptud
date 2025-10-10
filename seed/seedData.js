require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');

const User = require('../models/User');
const School = require('../models/School');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Grade = require('../models/Grade');
const Enrollment = require('../models/Enrollment');
const Announcement = require('../models/Announcement');

connectDB();

const seedData = async () => {
  try {
    console.log('Xóa dữ liệu cũ...');
    await User.deleteMany();
    await School.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Class.deleteMany();
    await Subject.deleteMany();
    await Grade.deleteMany();
    await Enrollment.deleteMany();
    await Announcement.deleteMany();

    console.log('Tạo tài khoản quản trị viên...');
    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      email: 'admin@school.edu.vn',
      fullName: 'Quản trị viên hệ thống',
      role: 'admin',
      phoneNumber: '0123456789',
      isActive: true,
    });

    console.log('Tạo môn học...');
    const subjects = await Subject.insertMany([
      { subjectCode: 'TOAN', subjectName: 'Toán', grades: [10, 11, 12], coefficient: 2 },
      { subjectCode: 'VAN', subjectName: 'Ngữ văn', grades: [10, 11, 12], coefficient: 2 },
      { subjectCode: 'ANH', subjectName: 'Tiếng Anh', grades: [10, 11, 12], coefficient: 1 },
      { subjectCode: 'LY', subjectName: 'Vật lý', grades: [10, 11, 12], coefficient: 1 },
      { subjectCode: 'HOA', subjectName: 'Hóa học', grades: [10, 11, 12], coefficient: 1 },
      { subjectCode: 'SINH', subjectName: 'Sinh học', grades: [10, 11, 12], coefficient: 1 },
      { subjectCode: 'SU', subjectName: 'Lịch sử', grades: [10, 11, 12], coefficient: 1 },
      { subjectCode: 'DIA', subjectName: 'Địa lý', grades: [10, 11, 12], coefficient: 1 },
      { subjectCode: 'GDCD', subjectName: 'Giáo dục công dân', grades: [10, 11, 12], coefficient: 1 },
      { subjectCode: 'TD', subjectName: 'Thể dục', grades: [10, 11, 12], coefficient: 1 },
    ]);

    console.log('Tạo trường học...');
    const schools = await School.insertMany([
      {
        schoolCode: 'THPT001',
        schoolName: 'THPT Nguyễn Huệ',
        address: '123 Đường Lê Lợi',
        district: 'Quận 1',
        city: 'TP. Hồ Chí Minh',
        phoneNumber: '028-12345678',
        email: 'nguyenhue@edu.vn',
        enrollmentQuota: 500,
        currentStudents: 0,
        foundedYear: 1990,
        isActive: true,
      },
      {
        schoolCode: 'THPT002',
        schoolName: 'THPT Trần Hưng Đạo',
        address: '456 Đường Hai Bà Trưng',
        district: 'Quận 3',
        city: 'TP. Hồ Chí Minh',
        phoneNumber: '028-87654321',
        email: 'tranhungdao@edu.vn',
        enrollmentQuota: 600,
        currentStudents: 0,
        foundedYear: 1985,
        isActive: true,
      },
    ]);

    console.log('Tạo tài khoản Sở GD&ĐT...');
    await User.create({
      username: 'sogd',
      password: 'sogd123',
      email: 'sogd@edu.vn',
      fullName: 'Phòng Giáo Dục Đào Tạo',
      role: 'so_gd',
      phoneNumber: '028-99999999',
      isActive: true,
    });

    console.log('Tạo hiệu trưởng...');
    await User.create({
      username: 'hieutruong1',
      password: 'hieutruong123',
      email: 'hieutruong@nguyenhue.edu.vn',
      fullName: 'Nguyễn Văn Hiệu Trưởng',
      role: 'hieu_truong',
      phoneNumber: '0909111111',
      school: schools[0]._id,
      isActive: true,
    });

    console.log('Tạo giáo viên...');
    const teacher1 = await Teacher.create({
      teacherCode: 'GV001',
      fullName: 'Trần Thị Lan',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'Nữ',
      idCard: '001085123456',
      phoneNumber: '0909222222',
      email: 'ttlan@nguyenhue.edu.vn',
      address: '789 Đường Cách Mạng Tháng 8',
      school: schools[0]._id,
      subjects: [subjects[0]._id],
      teachingLevel: 'Giáo viên chính',
      startDate: new Date('2010-08-01'),
      status: 'Đang công tác',
    });

    const teacherUser = await User.create({
      username: 'gvlan',
      password: 'giaovien123',
      email: 'ttlan@nguyenhue.edu.vn',
      fullName: 'Trần Thị Lan',
      role: 'gv_chu_nhiem',
      phoneNumber: '0909222222',
      school: schools[0]._id,
      relatedProfile: teacher1._id,
      profileType: 'Teacher',
      isActive: true,
    });

    console.log('Tạo lớp học...');
    const class10A1 = await Class.create({
      className: '10A1',
      grade: 10,
      academicYear: '2024-2025',
      school: schools[0]._id,
      homeRoomTeacher: teacher1._id,
      maxStudents: 45,
      currentStudents: 0,
      room: 'Phòng 201',
      status: 'Đang hoạt động',
    });

    teacher1.homeRoomClass = class10A1._id;
    teacher1.teachingClasses.push(class10A1._id);
    await teacher1.save();

    console.log('Tạo học sinh...');
    const students = await Student.insertMany([
      {
        studentCode: 'HS001',
        fullName: 'Nguyễn Văn An',
        dateOfBirth: new Date('2009-03-10'),
        gender: 'Nam',
        address: '123 Đường ABC',
        phoneNumber: '0909333333',
        email: 'nvan@student.edu.vn',
        school: schools[0]._id,
        currentClass: class10A1._id,
        academicYear: '2024-2025',
        enrollmentScore: 27.5,
        status: 'Đang học',
        parentInfo: {
          fatherName: 'Nguyễn Văn Bố',
          fatherPhone: '0909444444',
          motherName: 'Trần Thị Mẹ',
          motherPhone: '0909555555',
        },
      },
      {
        studentCode: 'HS002',
        fullName: 'Lê Thị Bình',
        dateOfBirth: new Date('2009-07-20'),
        gender: 'Nữ',
        address: '456 Đường XYZ',
        phoneNumber: '0909666666',
        email: 'ltbinh@student.edu.vn',
        school: schools[0]._id,
        currentClass: class10A1._id,
        academicYear: '2024-2025',
        enrollmentScore: 28.0,
        status: 'Đang học',
        parentInfo: {
          fatherName: 'Lê Văn Cha',
          fatherPhone: '0909777777',
          motherName: 'Hoàng Thị Mẹ',
          motherPhone: '0909888888',
        },
      },
    ]);

    class10A1.students = students.map(s => s._id);
    class10A1.currentStudents = students.length;
    await class10A1.save();

    console.log('Tạo tài khoản học sinh...');
    await User.create({
      username: 'hs001',
      password: 'hocsinh123',
      email: 'nvan@student.edu.vn',
      fullName: 'Nguyễn Văn An',
      role: 'hoc_sinh',
      phoneNumber: '0909333333',
      school: schools[0]._id,
      relatedProfile: students[0]._id,
      profileType: 'Student',
      isActive: true,
    });

    console.log('Tạo hồ sơ tuyển sinh mẫu...');
    await Enrollment.insertMany([
      {
        studentName: 'Phạm Văn Tân',
        dateOfBirth: new Date('2009-12-05'),
        gender: 'Nam',
        address: '789 Đường DEF',
        phoneNumber: '0909123456',
        parentPhone: '0909654321',
        examScores: {
          math: 9.5,
          literature: 8.5,
          english: 9.0,
          totalScore: 27.0,
        },
        desiredSchools: [
          { school: schools[0]._id, priority: 1 },
          { school: schools[1]._id, priority: 2 },
        ],
        academicYear: '2024-2025',
        status: 'Đang chờ',
      },
    ]);

    console.log('Tạo thông báo mẫu...');
    await Announcement.create({
      title: 'Thông báo khai giảng năm học 2024-2025',
      content: 'Trường THPT Nguyễn Huệ thông báo lịch khai giảng năm học mới vào ngày 05/09/2024. Toàn thể học sinh có mặt đúng giờ.',
      type: 'Thông báo chung',
      priority: 'Cao',
      targetAudience: 'Tất cả',
      targetSchools: [schools[0]._id],
      author: admin._id,
      isPublished: true,
    });

    console.log('Seed dữ liệu thành công!');
    console.log('\nThông tin đăng nhập:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Sở GD: username=sogd, password=sogd123');
    console.log('Hiệu trưởng: username=hieutruong1, password=ht123');
    console.log('Giáo viên: username=gvlan, password=gv123');
    console.log('Học sinh: username=hs001, password=hs123');

    process.exit(0);
  } catch (error) {
    console.error('Lỗi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedData();
