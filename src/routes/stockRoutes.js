const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { Role } = require('../utils/constants');

router.use(authMiddleware, roleMiddleware(Role.ADMIN, Role.KASIR));

/**
 * @route   POST /api/stock/in
 * @desc    Mencatat stok masuk (hasil panen) secara atomik
 * @access  Private (ADMIN, KASIR)
 */
router.post('/in', stockController.stockIn);

/**
 * @route   GET /api/stock/movements
 * @desc    Mendapatkan riwayat pergerakan stok (Support query: ?productId=&tipe=&start=&end=)
 * @access  Private (ADMIN, KASIR)
 */
router.get('/movements', stockController.getStockMovements);

/**
 * @route   GET /api/stock/current
 * @desc    Mendapatkan daftar seluruh produk varian melon beserta stok saat ini
 * @access  Private (ADMIN, KASIR)
 */
router.get('/current', stockController.getCurrentStock);

module.exports = router;
