const { Prisma } = require('@prisma/client');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
} = require('../validators/expenseCategoryValidator');

const getAllExpenseCategories = async (req, res, next) => {
  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { nama: 'asc' },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    return successResponse(res, categories, 'Berhasil mengambil daftar kategori pengeluaran');
  } catch (error) {
    next(error);
  }
};

const getExpenseCategoryById = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
      return errorResponse(res, 'ID kategori pengeluaran harus berupa angka valid', 400);
    }

    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    if (!category) {
      return errorResponse(res, 'Kategori pengeluaran tidak ditemukan', 404);
    }

    return successResponse(res, category, 'Berhasil mengambil detail kategori pengeluaran');
  } catch (error) {
    next(error);
  }
};

const createExpenseCategory = async (req, res, next) => {
  try {
    const validatedData = createExpenseCategorySchema.parse(req.body);

    const existingCategory = await prisma.expenseCategory.findUnique({
      where: { nama: validatedData.nama },
    });

    if (existingCategory) {
      return errorResponse(res, 'Nama kategori pengeluaran sudah ada / duplikat', 400);
    }

    const newCategory = await prisma.expenseCategory.create({
      data: validatedData,
    });

    return successResponse(res, newCategory, 'Kategori pengeluaran berhasil ditambahkan', 201);
  } catch (error) {
    // Handle Prisma Error P2002 (Unique violation)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse(res, 'Nama kategori pengeluaran sudah ada / duplikat', 400);
    }
    next(error);
  }
};

const updateExpenseCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
      return errorResponse(res, 'ID kategori pengeluaran harus berupa angka valid', 400);
    }

    const validatedData = updateExpenseCategorySchema.parse(req.body);

    const existingCategory = await prisma.expenseCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return errorResponse(res, 'Kategori pengeluaran tidak ditemukan', 404);
    }

    if (validatedData.nama && validatedData.nama !== existingCategory.nama) {
      const duplicateCategory = await prisma.expenseCategory.findFirst({
        where: {
          nama: validatedData.nama,
          NOT: { id: categoryId },
        },
      });

      if (duplicateCategory) {
        return errorResponse(res, 'Nama kategori pengeluaran sudah digunakan oleh kategori lain', 400);
      }
    }

    const updatedCategory = await prisma.expenseCategory.update({
      where: { id: categoryId },
      data: validatedData,
    });

    return successResponse(res, updatedCategory, 'Kategori pengeluaran berhasil diperbarui');
  } catch (error) {
    // Handle Prisma Error P2002 (Unique violation)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse(res, 'Nama kategori pengeluaran sudah digunakan oleh kategori lain', 400);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return errorResponse(res, 'Kategori pengeluaran tidak ditemukan', 404);
    }
    next(error);
  }
};

const deleteExpenseCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
      return errorResponse(res, 'ID kategori pengeluaran harus berupa angka valid', 400);
    }

    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    if (!category) {
      return errorResponse(res, 'Kategori pengeluaran tidak ditemukan', 404);
    }

    if (category._count.expenses > 0) {
      return errorResponse(
        res,
        'Kategori tidak bisa dihapus karena masih ada pengeluaran terkait',
        400
      );
    }

    await prisma.expenseCategory.delete({
      where: { id: categoryId },
    });

    return successResponse(res, null, 'Kategori pengeluaran berhasil dihapus');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return errorResponse(
        res,
        'Kategori tidak bisa dihapus karena masih ada pengeluaran terkait',
        400
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return errorResponse(res, 'Kategori pengeluaran tidak ditemukan', 404);
    }
    next(error);
  }
};

module.exports = {
  getAllExpenseCategories,
  getExpenseCategoryById,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
};
