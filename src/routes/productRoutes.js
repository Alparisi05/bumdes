const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { Role } = require('../utils/constants');

/**
 * @route   GET /api/products
 * @desc    Mendapatkan seluruh daftar produk (ADMIN & KASIR)
 * @access  Private (ADMIN, KASIR)
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(Role.ADMIN, Role.KASIR),
  productController.getAllProducts
);

/**
 * @route   GET /api/products/:id
 * @desc    Mendapatkan detail produk berdasarkan ID (ADMIN & KASIR)
 * @access  Private (ADMIN, KASIR)
 */
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN, Role.KASIR),
  productController.getProductById
);

/**
 * @route   POST /api/products
 * @desc    Menambahkan produk varian melon baru (Khusus ADMIN)
 * @access  Private (ADMIN Only)
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Memperbarui data produk lengkap (Khusus ADMIN)
 * @access  Private (ADMIN Only)
 */
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  productController.updateProduct
);

/**
 * @route   PATCH /api/products/:id/harga
 * @desc    Memperbarui harga per kg produk saja (Khusus ADMIN)
 * @access  Private (ADMIN Only)
 */
router.patch(
  '/:id/harga',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  productController.updateHarga
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Menghapus produk jika belum ada transaksi terkait (Khusus ADMIN)
 * @access  Private (ADMIN Only)
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(Role.ADMIN),
  productController.deleteProduct
);

module.exports = router;
