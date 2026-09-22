const { z } = require('zod');

const createExpenseSchema = z.object({
  categoryId: z.number({
    required_error: 'Category ID wajib diisi',
    invalid_type_error: 'Category ID harus berupa angka',
  }).int('Category ID harus berupa bilangan bulat'),
  deskripsi: z.string({
    required_error: 'Deskripsi pengeluaran wajib diisi',
  }).min(3, 'Deskripsi pengeluaran minimal 3 karakter'),
  jumlah: z.number({
    required_error: 'Jumlah pengeluaran wajib diisi',
    invalid_type_error: 'Jumlah pengeluaran harus berupa angka',
  }).int('Jumlah pengeluaran harus berupa bilangan bulat').gt(0, 'Jumlah pengeluaran harus lebih besar dari 0'),
  periodeId: z.number({
    invalid_type_error: 'Periode ID harus berupa angka',
  }).int('Periode ID harus berupa bilangan bulat').optional().nullable(),
  tanggal: z.coerce.date({
    invalid_type_error: 'Format tanggal pengeluaran tidak valid',
  }).optional().default(() => new Date()),
  catatan: z.string().optional().nullable(),
});

const updateExpenseSchema = z.object({
  categoryId: z.number({
    invalid_type_error: 'Category ID harus berupa angka',
  }).int('Category ID harus berupa bilangan bulat').optional(),
  deskripsi: z.string().min(3, 'Deskripsi pengeluaran minimal 3 karakter').optional(),
  jumlah: z.number({
    invalid_type_error: 'Jumlah pengeluaran harus berupa angka',
  }).int('Jumlah pengeluaran harus berupa bilangan bulat').gt(0, 'Jumlah pengeluaran harus lebih besar dari 0').optional(),
  periodeId: z.number({
    invalid_type_error: 'Periode ID harus berupa angka',
  }).int('Periode ID harus berupa bilangan bulat').optional().nullable(),
  tanggal: z.coerce.date({
    invalid_type_error: 'Format tanggal pengeluaran tidak valid',
  }).optional(),
  catatan: z.string().optional().nullable(),
});

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
};
