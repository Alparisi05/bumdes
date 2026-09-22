const { Prisma } = require('@prisma/client');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const {
  createPlantingPeriodSchema,
  updatePlantingPeriodSchema,
} = require('../validators/plantingPeriodValidator');

const getAllPlantingPeriods = async (req, res, next) => {
  try {
    const periods = await prisma.plantingPeriod.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    return successResponse(res, periods, 'Berhasil mengambil daftar periode tanam');
  } catch (error) {
    next(error);
  }
};

const getPlantingPeriodById = async (req, res, next) => {
  try {
    const periodId = parseInt(req.params.id, 10);
    if (isNaN(periodId)) {
      return errorResponse(res, 'ID periode tanam harus berupa angka valid', 400);
    }

    const period = await prisma.plantingPeriod.findUnique({
      where: { id: periodId },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    if (!period) {
      return errorResponse(res, 'Periode tanam tidak ditemukan', 404);
    }

    return successResponse(res, period, 'Berhasil mengambil detail periode tanam');
  } catch (error) {
    next(error);
  }
};

const createPlantingPeriod = async (req, res, next) => {
  try {
    const validatedData = createPlantingPeriodSchema.parse(req.body);

    const newPeriod = await prisma.plantingPeriod.create({
      data: validatedData,
    });

    return successResponse(res, newPeriod, 'Periode tanam berhasil ditambahkan', 201);
  } catch (error) {
    next(error);
  }
};

const updatePlantingPeriod = async (req, res, next) => {
  try {
    const periodId = parseInt(req.params.id, 10);
    if (isNaN(periodId)) {
      return errorResponse(res, 'ID periode tanam harus berupa angka valid', 400);
    }

    const validatedData = updatePlantingPeriodSchema.parse(req.body);

    const existingPeriod = await prisma.plantingPeriod.findUnique({
      where: { id: periodId },
    });

    if (!existingPeriod) {
      return errorResponse(res, 'Periode tanam tidak ditemukan', 404);
    }

    const effectiveStart = validatedData.tanggalMulai || existingPeriod.tanggalMulai;
    const effectiveEnd = validatedData.tanggalSelesai || existingPeriod.tanggalSelesai;

    if (effectiveEnd <= effectiveStart) {
      return errorResponse(res, 'Tanggal selesai harus setelah tanggal mulai', 400);
    }

    const updatedPeriod = await prisma.plantingPeriod.update({
      where: { id: periodId },
      data: validatedData,
    });

    return successResponse(res, updatedPeriod, 'Periode tanam berhasil diperbarui');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return errorResponse(res, 'Periode tanam tidak ditemukan', 404);
    }
    next(error);
  }
};

const deletePlantingPeriod = async (req, res, next) => {
  try {
    const periodId = parseInt(req.params.id, 10);
    if (isNaN(periodId)) {
      return errorResponse(res, 'ID periode tanam harus berupa angka valid', 400);
    }

    const period = await prisma.plantingPeriod.findUnique({
      where: { id: periodId },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    if (!period) {
      return errorResponse(res, 'Periode tanam tidak ditemukan', 404);
    }

    if (period._count.expenses > 0) {
      return errorResponse(
        res,
        'Periode tidak bisa dihapus karena masih ada pengeluaran terkait',
        400
      );
    }

    await prisma.plantingPeriod.delete({
      where: { id: periodId },
    });

    return successResponse(res, null, 'Periode tanam berhasil dihapus');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return errorResponse(
        res,
        'Periode tidak bisa dihapus karena masih ada pengeluaran terkait',
        400
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return errorResponse(res, 'Periode tanam tidak ditemukan', 404);
    }
    next(error);
  }
};

module.exports = {
  getAllPlantingPeriods,
  getPlantingPeriodById,
  createPlantingPeriod,
  updatePlantingPeriod,
  deletePlantingPeriod,
};
