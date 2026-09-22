const express = require('express');
const router = express.Router();
const plantingPeriodController = require('../controllers/plantingPeriodController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { Role } = require('../utils/constants');

router.use(authMiddleware, roleMiddleware(Role.ADMIN));

/**
 * @route   GET /api/planting-periods
 * @desc    Mendapatkan semua daftar periode tanam (diurutkan dari yang terbaru)
 * @access  Private (ADMIN Only)
 */
router.get('/', plantingPeriodController.getAllPlantingPeriods);

/**
 * @route   GET /api/planting-periods/:id
 * @desc    Mendapatkan detail periode tanam berdasarkan ID
 * @access  Private (ADMIN Only)
 */
router.get('/:id', plantingPeriodController.getPlantingPeriodById);

/**
 * @route   POST /api/planting-periods
 * @desc    Menambahkan periode tanam baru
 * @access  Private (ADMIN Only)
 */
router.post('/', plantingPeriodController.createPlantingPeriod);

/**
 * @route   PUT /api/planting-periods/:id
 * @desc    Memperbarui data periode tanam
 * @access  Private (ADMIN Only)
 */
router.put('/:id', plantingPeriodController.updatePlantingPeriod);

/**
 * @route   DELETE /api/planting-periods/:id
 * @desc    Menghapus periode tanam (jika belum ada pengeluaran terkait)
 * @access  Private (ADMIN Only)
 */
router.delete('/:id', plantingPeriodController.deletePlantingPeriod);

module.exports = router;
