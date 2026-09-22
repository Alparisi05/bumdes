const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses database seeding...\n');

  console.log('👤 --- Seeding Users ---');
  const usersToSeed = [
    { nama: 'Administrator BUMDes', username: 'admin', rawPassword: 'admin123', role: 'ADMIN' },
    { nama: 'Kasir BUMDes', username: 'kasir', rawPassword: 'kasir123', role: 'KASIR' },
    { nama: 'Siska Kasir', username: 'siska', rawPassword: 'siska123', role: 'KASIR' },
  ];

  for (const userData of usersToSeed) {
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.rawPassword, 10);
      const user = await prisma.user.create({
        data: {
          nama: userData.nama,
          username: userData.username,
          password: hashedPassword,
          role: userData.role,
        },
      });
      console.log(`  ✅ User dibuat: ${user.username} (${user.role}) - Nama: ${user.nama}`);
    } else {
      console.log(`  ℹ️ User (${userData.username}) sudah ada, melewatinya...`);
    }
  }

  console.log('\n🍈 --- Seeding Products (Varian Melon) ---');
  const productsToSeed = [
    { nama: 'Sweet Hami', hargaPerKg: 30000, stokKg: 0 },
    { nama: 'Honey Globe', hargaPerKg: 35000, stokKg: 0 },
    { nama: 'Sweet Net', hargaPerKg: 30000, stokKg: 0 },
    { nama: 'Luna', hargaPerKg: 32000, stokKg: 0 },
  ];

  for (const productData of productsToSeed) {
    const product = await prisma.product.upsert({
      where: { nama: productData.nama },
      update: {},
      create: productData,
    });
    console.log(`  ✅ Produk di-seed: ${product.nama} - Rp ${product.hargaPerKg}/kg (Stok: ${product.stokKg}kg)`);
  }

  console.log('\n💸 --- Seeding Expense Categories ---');
  const categoriesToSeed = [
    { nama: 'Bibit', deskripsi: 'Pengeluaran untuk pembelian bibit tanaman' },
    { nama: 'Pupuk AB Mix', deskripsi: 'Pengeluaran untuk racikan nutrisi dan pupuk AB Mix' },
    { nama: 'Pajak Listrik', deskripsi: 'Biaya listrik operasional greenhouse' },
    { nama: 'Promosi & Packaging', deskripsi: 'Biaya kemasan, stiker, dan pemasaran' },
    { nama: 'Upah Tenaga Kerja', deskripsi: 'Gaji dan honorarium pekerja kebun/greenhouse' },
  ];

  for (const categoryData of categoriesToSeed) {
    const category = await prisma.expenseCategory.upsert({
      where: { nama: categoryData.nama },
      update: {},
      create: categoryData,
    });
    console.log(`  ✅ Kategori Pengeluaran di-seed: ${category.nama}`);
  }

  console.log('\n🌱 --- Seeding Planting Period ---');
  const periodNama = 'Musim Tanam Januari-Maret 2025';
  const existingPeriod = await prisma.plantingPeriod.findFirst({
    where: { nama: periodNama },
  });

  if (!existingPeriod) {
    const period = await prisma.plantingPeriod.create({
      data: {
        nama: periodNama,
        tanggalMulai: new Date('2025-01-01T00:00:00.000Z'),
        tanggalSelesai: new Date('2025-03-31T23:59:59.000Z'),
        catatan: 'Periode tanam awal tahun 2025 di Greenhouse BUMDes',
      },
    });
    console.log(`  ✅ Periode Tanam dibuat: "${period.nama}" (${period.tanggalMulai.toISOString().split('T')[0]} s/d ${period.tanggalSelesai.toISOString().split('T')[0]})`);
  } else {
    console.log(`  ℹ️ Periode Tanam ("${periodNama}") sudah ada, melewatinya...`);
  }

  console.log('\n✨ Database seeding selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });