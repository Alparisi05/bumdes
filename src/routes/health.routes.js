const express = require('express');
const router = express.Router();
const { successResponse } = require('../utils/response');

/**
 * @route GET /api/health
 * @desc  Health check endpoint
 */
router.get('/', (req, res) => {
  return successResponse(res, {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, 'Service BUMDes Budidaya Melon beroperasi dengan baik');
});

module.exports = router;
