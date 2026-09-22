const { z } = require('zod');

const transactionItemSchema = z.object({
  productId: z.number({
    required_error: 'Product ID wajib diisi',
    invalid_type_error: 'Product ID harus berupa angka',
  }).int('Product ID harus berupa bilangan bulat'),
  beratKg: z.number({
    required_error: 'Berat (kg) wajib diisi',
    invalid_type_error: 'Berat (kg) harus berupa angka',
  }).int('Berat (kg) harus berupa bilangan bulat').gt(0, 'Berat (kg) harus lebih besar dari 0'),
});

const createTransactionSchema = z.object({
  items: z.array(transactionItemSchema, {
    required_error: 'Daftar item transaksi wajib diisi',
  }).min(1, 'Transaksi minimal harus berisi 1 item produk'),
  bayar: z.number({
    required_error: 'Jumlah pembayaran wajib diisi',
    invalid_type_error: 'Jumlah pembayaran harus berupa angka',
  }).int('Jumlah pembayaran harus berupa bilangan bulat').gt(0, 'Jumlah pembayaran harus lebih besar dari 0'),
  catatan: z.string().optional().nullable(),
});

module.exports = {
  createTransactionSchema,
};
