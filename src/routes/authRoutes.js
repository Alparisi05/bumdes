const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { Role } = require('../utils/constants');

/**
 * @route   POST /api/auth/login
 * @desc    Login user dan dapatkan JWT Token
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Mendapatkan profil data user yang sedang login
 * @access  Private (All Roles)
 */
router.get('/me', authMiddleware, authController.getMe);

/**
 * @route   POST /api/auth/register
 * @desc    Mendaftarkan user baru dalam sistem
 * @access  Private (ADMIN Only)
 */
router.post('/register', authMiddleware, roleMiddleware(Role.ADMIN), authController.register);

module.exports = router;
