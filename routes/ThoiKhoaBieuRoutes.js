const express = require('express');
const ThoiKhoaBieuController = require('../controllers/ThoiKhoaBieuController');
const router = express.Router();

router.get('/render', (req,res)=>ThoiKhoaBieuController.renderPage(req,res));
router.post('/getAll', (req,res)=>ThoiKhoaBieuController.getAll(req,res));
router.post('/getKyHocList', (req,res)=>ThoiKhoaBieuController.getKyHocList(req,res));
router.post('/getTeacher', (req,res)=>ThoiKhoaBieuController.getTeacher(req,res));
router.post('/saveAll', (req,res)=>ThoiKhoaBieuController.saveAll(req,res));
router.post('/resetWeek', (req,res)=>ThoiKhoaBieuController.resetWeek(req,res));

module.exports = router;
