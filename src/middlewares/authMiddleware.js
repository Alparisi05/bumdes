const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { errorResponse } = require('../utils/response');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Akses ditolak. Token autentikasi tidak ditemukan', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Akses ditolak. Format token tidak valid', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bumdes_melon_super_secret_key_123');

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'User dari token ini sudah tidak ditemukan di sistem', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token autentikasi telah kadaluwarsa, silakan login kembali', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Token autentikasi tidak valid', 401);
    }
    return next(error);
  }
};

module.exports = authMiddleware;
