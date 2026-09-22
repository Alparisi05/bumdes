const { Prisma } = require('@prisma/client');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { stockInSchema } = require('../validators/stockValidator');
const { TipeStok } = require('../utils/constants');

const stockIn = async (req, res, next) => {
  try {
    const validatedData = stockInSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      return errorResponse(res, 'Produk tidak ditemukan', 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // a. Tambahkan stokKg produk (increment)
      const updatedProduct = await tx.product.update({
        where: { id: validatedData.productId },
        data: {
          stokKg: { increment: validatedData.jumlahKg },
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: validatedData.productId,
          tipe: TipeStok.MASUK,
          jumlahKg: validatedData.jumlahKg,
          keterangan: validatedData.keterangan || 'Hasil panen masuk',
          userId: req.user.id,
        },
        include: {
          product: {
            select: { id: true, nama: true },
          },
          user: {
            select: { id: true, nama: true, username: true },
          },
        },
      });

      return {
        movement,
        stokTerbaru: updatedProduct.stokKg,
      };
    });

    return successResponse(res, result, 'Stok masuk (hasil panen) berhasil dicatat', 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return errorResponse(res, 'Produk tidak ditemukan', 404);
    }
    next(error);
  }
};

const getStockMovements = async (req, res, next) => {
  try {
    const { productId, tipe, start, end } = req.query;

    const where = {};

    if (productId) {
      const parsedId = parseInt(productId, 10);
      if (!isNaN(parsedId)) {
        where.productId = parsedId;
      }
    }

    if (tipe) {
      where.tipe = tipe.toUpperCase();
    }

    if (start || end) {
      where.tanggal = {};
      if (start) {
        where.tanggal.gte = new Date(start);
      }
      if (end) {
        where.tanggal.lte = new Date(end);
      }
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        product: {
          select: { id: true, nama: true, hargaPerKg: true },
        },
        user: {
          select: { id: true, nama: true, username: true },
        },
      },
    });

    return successResponse(res, movements, 'Berhasil mengambil riwayat pergerakan stok');
  } catch (error) {
    next(error);
  }
};

const getCurrentStock = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        nama: true,
        hargaPerKg: true,
        stokKg: true,
        createdAt: true,
      },
    });

    return successResponse(res, products, 'Berhasil mengambil daftar stok produk saat ini');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  stockIn,
  getStockMovements,
  getCurrentStock,
};
