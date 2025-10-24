const express = require('express');
const router = express.Router();
const controller = require('../controllers/DuyetYeuCauSuaDiemController');

// Lấy dữ liệu page
router.get('/render', controller.renderPage.bind(controller));

// API lấy danh sách yêu cầu
router.post('/getRequests', controller.getRequests.bind(controller));

// API duyệt yêu cầu
router.post('/approve', controller.approveRequest.bind(controller));

module.exports = router;
