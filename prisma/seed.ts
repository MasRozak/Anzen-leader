import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('--- Starting Toyota Attendance Database Seed ---');

  // Password hashes
  const anzenPasswordHash = await bcrypt.hash('anzen123', 10);
  const staffPasswordHash = await bcrypt.hash('staff123', 10);

  // 1. Seed Anzen Leader Users
  const leader1 = await prisma.user.upsert({
    where: { cardNumber: '123456' },
    update: {},
    create: {
      cardNumber: '123456',
      name: 'Fia',
      role: Role.ANZEN_LEADER,
      passwordHash: anzenPasswordHash,
      companyName: 'PT Multi Karya Mandiri',
    },
  });

  const leader2 = await prisma.user.upsert({
    where: { cardNumber: '654321' },
    update: {},
    create: {
      cardNumber: '654321',
      name: 'Budi Santoso',
      role: Role.ANZEN_LEADER,
      passwordHash: anzenPasswordHash,
      companyName: 'PT Anzen Safety Mitra',
    },
  });

  const leader3 = await prisma.user.upsert({
    where: { cardNumber: '112233' },
    update: {},
    create: {
      cardNumber: '112233',
      name: 'Agus Prayitno',
      role: Role.ANZEN_LEADER,
      passwordHash: anzenPasswordHash,
      companyName: 'PT Prima Konstruksi',
    },
  });

  // 2. Seed Staff Internal Users
  await prisma.user.upsert({
    where: { username: 'staff_sunter1' },
    update: {},
    create: {
      username: 'staff_sunter1',
      name: 'Staff Sunter 1',
      role: Role.STAFF_INTERNAL,
      passwordHash: staffPasswordHash,
      department: 'User Sunter 1',
    },
  });

  await prisma.user.upsert({
    where: { username: 'staff_karawang' },
    update: {},
    create: {
      username: 'staff_karawang',
      name: 'Safety Specialist Karawang',
      role: Role.STAFF_INTERNAL,
      passwordHash: staffPasswordHash,
      department: 'Safety Division',
    },
  });

  // 3. Seed Sample Attendances
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);
  pastDate.setHours(0, 0, 0, 0);

  // Sample past record for Fia (as shown in reference PDF: "buat meja", "pgd", 5 MP)
  await prisma.attendanceRecord.create({
    data: {
      userId: leader1.id,
      companyName: 'PT Multi Karya Mandiri',
      anzenLeaderName: 'Fia',
      cardNumber: '123456',
      date: pastDate,
      projectName: 'buat meja',
      locationDetail: 'pgd',
      manpowerCount: 5,
      userDepartment: 'User Sunter 1',
      workStartTime: '08:00',
      workEndTime: '16:00',
      stop6Hazards: ['B. Tertimpa benda berat'],
      preventiveControl: 'full body harness, safety shoes, area dibarikade',
    },
  });

  // Sample record today (currently active: 08:00 - 17:00)
  await prisma.attendanceRecord.create({
    data: {
      userId: leader1.id,
      companyName: 'PT Multi Karya Mandiri',
      anzenLeaderName: 'Fia',
      cardNumber: '123456',
      date: today,
      projectName: 'Instalasi Konveyor Line 3',
      locationDetail: 'Assembly Plant Sunter 1',
      manpowerCount: 6,
      userDepartment: 'Production Engineering',
      workStartTime: '08:00',
      workEndTime: '17:00',
      stop6Hazards: ['A. Terjepit mesin', 'E. Tersengat listrik'],
      preventiveControl: 'LOTO terpasang, sarung tangan isolasi, APD lengkap',
    },
  });

  // Sample record today for Budi Santoso
  await prisma.attendanceRecord.create({
    data: {
      userId: leader2.id,
      companyName: 'PT Anzen Safety Mitra',
      anzenLeaderName: 'Budi Santoso',
      cardNumber: '654321',
      date: today,
      projectName: 'Perbaikan Atap Gudang B',
      locationDetail: 'Gudang Logistik S1',
      manpowerCount: 4,
      userDepartment: 'Facility & Environment',
      workStartTime: '08:30',
      workEndTime: '16:30',
      stop6Hazards: ['D. Terjatuh dari ketinggian', 'F. Kontak benda panas'],
      preventiveControl: 'Full body harness dengan double lanyard, lifeline teruji',
    },
  });

  console.log('--- Toyota Attendance Database Seed Completed Successfully ---');
}

if (process.env.NODE_ENV !== 'test') {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
