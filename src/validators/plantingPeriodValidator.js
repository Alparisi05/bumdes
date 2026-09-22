const { z } = require('zod');

const createPlantingPeriodSchema = z.object({
  nama: z.string({
    required_error: 'Nama periode tanam wajib diisi',
  }).min(3, 'Nama periode tanam minimal 3 karakter'),
  tanggalMulai: z.coerce.date({
    required_error: 'Tanggal mulai wajib diisi',
    invalid_type_error: 'Format tanggal mulai tidak valid (contoh format: 2025-01-01)',
  }),
  tanggalSelesai: z.coerce.date({
    required_error: 'Tanggal selesai wajib diisi',
    invalid_type_error: 'Format tanggal selesai tidak valid (contoh format: 2025-03-31)',
  }),
  catatan: z.string().optional().nullable(),
}).refine((data) => data.tanggalSelesai > data.tanggalMulai, {
  message: 'Tanggal selesai harus setelah tanggal mulai',
  path: ['tanggalSelesai'],
});

const updatePlantingPeriodSchema = z.object({
  nama: z.string().min(3, 'Nama periode tanam minimal 3 karakter').optional(),
  tanggalMulai: z.coerce.date({
    invalid_type_error: 'Format tanggal mulai tidak valid',
  }).optional(),
  tanggalSelesai: z.coerce.date({
    invalid_type_error: 'Format tanggal selesai tidak valid',
  }).optional(),
  catatan: z.string().optional().nullable(),
}).refine((data) => {
  if (data.tanggalMulai && data.tanggalSelesai) {
    return data.tanggalSelesai > data.tanggalMulai;
  }
  return true;
}, {
  message: 'Tanggal selesai harus setelah tanggal mulai',
  path: ['tanggalSelesai'],
});

module.exports = {
  createPlantingPeriodSchema,
  updatePlantingPeriodSchema,
};
