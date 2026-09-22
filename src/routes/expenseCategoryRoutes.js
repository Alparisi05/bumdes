const express = require('express');
const router = express.Router();
const expenseCategoryController = require('../controllers/expenseCategoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { Role } = require('../utils/constants');

router.use(authMiddleware, roleMiddleware(Role.ADMIN));

/**
 * @route   GET /api/expense-categories
 * @desc    Mendapatkan semua daftar kategori pengeluaran (diurutkan alfabetis A-Z)
 * @access  Private (ADMIN Only)
 */
router.get('/', expenseCategoryController.getAllExpenseCategories);

/**
 * @route   GET /api/expense-categories/:id
 * @desc    Mendapatkan detail kategori pengeluaran berdasarkan ID
 * @access  Private (ADMIN Only)
 */
router.get('/:id', expenseCategoryController.getExpenseCategoryById);

/**
 * @route   POST /api/expense-categories
 * @desc    Menambahkan kategori pengeluaran baru
 * @access  Private (ADMIN Only)
 */
router.post('/', expenseCategoryController.createExpenseCategory);

/**
 * @route   PUT /api/expense-categories/:id
 * @desc    Memperbarui data kategori pengeluaran
 * @access  Private (ADMIN Only)
 */
router.put('/:id', expenseCategoryController.updateExpenseCategory);

/**
 * @route   DELETE /api/expense-categories/:id
 * @desc    Menghapus kategori pengeluaran (jika belum ada pengeluaran terkait)
 * @access  Private (ADMIN Only)
 */
router.delete('/:id', expenseCategoryController.deleteExpenseCategory);

module.exports = router;
