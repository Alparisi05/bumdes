const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUser) {
      return errorResponse(res, 'Username sudah terdaftar, silakan gunakan username lain', 409);
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        nama: validatedData.nama,
        username: validatedData.username,
        password: hashedPassword,
        role: validatedData.role,
      },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(res, newUser, 'User berhasil didaftarkan', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (!user) {
      return errorResponse(res, 'Username atau password salah', 401);
    }

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Username atau password salah', 401);
    }

    const secretKey = process.env.JWT_SECRET || 'bumdes_melon_super_secret_key_123';
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      secretKey,
      { expiresIn: '1d' }
    );

    const userPayload = {
      id: user.id,
      nama: user.nama,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    };

    return successResponse(
      res,
      {
        token,
        user: userPayload,
      },
      'Login berhasil'
    );
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    return successResponse(res, req.user, 'Berhasil mengambil data profil user');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
