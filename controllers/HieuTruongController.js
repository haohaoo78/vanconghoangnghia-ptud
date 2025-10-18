// controllers/HieuTruongController.js
const { HieuTruong } = require('../models');

// ================== LẤY DANH SÁCH HIỆU TRƯỞNG ==================
exports.getHieuTruong = async (req, res) => {
  try {
    const { MaHieuTruong, MaTruong } = req.query;

    // Lọc dữ liệu theo query
    let filter = {};
    if (MaHieuTruong) filter.MaHieuTruong = MaHieuTruong;   // Theo ID
    if (MaTruong) filter.MaTruong = MaTruong;               // Theo trường

    const data = await HieuTruong.getAll(filter);

    if (MaHieuTruong && data.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hiệu trưởng với ID này' });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách hiệu trưởng' });
  }
};

// ================== LẤY 1 HIỆU TRƯỞNG THEO ID ==================
exports.getHieuTruongById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await HieuTruong.getAll({ MaHieuTruong: id });

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hiệu trưởng' });
    }

    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy hiệu trưởng theo ID' });
  }
};

// ================== LẤY HIỆU TRƯỞNG THEO TRƯỜNG ==================
exports.getHieuTruongByTruong = async (req, res) => {
  try {
    const { MaTruong } = req.params;
    const data = await HieuTruong.getAll({ MaTruong });

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hiệu trưởng cho trường này' });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy hiệu trưởng theo trường' });
  }
};
