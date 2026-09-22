const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { Role } = require('../utils/constants');

router.use(authMiddleware, roleMiddleware(Role.ADMIN, Role.KASIR));

/**
 * @route   POST /api/transactions
 * @desc    Membuat transaksi penjualan baru (Kasir Multi-Varian)
 * @access  Private (ADMIN, KASIR)
 */
router.post('/', transactionController.createTransaction);

/**
 * @route   GET /api/transactions
 * @desc    Mendapatkan daftar riwayat transaksi (Support filter: ?start=&end=&userId=)
 * @access  Private (ADMIN, KASIR)
 */
router.get('/', transactionController.getAllTransactions);

/**
 * @route   GET /api/transactions/:id
 * @desc    Mendapatkan detail transaksi lengkap berdasarkan ID atau Kode Transaksi
 * @access  Private (ADMIN, KASIR)
 */
router.get('/:id', transactionController.getTransactionById);

module.exports = router;
