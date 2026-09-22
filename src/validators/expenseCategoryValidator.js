const { z } = require('zod');

const createExpenseCategorySchema = z.object({
  nama: z.string({
    required_error: 'Nama kategori pengeluaran wajib diisi',
  }).min(2, 'Nama kategori pengeluaran minimal 2 karakter'),
  deskripsi: z.string().optional().nullable(),
});

const updateExpenseCategorySchema = z.object({
  nama: z.string().min(2, 'Nama kategori pengeluaran minimal 2 karakter').optional(),
  deskripsi: z.string().optional().nullable(),
});

module.exports = {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
};
