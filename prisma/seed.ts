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

  const leader4 = await prisma.user.upsert({
    where: { cardNumber: '445566' },
    update: {},
    create: {
      cardNumber: '445566',
      name: 'Ahmad Fauzi',
      role: Role.ANZEN_LEADER,
      passwordHash: anzenPasswordHash,
      companyName: 'PT Duta Sarana Tehnik',
    },
  });

  const leader5 = await prisma.user.upsert({
    where: { cardNumber: '778899' },
    update: {},
    create: {
      cardNumber: '778899',
      name: 'Hendra Wijaya',
      role: Role.ANZEN_LEADER,
      passwordHash: anzenPasswordHash,
      companyName: 'PT Karya Metal Mandiri',
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

  // 3. Clear existing attendance records before seeding
  await prisma.attendanceRecord.deleteMany();

  // Helper date function
  const now = new Date();
  const getDateOffset = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // 4. Seed Diverse Attendance Records (Ongoing Projects + Completed + Past History)
  const seedRecords = [
    // --- [ONGOING PROJECTS TODAY] (Jam kerja aktif siang/sore ini) ---
    {
      userId: leader1.id,
      companyName: leader1.companyName || 'PT Multi Karya Mandiri',
      anzenLeaderName: leader1.name,
      cardNumber: leader1.cardNumber || '123456',
      date: getDateOffset(0),
      projectName: 'Instalasi Konveyor Line 3',
      locationDetail: 'Assembly Plant Sunter 1',
      manpowerCount: 6,
      userDepartment: 'Production Engineering',
      workStartTime: '08:00',
      workEndTime: '17:00',
      stop6Hazards: ['A. Terjepit mesin', 'E. Tersengat listrik'],
      preventiveControl: 'LOTO terpasang, sarung tangan isolasi listrik, APD lengkap',
    },
    {
      userId: leader2.id,
      companyName: leader2.companyName || 'PT Anzen Safety Mitra',
      anzenLeaderName: leader2.name,
      cardNumber: leader2.cardNumber || '654321',
      date: getDateOffset(0),
      projectName: 'Perbaikan Atap Gudang B',
      locationDetail: 'Gudang Logistik S1',
      manpowerCount: 4,
      userDepartment: 'Facility & Environment',
      workStartTime: '08:00',
      workEndTime: '16:30',
      stop6Hazards: ['D. Terjatuh dari ketinggian', 'F. Kontak benda panas'],
      preventiveControl: 'Full body harness dengan double lanyard, lifeline baja teruji, barikade perimeter',
    },
    {
      userId: leader3.id,
      companyName: leader3.companyName || 'PT Prima Konstruksi',
      anzenLeaderName: leader3.name,
      cardNumber: leader3.cardNumber || '112233',
      date: getDateOffset(0),
      projectName: 'Pengecatan & Coating Lantai Epoxy Press Shop',
      locationDetail: 'Press Plant Karawang 1',
      manpowerCount: 8,
      userDepartment: 'Maintenance Karawang',
      workStartTime: '07:30',
      workEndTime: '18:00',
      stop6Hazards: ['F. Kontak benda panas', 'A. Terjepit mesin'],
      preventiveControl: 'Masker respirator kimia, barikade area kerja, ventilasi blower aktif, safety shoes',
    },
    {
      userId: leader4.id,
      companyName: leader4.companyName || 'PT Duta Sarana Tehnik',
      anzenLeaderName: leader4.name,
      cardNumber: leader4.cardNumber || '445566',
      date: getDateOffset(0),
      projectName: 'Overhaul Pompa Sirkulasi Cooling Tower',
      locationDetail: 'Utility Plant Sunter 2',
      manpowerCount: 5,
      userDepartment: 'Plant Engineering Utility',
      workStartTime: '08:00',
      workEndTime: '17:30',
      stop6Hazards: ['E. Tersengat listrik', 'B. Tertimpa benda berat'],
      preventiveControl: 'Lock-Out Tag-Out (LOTO) breaker utama, lifting gear inspection, helm safety',
    },

    // --- [COMPLETED TODAY] (Shift pagi/subuh yang sudah selesai hari ini) ---
    {
      userId: leader5.id,
      companyName: leader5.companyName || 'PT Karya Metal Mandiri',
      anzenLeaderName: leader5.name,
      cardNumber: leader5.cardNumber || '778899',
      date: getDateOffset(0),
      projectName: 'Pembersihan Saluran Drainase Under-Pit',
      locationDetail: 'Casting Plant Karawang 2',
      manpowerCount: 3,
      userDepartment: 'Safety & Environment',
      workStartTime: '01:00',
      workEndTime: '06:00',
      stop6Hazards: ['D. Terjatuh dari ketinggian', 'C. Tertabrak kendaraan'],
      preventiveControl: 'Gas detector 4-in-1, tripod rescue winch, lampu penerangan portabel anti-ledak',
    },

    // --- [HISTORICAL RECORDS] (Histori hari-hari sebelumnya) ---
    {
      userId: leader1.id,
      companyName: leader1.companyName || 'PT Multi Karya Mandiri',
      anzenLeaderName: leader1.name,
      cardNumber: leader1.cardNumber || '123456',
      date: getDateOffset(1), // H-1
      projectName: 'Pemasangan Sensor Interlock Pintu Robot Welding',
      locationDetail: 'Welding Shop Sunter 1',
      manpowerCount: 4,
      userDepartment: 'Production Engineering',
      workStartTime: '08:00',
      workEndTime: '16:00',
      stop6Hazards: ['A. Terjepit mesin', 'E. Tersengat listrik'],
      preventiveControl: 'Safety interlock key, pemutusan daya kontrol robot, kacamata safety',
    },
    {
      userId: leader2.id,
      companyName: leader2.companyName || 'PT Anzen Safety Mitra',
      anzenLeaderName: leader2.name,
      cardNumber: leader2.cardNumber || '654321',
      date: getDateOffset(2), // H-2
      projectName: 'Relokasi Jalur Pipa Gas Argon Welding',
      locationDetail: 'Stamping Plant Sunter 2',
      manpowerCount: 6,
      userDepartment: 'Facility & Environment',
      workStartTime: '08:30',
      workEndTime: '17:00',
      stop6Hazards: ['F. Kontak benda panas', 'B. Tertimpa benda berat'],
      preventiveControl: 'Hot work permit disetujui, tabung APAR 6kg standby 2 unit, fire blanket',
    },
    {
      userId: leader3.id,
      companyName: leader3.companyName || 'PT Prima Konstruksi',
      anzenLeaderName: leader3.name,
      cardNumber: leader3.cardNumber || '112233',
      date: getDateOffset(3), // H-3
      projectName: 'Pengecoran Pondasi Mesin Machining Baru',
      locationDetail: 'Engine Plant Karawang 1',
      manpowerCount: 10,
      userDepartment: 'Production Engineering Engine',
      workStartTime: '08:00',
      workEndTime: '17:00',
      stop6Hazards: ['C. Tertabrak kendaraan', 'B. Tertimpa benda berat'],
      preventiveControl: 'Flagman pemandu truk mixer, barikade zona manuver kendaraan, rompi reflektif',
    },
    {
      userId: leader1.id,
      companyName: leader1.companyName || 'PT Multi Karya Mandiri',
      anzenLeaderName: leader1.name,
      cardNumber: leader1.cardNumber || '123456',
      date: getDateOffset(5), // H-5 (Sesuai referensi dokumen)
      projectName: 'buat meja',
      locationDetail: 'pgd',
      manpowerCount: 5,
      userDepartment: 'User Sunter 1',
      workStartTime: '08:00',
      workEndTime: '16:00',
      stop6Hazards: ['B. Tertimpa benda berat'],
      preventiveControl: 'full body harness, safety shoes, area dibarikade',
    },
    {
      userId: leader4.id,
      companyName: leader4.companyName || 'PT Duta Sarana Tehnik',
      anzenLeaderName: leader4.name,
      cardNumber: leader4.cardNumber || '445566',
      date: getDateOffset(7), // H-7
      projectName: 'Inspeksi & Uji Beban Overhead Crane Bay 4',
      locationDetail: 'Die Maintenance Sunter 1',
      manpowerCount: 4,
      userDepartment: 'Die Maintenance Division',
      workStartTime: '09:00',
      workEndTime: '16:00',
      stop6Hazards: ['B. Tertimpa benda berat', 'D. Terjatuh dari ketinggian'],
      preventiveControl: 'Rigger bersertifikasi Kemnaker, load cell terkalibrasi, area drop zone steril',
    },
    {
      userId: leader5.id,
      companyName: leader5.companyName || 'PT Karya Metal Mandiri',
      anzenLeaderName: leader5.name,
      cardNumber: leader5.cardNumber || '778899',
      date: getDateOffset(10), // H-10
      projectName: 'Penggantian Filter Dust Collector Furnace',
      locationDetail: 'Foundry Plant Karawang 2',
      manpowerCount: 7,
      userDepartment: 'Maintenance Casting',
      workStartTime: '08:00',
      workEndTime: '16:30',
      stop6Hazards: ['D. Terjatuh dari ketinggian', 'F. Kontak benda panas'],
      preventiveControl: 'Scaffolding bersertifikat green tag, APD tahan panas, body harness ganda',
    },
  ];

  for (const record of seedRecords) {
    await prisma.attendanceRecord.create({ data: record });
  }

  console.log(`--- Toyota Attendance Database Seed: Berhasil membuat ${seedRecords.length} data absensi beragam ---`);
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
