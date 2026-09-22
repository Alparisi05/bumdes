const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const {
  createProductSchema,
  updateProductSchema,
  updateHargaSchema,
} = require('../validators/productValidator');

const getAllProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' },
    });
    return successResponse(res, products, 'Berhasil mengambil daftar produk');
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return errorResponse(res, 'ID produk harus berupa angka valid', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse(res, 'Produk tidak ditemukan', 404);
    }

    return successResponse(res, product, 'Berhasil mengambil detail produk');
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const validatedData = createProductSchema.parse(req.body);

    const existingProduct = await prisma.product.findUnique({
      where: { nama: validatedData.nama },
    });

    if (existingProduct) {
      return errorResponse(res, 'Nama produk sudah ada / duplikat', 400);
    }

    const newProduct = await prisma.product.create({
      data: validatedData,
    });

    return successResponse(res, newProduct, 'Produk berhasil ditambahkan', 201);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return errorResponse(res, 'ID produk harus berupa angka valid', 400);
    }

    const validatedData = updateProductSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse(res, 'Produk tidak ditemukan', 404);
    }

    if (validatedData.nama && validatedData.nama !== product.nama) {
      const duplicateName = await prisma.product.findFirst({
        where: {
          nama: validatedData.nama,
          NOT: { id: productId },
        },
      });

      if (duplicateName) {
        return errorResponse(res, 'Nama produk sudah digunakan oleh produk lain', 400);
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: validatedData,
    });

    return successResponse(res, updatedProduct, 'Produk berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

const updateHarga = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return errorResponse(res, 'ID produk harus berupa angka valid', 400);
    }

    const validatedData = updateHargaSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse(res, 'Produk tidak ditemukan', 404);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        hargaPerKg: validatedData.hargaPerKg,
      },
    });

    return successResponse(res, updatedProduct, 'Harga produk berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return errorResponse(res, 'ID produk harus berupa angka valid', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!product) {
      return errorResponse(res, 'Produk tidak ditemukan', 404);
    }

    if (product._count.items > 0) {
      return errorResponse(
        res,
        'Produk tidak dapat dihapus karena sudah memiliki riwayat transaksi',
        400
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return successResponse(res, null, 'Produk berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateHarga,
  deleteProduct,
};