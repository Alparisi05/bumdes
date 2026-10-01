const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { Role } = require('../utils/constants');

router.use(authMiddleware, roleMiddleware(Role.ADMIN));

/**
 * @route   GET /api/reports/sales
 * @desc    Mendapatkan laporan penjualan (Support filter: ?start=YYYY-MM-DD&end=YYYY-MM-DD)
 * @access  Private (ADMIN Only)
 */
router.get('/sales', reportController.getSalesReport);

/**
 * @route   GET /api/reports/expenses
 * @desc    Mendapatkan laporan pengeluaran (Support filter: ?start=&end=&categoryId=&periodeId=)
 * @access  Private (ADMIN Only)
 */
router.get('/expenses', reportController.getExpensesReport);

/**
 * @route   GET /api/reports/profit-loss
 * @desc    Mendapatkan laporan laba rugi (Support filter: ?start=YYYY-MM-DD&end=YYYY-MM-DD)
 * @access  Private (ADMIN Only)
 */
router.get('/profit-loss', reportController.getProfitLossReport);

/**
 * @route   GET /api/reports/dashboard
 * @desc    Mendapatkan ringkasan statistik dashboard realtime
 * @access  Private (ADMIN Only)
 */
router.get('/dashboard', reportController.getDashboardOverview);

module.exports = router;
