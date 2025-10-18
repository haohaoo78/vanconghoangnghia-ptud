// app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// =====================
// Kết nối Database
// =====================
global.db = require('./config/database');

// =====================
// Khởi tạo Express
// =====================
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// =====================
// Import Router
// =====================
const thoiKhoaBieuRouter = require('./routes/ThoiKhoaBieuRoutes');

// Dẫn route Thời Khóa Biểu
app.use('/api/thoikhoabieu', thoiKhoaBieuRouter);

// =====================
// Trang mặc định
// =====================
app.get('/', (req, res) => res.redirect('/api/thoikhoabieu/render'));

// =====================
// Server
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại: http://localhost:${PORT}`);
});
