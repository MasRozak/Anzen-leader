import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const SEED_CARD_NUMBERS = ['123456', '654321', '112233'];
export const SEED_USERNAMES = ['staff_sunter1', 'staff_karawang'];

export async function cleanDatabase() {
  console.log('--- Memulai pembersihan database Toyota Attendance ---');

  // 1. Hapus semua data absensi
  const deletedAttendances = await prisma.attendanceRecord.deleteMany();
  console.log(`[clean] Berhasil menghapus ${deletedAttendances.count} data absensi (attendance_records).`);

  // 2. Ambil user seed yang valid
  const seedUsers = await prisma.user.findMany({
    where: {
      OR: [
        { cardNumber: { in: SEED_CARD_NUMBERS } },
        { username: { in: SEED_USERNAMES } },
      ],
    },
    select: { id: true, name: true, role: true, cardNumber: true, username: true },
  });

  const seedUserIds = seedUsers.map((u) => u.id);

  // 3. Hapus semua user selain seed user
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: { notIn: seedUserIds },
    },
  });
  console.log(`[clean] Berhasil menghapus ${deletedUsers.count} user tambahan.`);

  console.log(`[clean] Database siap! Tersisa ${seedUsers.length} seed user aktif:`);
  for (const u of seedUsers) {
    const ident = u.cardNumber ? `No Kartu: ${u.cardNumber}` : `Username: ${u.username}`;
    console.log(`  - [${u.role}] ${u.name} (${ident})`);
  }

  if (seedUsers.length === 0) {
    console.log('[clean] Perhatian: Seed user belum ada di database. Jalankan "npm run db:seed" jika ingin membuat user awal.');
  }

  console.log('--- Pembersihan database selesai ---');
}

if (process.env.NODE_ENV !== 'test') {
  cleanDatabase()
    .catch((e) => {
      console.error('[clean] Error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
