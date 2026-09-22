const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { Role } = require('../utils/constants');

router.use(authMiddleware, roleMiddleware(Role.ADMIN));

/**
 * @route   POST /api/expenses
 * @desc    Mencatat pengeluaran operasional / musim tanam baru
 * @access  Private (ADMIN Only)
 */
router.post('/', expenseController.createExpense);

/**
 * @route   GET /api/expenses
 * @desc    Mendapatkan daftar pengeluaran (Support filter: ?start=&end=&categoryId=&periodeId=)
 * @access  Private (ADMIN Only)
 */
router.get('/', expenseController.getAllExpenses);

/**
 * @route   GET /api/expenses/:id
 * @desc    Mendapatkan detail pengeluaran berdasarkan ID
 * @access  Private (ADMIN Only)
 */
router.get('/:id', expenseController.getExpenseById);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Memperbarui data pengeluaran
 * @access  Private (ADMIN Only)
 */
router.put('/:id', expenseController.updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Menghapus data pengeluaran
 * @access  Private (ADMIN Only)
 */
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
