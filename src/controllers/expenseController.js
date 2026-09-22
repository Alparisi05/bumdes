const { Prisma } = require('@prisma/client');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { createExpenseSchema, updateExpenseSchema } = require('../validators/expenseValidator');

const createExpense = async (req, res, next) => {
  try {
    const validatedData = createExpenseSchema.parse(req.body);

    const category = await prisma.expenseCategory.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return errorResponse(res, 'Kategori pengeluaran tidak ditemukan', 404);
    }

    if (validatedData.periodeId) {
      const period = await prisma.plantingPeriod.findUnique({
        where: { id: validatedData.periodeId },
      });

      if (!period) {
        return errorResponse(res, 'Periode tanam tidak ditemukan', 404);
      }
    }

    const newExpense = await prisma.expense.create({
      data: {
        categoryId: validatedData.categoryId,
        deskripsi: validatedData.deskripsi,
        jumlah: validatedData.jumlah,
        periodeId: validatedData.periodeId || null,
        tanggal: validatedData.tanggal || new Date(),
        catatan: validatedData.catatan || null,
        userId: req.user.id,
      },
      include: {
        category: true,
        periode: true,
        user: {
          select: { id: true, nama: true, username: true },
        },
      },
    });

    return successResponse(res, newExpense, 'Pengeluaran berhasil dicatat', 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return errorResponse(res, 'Kategori pengeluaran atau periode tanam yang dipilih tidak valid', 400);
    }
    next(error);
  }
};

const getAllExpenses = async (req, res, next) => {
  try {
    const { start, end, categoryId, periodeId } = req.query;

    const where = {};

    if (categoryId) {
      const parsedCatId = parseInt(categoryId, 10);
      if (!isNaN(parsedCatId)) {
        where.categoryId = parsedCatId;
      }
    }

    if (periodeId) {
      const parsedPerId = parseInt(periodeId, 10);
      if (!isNaN(parsedPerId)) {
        where.periodeId = parsedPerId;
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

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { tanggal: 'desc' },
      include: {
        category: true,
        periode: true,
        user: {
          select: { id: true, nama: true, username: true },
        },
      },
    });

    return successResponse(res, expenses, 'Berhasil mengambil daftar pengeluaran');
  } catch (error) {
    next(error);
  }
};

const getExpenseById = async (req, res, next) => {
  try {
    const expenseId = parseInt(req.params.id, 10);
    if (isNaN(expenseId)) {
      return errorResponse(res, 'ID pengeluaran harus berupa angka valid', 400);
    }

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        category: true,
        periode: true,
        user: {
          select: { id: true, nama: true, username: true },
        },
      },
    });

    if (!expense) {
      return errorResponse(res, 'Pengeluaran tidak ditemukan', 404);
    }

    return successResponse(res, expense, 'Berhasil mengambil detail pengeluaran');
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expenseId = parseInt(req.params.id, 10);
    if (isNaN(expenseId)) {
      return errorResponse(res, 'ID pengeluaran harus berupa angka valid', 400);
    }

    const validatedData = updateExpenseSchema.parse(req.body);

    const existingExpense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!existingExpense) {
      return errorResponse(res, 'Pengeluaran tidak ditemukan', 404);
    }

    if (validatedData.categoryId) {
      const category = await prisma.expenseCategory.findUnique({
        where: { id: validatedData.categoryId },
      });
      if (!category) {
        return errorResponse(res, 'Kategori pengeluaran tidak ditemukan', 404);
      }
    }

    if (validatedData.periodeId) {
      const period = await prisma.plantingPeriod.findUnique({
        where: { id: validatedData.periodeId },
      });
      if (!period) {
        return errorResponse(res, 'Periode tanam tidak ditemukan', 404);
      }
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: validatedData,
      include: {
        category: true,
        periode: true,
        user: {
          select: { id: true, nama: true, username: true },
        },
      },
    });

    return successResponse(res, updatedExpense, 'Pengeluaran berhasil diperbarui');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return errorResponse(res, 'Pengeluaran tidak ditemukan', 404);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return errorResponse(res, 'Kategori pengeluaran atau periode tanam tidak valid', 400);
    }
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expenseId = parseInt(req.params.id, 10);
    if (isNaN(expenseId)) {
      return errorResponse(res, 'ID pengeluaran harus berupa angka valid', 400);
    }

    const existingExpense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!existingExpense) {
      return errorResponse(res, 'Pengeluaran tidak ditemukan', 404);
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return successResponse(res, null, 'Pengeluaran berhasil dihapus');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return errorResponse(res, 'Pengeluaran tidak ditemukan', 404);
    }
    next(error);
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
