const express = require('express');
const router = express.Router();
const DuyetYeuCauSuaDiemController = require('../controllers/DuyetYeuCauSuaDiemController');

router.get('/render', DuyetYeuCauSuaDiemController.renderPage);
router.post('/getLopTheoKhoi', DuyetYeuCauSuaDiemController.getLopTheoKhoi);
router.post('/getRequests', DuyetYeuCauSuaDiemController.getRequests);
router.post('/updateStatus', DuyetYeuCauSuaDiemController.updateStatus);

module.exports = router;
