const { z } = require('zod');

const stockInSchema = z.object({
  productId: z.number({
    required_error: 'Product ID wajib diisi',
    invalid_type_error: 'Product ID harus berupa angka',
  }).int('Product ID harus berupa bilangan bulat'),
  jumlahKg: z.number({
    required_error: 'Jumlah (kg) wajib diisi',
    invalid_type_error: 'Jumlah (kg) harus berupa angka',
  }).int('Jumlah (kg) harus berupa bilangan bulat').gt(0, 'Jumlah (kg) harus lebih besar dari 0'),
  keterangan: z.string().optional().nullable(),
});

module.exports = {
  stockInSchema,
};
