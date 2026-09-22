const { z } = require('zod');
const { Role } = require('../utils/constants');

const registerSchema = z.object({
  nama: z.string({
    required_error: 'Nama wajib diisi',
  }).min(2, 'Nama minimal 2 karakter'),
  username: z.string({
    required_error: 'Username wajib diisi',
  })
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore (_)'),
  password: z.string({
    required_error: 'Password wajib diisi',
  }).min(6, 'Password minimal 6 karakter'),
  role: z.enum([Role.ADMIN, Role.KASIR], {
    errorMap: () => ({ message: 'Role harus ADMIN atau KASIR' }),
  }).optional().default(Role.KASIR),
});

const loginSchema = z.object({
  username: z.string({
    required_error: 'Username wajib diisi',
  }).min(1, 'Username wajib diisi'),
  password: z.string({
    required_error: 'Password wajib diisi',
  }).min(1, 'Password wajib diisi'),
});

module.exports = {
  registerSchema,
  loginSchema,
};
