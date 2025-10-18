// app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// =====================
// Khởi tạo DB
// =====================
global.db = require('./config/database'); // db là pool, dùng trực tiếp trong model

// =====================
// Khởi tạo Express
// =====================
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// =====================
// Router Thời Khóa Biểu
// =====================
const ThoiKhoaBieuController = require('./controllers/ThoiKhoaBieuController');
const tkbRouter = express.Router();

// Render giao diện lập TKB
tkbRouter.get('/render', (req, res) => ThoiKhoaBieuController.renderPage(req, res));
// Lấy TKB theo lớp và tuần
tkbRouter.post('/getAll', (req, res) => ThoiKhoaBieuController.getAll(req, res));
// Thêm mới TKB
tkbRouter.post('/create', (req, res) => ThoiKhoaBieuController.create(req, res));
// Cập nhật TKB
tkbRouter.post('/update', (req, res) => ThoiKhoaBieuController.update(req, res));
// Xóa TKB tuần
tkbRouter.post('/resetWeek', (req, res) => ThoiKhoaBieuController.resetWeek(req, res));

app.use('/api/thoikhoabieu', tkbRouter);

// Trang mặc định redirect sang render
app.get('/', (req, res) => res.redirect('/api/thoikhoabieu/render'));

// =====================
// Server
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
