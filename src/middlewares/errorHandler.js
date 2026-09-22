const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Log]:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 'Validasi data gagal', 400, formattedErrors);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = err.meta?.target ? ` (${err.meta.target})` : '';
      return errorResponse(res, `Data sudah ada / duplikat${target}`, 409);
    }
    if (err.code === 'P2025') {
      return errorResponse(res, 'Data tidak ditemukan', 404);
    }
    return errorResponse(res, `Database error: ${err.message}`, 400);
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Payload JSON tidak valid', 400);
  }

  if (err.statusCode) {
    return errorResponse(res, err.message || 'Terjadi kesalahan', err.statusCode);
  }

  const message = process.env.NODE_ENV === 'production' 
    ? 'Terjadi kesalahan pada server' 
    : err.message || 'Internal Server Error';

  return errorResponse(res, message, 500);
};

module.exports = errorHandler;
