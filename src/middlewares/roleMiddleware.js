const { errorResponse } = require('../utils/response');

/**
 * Middleware untuk otorisasi berdasarkan Role User
 * @param  {...string} allowedRoles - Daftar role yang diperbolehkan (misal: 'ADMIN', 'KASIR')
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Autentikasi diperlukan', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res, 
        `Akses ditolak. Fitur ini hanya dapat diakses oleh role: ${allowedRoles.join(', ')}`, 
        403
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
