const { z } = require('zod');

const createProductSchema = z.object({
  nama: z.string({
    required_error: 'Nama produk wajib diisi',
  }).min(2, 'Nama produk minimal 2 karakter'),
  hargaPerKg: z.number({
    required_error: 'Harga per kg wajib diisi',
    invalid_type_error: 'Harga per kg harus berupa angka',
  }).int('Harga per kg harus berupa bilangan bulat').gt(0, 'Harga per kg harus lebih besar dari 0'),
  stokKg: z.number({
    invalid_type_error: 'Stok kg harus berupa angka',
  }).int('Stok kg harus berupa bilangan bulat').min(0, 'Stok kg tidak boleh negatif').optional().default(0),
});

const updateProductSchema = z.object({
  nama: z.string().min(2, 'Nama produk minimal 2 karakter').optional(),
  hargaPerKg: z.number().int('Harga per kg harus berupa bilangan bulat').gt(0, 'Harga per kg harus lebih besar dari 0').optional(),
  stokKg: z.number().int('Stok kg harus berupa bilangan bulat').min(0, 'Stok kg tidak boleh negatif').optional(),
});

const updateHargaSchema = z.object({
  hargaPerKg: z.number({
    required_error: 'Harga per kg wajib diisi',
    invalid_type_error: 'Harga per kg harus berupa angka',
  }).int('Harga per kg harus berupa bilangan bulat').gt(0, 'Harga per kg harus lebih besar dari 0'),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  updateHargaSchema,
};
