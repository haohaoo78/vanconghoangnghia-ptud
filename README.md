# Hệ thống quản lý trường Trung học Phổ thông

Ứng dụng web quản lý toàn diện các hoạt động của trường THPT, bao gồm tuyển sinh, quản lý học tập, hồ sơ học sinh, giáo viên, thông báo, và học phí.

## Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Database**: MongoDB với Mongoose ODM
- **Template Engine**: EJS
- **UI Framework**: Bootstrap 5
- **Authentication**: JWT, Express Session
- **Validation**: Express Validator

## Cấu trúc dự án

```
project/
├── config/              # Cấu hình database
├── controllers/         # Controllers xử lý business logic
├── middleware/          # Middleware (auth, logging, error handling)
├── models/             # Mongoose models
├── routes/             # API routes
├── views/              # EJS templates
│   ├── auth/           # Giao diện đăng nhập
│   ├── admin/          # Giao diện quản trị
│   ├── teacher/        # Giao diện giáo viên
│   ├── student/        # Giao diện học sinh
│   └── shared/         # Components dùng chung
├── public/             # Static files (CSS, JS, images)
├── seed/               # Dữ liệu test mẫu
├── utils/              # Utility functions
├── .env                # Biến môi trường
├── server.js           # Entry point
└── package.json        # Dependencies

```

## Tính năng chính

### 1. Tuyển sinh (Sở GD&ĐT)
- Nhập chỉ tiêu tuyển sinh cho các trường
- Nhập điểm thi tuyển sinh học sinh
- Tự động phân bổ học sinh vào trường dựa trên điểm và nguyện vọng
- Xác nhận nhập học

### 2. Quản lý học tập (Trường, Giáo viên)
- Quản lý điểm môn học (thêm, sửa, duyệt, khóa)
- Xét hạnh kiểm, học lực
- Điểm danh học sinh
- Giao bài tập và nhận xét học sinh
- Tính điểm trung bình, xếp loại

### 3. Quản lý hồ sơ
- Quản lý thông tin học sinh, giáo viên
- Phân công giáo viên chủ nhiệm, bộ môn
- Phân chia học sinh theo khối, lớp
- Quản lý danh sách lớp học

### 4. Quản lý thông tin – liên lạc
- Gửi thông báo cho học sinh, giáo viên, phụ huynh
- Xem bài tập
- Xin nghỉ học

### 5. Quản lý học phí – tài chính
- Tạo khoản thu học phí
- Thanh toán học phí
- Theo dõi công nợ
- Báo cáo tài chính

### 6. Quản trị hệ thống
- Tạo và phân quyền tài khoản
- Quản lý danh sách trường, môn học
- Đăng ký, đăng nhập
- Phân quyền theo vai trò
- Ghi log hoạt động

## Phân quyền người dùng

- **Admin**: Toàn quyền quản trị hệ thống
- **Sở GD&ĐT**: Quản lý tuyển sinh, giám sát các trường
- **Hiệu trưởng**: Quản lý trường, duyệt điểm, học phí
- **Giáo viên chủ nhiệm**: Quản lý lớp, học sinh, điểm danh
- **Giáo viên bộ môn**: Nhập điểm, giao bài tập
- **Học sinh**: Xem điểm, bài tập, thông báo
- **Phụ huynh**: Theo dõi con em, xem thông báo

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Đã có file `.env` với các biến:
- `PORT`: Cổng chạy server (mặc định 3000)
- `MONGODB_URI`: URI kết nối MongoDB
- `JWT_SECRET`: Secret key cho JWT
- `JWT_EXPIRE`: Thời gian hết hạn JWT
- `SESSION_SECRET`: Secret key cho session

### 3. Khởi động MongoDB

Đảm bảo MongoDB đang chạy trên máy:

```bash
mongod
```

### 4. Seed dữ liệu mẫu

```bash
npm run seed
```

Dữ liệu mẫu bao gồm:
- Tài khoản admin, sở GD, hiệu trưởng, giáo viên, học sinh
- 2 trường học
- 10 môn học
- Lớp học, học sinh mẫu
- Hồ sơ tuyển sinh
- Thông báo

### 5. Chạy ứng dụng

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Truy cập: `http://localhost:3000`

## Tài khoản đăng nhập mẫu

Sau khi chạy seed data:

| Vai trò | Username | Password |
|---------|----------|----------|
| Admin | admin | admin123 |
| Sở GD&ĐT | sogd | sogd123 |
| Hiệu trưởng | hieutruong1 | hieutruong123 |
| Giáo viên | gvlan | giaovien123 |
| Học sinh | hs001 | hocsinh123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/profile` - Cập nhật thông tin cá nhân
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Students
- `GET /api/students` - Lấy danh sách học sinh
- `GET /api/students/:id` - Lấy thông tin học sinh
- `POST /api/students` - Thêm học sinh mới
- `PUT /api/students/:id` - Cập nhật học sinh
- `DELETE /api/students/:id` - Xóa học sinh
- `POST /api/students/transfer` - Chuyển lớp

### Grades
- `GET /api/grades` - Lấy danh sách điểm
- `GET /api/grades/:id` - Lấy thông tin điểm
- `POST /api/grades` - Thêm điểm
- `PUT /api/grades/:id` - Cập nhật điểm
- `PUT /api/grades/:id/approve` - Duyệt điểm
- `POST /api/grades/lock` - Khóa điểm
- `GET /api/grades/student/:studentId` - Lấy điểm của học sinh

### Enrollments
- `GET /api/enrollments` - Lấy danh sách hồ sơ tuyển sinh
- `POST /api/enrollments` - Tạo hồ sơ tuyển sinh
- `PUT /api/enrollments/:id` - Cập nhật hồ sơ
- `POST /api/enrollments/assign` - Phân bổ học sinh vào trường
- `POST /api/enrollments/auto-assign` - Tự động phân bổ
- `POST /api/enrollments/:id/confirm` - Xác nhận nhập học

### Attendance
- `GET /api/attendance` - Lấy danh sách điểm danh
- `POST /api/attendance` - Điểm danh đơn lẻ
- `POST /api/attendance/bulk` - Điểm danh hàng loạt
- `GET /api/attendance/statistics` - Thống kê điểm danh

### Payments
- `GET /api/payments` - Lấy danh sách khoản thu
- `POST /api/payments` - Tạo khoản thu
- `PUT /api/payments/:id` - Cập nhật thanh toán
- `GET /api/payments/student/:studentId/summary` - Tổng hợp học phí

### Announcements
- `GET /api/announcements` - Lấy danh sách thông báo
- `GET /api/announcements/:id` - Lấy chi tiết thông báo
- `POST /api/announcements` - Tạo thông báo
- `PUT /api/announcements/:id` - Cập nhật thông báo
- `DELETE /api/announcements/:id` - Xóa thông báo

## Models

### User
- Tài khoản đăng nhập
- Phân quyền theo vai trò
- Liên kết với Student/Teacher profile

### School
- Thông tin trường học
- Chỉ tiêu tuyển sinh

### Student
- Hồ sơ học sinh
- Thông tin cá nhân, gia đình
- Trạng thái học tập

### Teacher
- Hồ sơ giáo viên
- Trình độ, chuyên môn
- Phân công giảng dạy

### Class
- Thông tin lớp học
- Giáo viên chủ nhiệm
- Danh sách học sinh

### Subject
- Môn học
- Hệ số môn học

### Grade
- Điểm số học sinh
- Điểm thường xuyên, giữa kỳ, cuối kỳ
- Xếp loại, hạnh kiểm

### Enrollment
- Hồ sơ tuyển sinh
- Điểm thi, nguyện vọng
- Trạng thái phân bổ

### Attendance
- Điểm danh học sinh
- Lý do vắng mặt

### Payment
- Khoản thu học phí
- Trạng thái thanh toán
- Công nợ

### Announcement
- Thông báo
- Đối tượng nhận
- File đính kèm

### Assignment
- Bài tập
- Nộp bài
- Chấm điểm, nhận xét

### ActivityLog
- Ghi log hoạt động người dùng
- Theo dõi thay đổi

## Bảo mật

- Mật khẩu được hash bằng bcryptjs
- Xác thực bằng JWT
- Session-based authentication
- Role-based access control (RBAC)
- Ghi log mọi hoạt động quan trọng
- Validate input với express-validator

## Tác giả

Hệ thống quản lý trường THPT
