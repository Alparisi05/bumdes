const prisma = require('../utils/prisma');
const { successResponse } = require('../utils/response');


const getDateRange = (start, end) => {
  const now = new Date();
  let startDate, endDate;

  if (start) {
    startDate = new Date(`${start}T00:00:00.000Z`);
  } else {
    // Default: Tanggal 1 bulan ini
    startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
  }

  if (end) {
    endDate = new Date(`${end}T23:59:59.999Z`);
  } else {
    // Default: Hari terakhir bulan ini
    endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));
  }

  return { startDate, endDate };
};


const getSalesReport = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const { startDate, endDate } = getDateRange(start, end);

    const transactionWhere = {
      tanggal: {
        gte: startDate,
        lte: endDate,
      },
    };

    const salesAggregate = await prisma.transaction.aggregate({
      where: transactionWhere,
      _sum: { total: true },
      _count: { id: true },
    });

    const totalPenjualanRp = salesAggregate._sum.total || 0;
    const jumlahTransaksi = salesAggregate._count.id || 0;

    const itemAggregate = await prisma.transactionItem.aggregate({
      where: {
        transaction: transactionWhere,
      },
      _sum: { beratKg: true },
    });
    const totalKgTerjual = itemAggregate._sum.beratKg || 0;

    const itemsGrouped = await prisma.transactionItem.groupBy({
      by: ['productId'],
      where: {
        transaction: transactionWhere,
      },
      _sum: {
        beratKg: true,
        subtotal: true,
      },
    });

    const products = await prisma.product.findMany({
      select: { id: true, nama: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p.nama]));

    const breakdownVarian = itemsGrouped.map((item) => ({
      productId: item.productId,
      namaProduk: productMap.get(item.productId) || 'Produk Lain',
      totalKg: item._sum.beratKg || 0,
      totalRp: item._sum.subtotal || 0,
    }));

    const transactions = await prisma.transaction.findMany({
      where: transactionWhere,
      select: {
        id: true,
        tanggal: true,
        total: true,
        items: {
          select: { beratKg: true },
        },
      },
      orderBy: { tanggal: 'asc' },
    });

    const dailyMap = new Map();
    transactions.forEach((tx) => {
      const dateStr = tx.tanggal.toISOString().split('T')[0];
      const txKg = tx.items.reduce((acc, curr) => acc + curr.beratKg, 0);

      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { tanggal: dateStr, jumlahTransaksi: 0, totalKg: 0, totalRp: 0 });
      }
      const dayData = dailyMap.get(dateStr);
      dayData.jumlahTransaksi += 1;
      dayData.totalKg += txKg;
      dayData.totalRp += tx.total;
    });

    const detailPerHari = Array.from(dailyMap.values());

    return successResponse(res, {
      periode: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      totalKgTerjual,
      totalPenjualanRp,
      jumlahTransaksi,
      breakdownVarian,
      detailPerHari,
    }, 'Berhasil mengambil laporan penjualan');
  } catch (error) {
    next(error);
  }
};

const getExpensesReport = async (req, res, next) => {
  try {
    const { start, end, categoryId, periodeId } = req.query;
    const { startDate, endDate } = getDateRange(start, end);

    const expenseWhere = {
      tanggal: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (categoryId) {
      const parsedCatId = parseInt(categoryId, 10);
      if (!isNaN(parsedCatId)) expenseWhere.categoryId = parsedCatId;
    }

    if (periodeId) {
      const parsedPerId = parseInt(periodeId, 10);
      if (!isNaN(parsedPerId)) expenseWhere.periodeId = parsedPerId;
    }

    const expenseAggregate = await prisma.expense.aggregate({
      where: expenseWhere,
      _sum: { jumlah: true },
      _count: { id: true },
    });

    const totalPengeluaranRp = expenseAggregate._sum.jumlah || 0;

    const categoryGrouped = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: expenseWhere,
      _sum: { jumlah: true },
      _count: { id: true },
    });

    const categories = await prisma.expenseCategory.findMany({
      select: { id: true, nama: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c.nama]));

    const breakdownKategori = categoryGrouped.map((c) => ({
      categoryId: c.categoryId,
      namaKategori: categoryMap.get(c.categoryId) || 'Kategori Lain',
      totalRp: c._sum.jumlah || 0,
      jumlahTransaksi: c._count.id || 0,
    }));

    const expenses = await prisma.expense.findMany({
      where: expenseWhere,
      orderBy: { tanggal: 'desc' },
      include: {
        category: { select: { id: true, nama: true } },
        periode: { select: { id: true, nama: true } },
        user: { select: { id: true, nama: true, username: true } },
      },
    });

    return successResponse(res, {
      periode: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      totalPengeluaranRp,
      jumlahTransaksi: expenseAggregate._count.id || 0,
      breakdownKategori,
      detailPengeluaran: expenses,
    }, 'Berhasil mengambil laporan pengeluaran');
  } catch (error) {
    next(error);
  }
};

const getProfitLossReport = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const { startDate, endDate } = getDateRange(start, end);

    const dateWhere = {
      tanggal: {
        gte: startDate,
        lte: endDate,
      },
    };

    const salesAggregate = await prisma.transaction.aggregate({
      where: dateWhere,
      _sum: { total: true },
    });
    const totalPenjualan = salesAggregate._sum.total || 0;

    const expenseAggregate = await prisma.expense.aggregate({
      where: dateWhere,
      _sum: { jumlah: true },
    });
    const totalPengeluaran = expenseAggregate._sum.jumlah || 0;

    const labaBersih = totalPenjualan - totalPengeluaran;

    return successResponse(res, {
      periode: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      totalPenjualan,
      totalPengeluaran,
      labaBersih,
      status: labaBersih >= 0 ? 'UNTUNG' : 'RUGI',
    }, 'Berhasil mengambil laporan laba rugi');
  } catch (error) {
    next(error);
  }
};

const getDashboardOverview = async (req, res, next) => {
  try {
    const now = new Date();
    
    const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));

    const monthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

    const todaySalesAgg = await prisma.transaction.aggregate({
      where: { tanggal: { gte: todayStart, lte: todayEnd } },
      _sum: { total: true },
    });
    const todayItemAgg = await prisma.transactionItem.aggregate({
      where: { transaction: { tanggal: { gte: todayStart, lte: todayEnd } } },
      _sum: { beratKg: true },
    });

    const penjualanHariIni = {
      totalRp: todaySalesAgg._sum.total || 0,
      totalKg: todayItemAgg._sum.beratKg || 0,
    };

    const todayExpenseAgg = await prisma.expense.aggregate({
      where: { tanggal: { gte: todayStart, lte: todayEnd } },
      _sum: { jumlah: true },
    });

    const pengeluaranHariIniRp = todayExpenseAgg._sum.jumlah || 0;

    const stokPerVarian = await prisma.product.findMany({
      select: { id: true, nama: true, stokKg: true, hargaPerKg: true },
      orderBy: { id: 'asc' },
    });

    const limaTransaksiTerakhir = await prisma.transaction.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: {
        user: { select: { id: true, nama: true } },
        _count: { select: { items: true } },
      },
    });

    const monthSalesAgg = await prisma.transaction.aggregate({
      where: { tanggal: { gte: monthStart, lte: monthEnd } },
      _sum: { total: true },
    });
    const monthItemAgg = await prisma.transactionItem.aggregate({
      where: { transaction: { tanggal: { gte: monthStart, lte: monthEnd } } },
      _sum: { beratKg: true },
    });

    const penjualanBulanIni = {
      totalRp: monthSalesAgg._sum.total || 0,
      totalKg: monthItemAgg._sum.beratKg || 0,
    };

    const monthExpenseAgg = await prisma.expense.aggregate({
      where: { tanggal: { gte: monthStart, lte: monthEnd } },
      _sum: { jumlah: true },
    });

    const pengeluaranBulanIniRp = monthExpenseAgg._sum.jumlah || 0;

    return successResponse(res, {
      penjualanHariIni,
      pengeluaranHariIniRp,
      stokPerVarian,
      limaTransaksiTerakhir,
      penjualanBulanIni,
      pengeluaranBulanIniRp,
    }, 'Berhasil mengambil ringkasan dashboard');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesReport,
  getExpensesReport,
  getProfitLossReport,
  getDashboardOverview,
};
