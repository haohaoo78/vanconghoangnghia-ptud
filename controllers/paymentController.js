const Payment = require('../models/Payment');

exports.getAllPayments = async (req, res) => {
  try {
    const { student, academicYear, status } = req.query;

    let query = {};
    if (student) query.student = student;
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('student', 'studentCode fullName')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createPayment = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;

    const payment = await Payment.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tạo khoản thu thành công',
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản thu',
      });
    }

    if (req.body.paid !== undefined) {
      payment.paid = req.body.paid;
      payment.paymentDate = Date.now();
      payment.paymentMethod = req.body.paymentMethod;
    }

    if (req.body.note) payment.note = req.body.note;

    await payment.save();

    res.json({
      success: true,
      message: 'Cập nhật thanh toán thành công',
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStudentPaymentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    const query = { student: studentId };
    if (academicYear) query.academicYear = academicYear;

    const payments = await Payment.find(query);

    const summary = {
      totalAmount: 0,
      totalPaid: 0,
      totalDebt: 0,
      payments: payments,
    };

    payments.forEach(payment => {
      summary.totalAmount += payment.amount;
      summary.totalPaid += payment.paid;
      summary.totalDebt += payment.debt;
    });

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
