const { Prisma } = require('@prisma/client');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { createTransactionSchema } = require('../validators/transactionValidator');
const { TipeStok } = require('../utils/constants');

const generateTransactionCode = async (tx) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const todayPrefix = `INV-${year}${month}${day}-`;

  const latestTransaction = await tx.transaction.findFirst({
    where: {
      kode: {
        startsWith: todayPrefix,
      },
    },
    orderBy: {
      kode: 'desc',
    },
    select: {
      kode: true,
    },
  });

  let sequence = 1;
  if (latestTransaction && latestTransaction.kode) {
    const lastSeqStr = latestTransaction.kode.replace(todayPrefix, '');
    const parsedSeq = parseInt(lastSeqStr, 10);
    if (!isNaN(parsedSeq)) {
      sequence = parsedSeq + 1;
    }
  }

  const sequenceStr = String(sequence).padStart(3, '0');
  return `${todayPrefix}${sequenceStr}`;
};

const createTransaction = async (req, res, next) => {
  try {
    const validatedData = createTransactionSchema.parse(req.body);

    const consolidatedMap = new Map();
    for (const item of validatedData.items) {
      if (consolidatedMap.has(item.productId)) {
        consolidatedMap.get(item.productId).beratKg += item.beratKg;
      } else {
        consolidatedMap.set(item.productId, { ...item });
      }
    }
    const items = Array.from(consolidatedMap.values());
    const productIds = items.map((i) => i.productId);

    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    const productMap = new Map();
    dbProducts.forEach((p) => productMap.set(p.id, p));

    for (const item of items) {
      if (!productMap.has(item.productId)) {
        return errorResponse(res, `Produk dengan ID ${item.productId} tidak ditemukan`, 404);
      }
    }

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (product.stokKg < item.beratKg) {
        return errorResponse(
          res,
          `Stok produk '${product.nama}' kurang. Stok tersedia: ${product.stokKg}kg, diminta: ${item.beratKg}kg`,
          400,
          {
            productId: product.id,
            namaProduk: product.nama,
            stokTersedia: product.stokKg,
            diminta: item.beratKg,
          }
        );
      }
    }

    let total = 0;
    const itemDetails = items.map((item) => {
      const product = productMap.get(item.productId);
      const hargaPerKgSnapshot = product.hargaPerKg;
      const subtotal = item.beratKg * hargaPerKgSnapshot;
      total += subtotal;

      return {
        productId: item.productId,
        beratKg: item.beratKg,
        hargaPerKg: hargaPerKgSnapshot,
        subtotal,
        namaProduk: product.nama,
      };
    });

    if (validatedData.bayar < total) {
      return errorResponse(
        res,
        `Jumlah pembayaran kurang. Total transaksi: Rp ${total.toLocaleString('id-ID')}, dibayar: Rp ${validatedData.bayar.toLocaleString('id-ID')}`,
        400,
        {
          total,
          bayar: validatedData.bayar,
          kekurangan: total - validatedData.bayar,
        }
      );
    }

    const kembalian = validatedData.bayar - total;

    const MAX_RETRIES = 3;
    let transactionResult = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        transactionResult = await prisma.$transaction(async (tx) => {
          const kode = await generateTransactionCode(tx);

          const newTransaction = await tx.transaction.create({
            data: {
              kode,
              total,
              bayar: validatedData.bayar,
              kembalian,
              userId: req.user.id,
              catatan: validatedData.catatan || null,
            },
          });

          const transactionItemsData = itemDetails.map((detail) => ({
            transactionId: newTransaction.id,
            productId: detail.productId,
            beratKg: detail.beratKg,
            hargaPerKg: detail.hargaPerKg,
            subtotal: detail.subtotal,
          }));

          await tx.transactionItem.createMany({
            data: transactionItemsData,
          });

          for (const detail of itemDetails) {
            await tx.product.update({
              where: { id: detail.productId },
              data: {
                stokKg: { decrement: detail.beratKg },
              },
            });

            await tx.stockMovement.create({
              data: {
                productId: detail.productId,
                tipe: TipeStok.KELUAR,
                jumlahKg: detail.beratKg,
                keterangan: `Penjualan ${kode}`,
                userId: req.user.id,
              },
            });
          }

          const fullTransaction = await tx.transaction.findUnique({
            where: { id: newTransaction.id },
            include: {
              user: {
                select: { id: true, nama: true, username: true, role: true },
              },
              items: {
                include: {
                  product: {
                    select: { id: true, nama: true, hargaPerKg: true },
                  },
                },
              },
            },
          });

          return fullTransaction;
        });

        break;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          if (attempt === MAX_RETRIES) {
            return errorResponse(res, 'Terjadi konflik kode transaksi (race condition), silakan coba lagi', 409);
          }
          continue;
        }
        throw err;
      }
    }

    return successResponse(res, transactionResult, 'Transaksi penjualan berhasil disimpan', 201);
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const { start, end, userId } = req.query;

    const where = {};

    if (userId) {
      const parsedUserId = parseInt(userId, 10);
      if (!isNaN(parsedUserId)) {
        where.userId = parsedUserId;
      }
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

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        user: {
          select: { id: true, nama: true, username: true, role: true },
        },
        _count: {
          select: { items: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, nama: true },
            },
          },
        },
      },
    });

    return successResponse(res, transactions, 'Berhasil mengambil daftar riwayat transaksi');
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const param = req.params.id;
    const parsedId = parseInt(param, 10);

    let whereCondition = {};
    if (!isNaN(parsedId)) {
      whereCondition = { id: parsedId };
    } else {
      whereCondition = { kode: param };
    }

    const transaction = await prisma.transaction.findUnique({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, nama: true, username: true, role: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, nama: true, hargaPerKg: true },
            },
          },
        },
      },
    });

    if (!transaction) {
      return errorResponse(res, 'Transaksi tidak ditemukan', 404);
    }

    return successResponse(res, transaction, 'Berhasil mengambil detail transaksi');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
};
